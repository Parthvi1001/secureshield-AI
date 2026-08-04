import csv
import datetime
from django.http import HttpResponse
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from scanner.models import FileScan

class LoginHistoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get all file scans sorted chronologically (newest first)
        queryset = FileScan.objects.filter(user=user).order_by('-created_at')

        # 1. Searching by File Name
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(file_name__icontains=search_query)

        # 2. Filtering by Status
        status_filter = request.query_params.get('status', '').strip().upper()
        if status_filter:
            # Map frontend status filters if needed
            if status_filter in ['SAFE', 'CLEAN']:
                queryset = queryset.filter(status='CLEAN')
            elif status_filter in ['SUSPICIOUS']:
                queryset = queryset.filter(status='SUSPICIOUS')
            elif status_filter in ['DANGEROUS', 'MALICIOUS', 'THREAT']:
                queryset = queryset.filter(status='MALICIOUS')

        # 3. Export to CSV (unpaginated)
        if request.query_params.get('export') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="scanned_files_history.csv"'
            writer = csv.writer(response)
            writer.writerow(['Scan Time', 'File Name', 'File Type', 'File Size (Bytes)', 'Risk Score', 'Classification', 'Malware Family'])

            for scan in queryset:
                writer.writerow([
                    scan.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    scan.file_name,
                    scan.extension.upper(),
                    scan.file_size,
                    f"{scan.risk_score}/100",
                    scan.status,
                    scan.malware_family or 'None'
                ])
            return response

        # 4. Pagination
        total_count = queryset.count()
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 10
        except ValueError:
            page = 1
            page_size = 10

        start = (page - 1) * page_size
        end = start + page_size
        paginated_queryset = queryset[start:end]

        results = []
        for scan in paginated_queryset:
            # Check if cleaned version exists
            cleaned_version = scan.cleaned_versions.first()
            download_url = None
            if cleaned_version:
                download_url = request.build_absolute_uri(cleaned_version.cleaned_file.url)

            results.append({
                "id": scan.id,
                "file_name": scan.file_name,
                "extension": scan.extension,
                "file_hash": scan.file_hash,
                "file_size": scan.file_size,
                "risk_score": scan.risk_score,
                "status": scan.status,
                "malware_family": scan.malware_family,
                "created_at": scan.created_at.isoformat(),
                "download_url": download_url,
                "threats_removed": cleaned_version.threats_removed if cleaned_version else 0,
                "javascript_removed": cleaned_version.javascript_removed if cleaned_version else False,
                "hyperlinks_removed": cleaned_version.hyperlinks_removed if cleaned_version else False,
                "embedded_objects_removed": cleaned_version.embedded_objects_removed if cleaned_version else False,
                "metadata_removed": cleaned_version.metadata_removed if cleaned_version else False,
            })

        import math
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

        return Response({
            "results": results,
            "count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }, status=status.HTTP_200_OK)


class LoginHistoryStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return a simple mock file scan distribution report for safety / compatibility
        user = request.user
        queryset = FileScan.objects.filter(user=user)
        total = queryset.count()
        clean = queryset.filter(status='CLEAN').count()
        suspicious = queryset.filter(status='SUSPICIOUS').count()
        malicious = queryset.filter(status='MALICIOUS').count()

        return Response({
            "total_logins": total,
            "status_distribution": {
                "success": clean,
                "failed": malicious,
                "suspicious": suspicious
            },
            "countries": [],
            "browsers": [],
            "devices": [],
            "timeline": [],
            "filter_options": { "countries": [], "browsers": [], "devices": [] }
        }, status=status.HTTP_200_OK)
