import csv
import datetime
from django.http import HttpResponse
from django.db.models import Q, Count
from django.db.models.functions import TruncDay
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import LoginHistory
from .serializers import LoginHistorySerializer

class LoginHistoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = LoginHistory.objects.filter(user=user)

        # 1. Searching
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(ip_address__icontains=search_query) |
                Q(country__icontains=search_query) |
                Q(browser__icontains=search_query) |
                Q(device__icontains=search_query) |
                Q(user_agent__icontains=search_query)
            )

        # 2. Filtering
        status_filter = request.query_params.get('status', '').strip().lower()
        if status_filter == 'success':
            queryset = queryset.filter(is_success=True, threat_score__lt=0.5)
        elif status_filter == 'failed':
            queryset = queryset.filter(is_success=False)
        elif status_filter == 'suspicious':
            queryset = queryset.filter(is_success=True, threat_score__gte=0.5)

        # Filter by threat score range
        min_score = request.query_params.get('min_threat_score')
        if min_score is not None:
            try:
                queryset = queryset.filter(threat_score__gte=float(min_score))
            except ValueError:
                pass

        max_score = request.query_params.get('max_threat_score')
        if max_score is not None:
            try:
                queryset = queryset.filter(threat_score__lte=float(max_score))
            except ValueError:
                pass

        # Filter by country, browser, device if specified
        country_filter = request.query_params.get('country', '').strip()
        if country_filter:
            queryset = queryset.filter(country__iexact=country_filter)

        browser_filter = request.query_params.get('browser', '').strip()
        if browser_filter:
            queryset = queryset.filter(browser__iexact=browser_filter)

        device_filter = request.query_params.get('device', '').strip()
        if device_filter:
            queryset = queryset.filter(device__iexact=device_filter)

        # 3. Export to CSV (unpaginated)
        if request.query_params.get('export') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="login_history.csv"'
            writer = csv.writer(response)
            writer.writerow(['Time', 'Country', 'IP Address', 'Browser', 'Device', 'Threat Score', 'Status'])

            for log in queryset:
                if not log.is_success:
                    status_str = "FAILED"
                elif log.threat_score >= 0.5:
                    status_str = "2FA REQUIRED"
                else:
                    status_str = "SUCCESS"

                writer.writerow([
                    log.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    log.country,
                    log.ip_address,
                    log.browser,
                    log.device,
                    f"{log.threat_score:.4f}",
                    status_str
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
        serializer = LoginHistorySerializer(paginated_queryset, many=True)

        import math
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

        return Response({
            "results": serializer.data,
            "count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }, status=status.HTTP_200_OK)


class LoginHistoryStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = LoginHistory.objects.filter(user=user)

        # 1. Status Distribution
        total = queryset.count()
        failed = queryset.filter(is_success=False).count()
        suspicious = queryset.filter(is_success=True, threat_score__gte=0.5).count()
        success = queryset.filter(is_success=True, threat_score__lt=0.5).count()

        # 2. Country Breakdown (Top 5)
        countries = list(queryset.values('country').annotate(count=Count('id')).order_by('-count')[:5])

        # 3. Browser Breakdown (Top 5)
        browsers = list(queryset.values('browser').annotate(count=Count('id')).order_by('-count')[:5])

        # 4. Device Breakdown (Top 5)
        devices = list(queryset.values('device').annotate(count=Count('id')).order_by('-count')[:5])

        # 5. Timeline (Last 14 Days)
        start_date = timezone.now().date() - datetime.timedelta(days=13)
        
        # We query the database and group by date
        timeline_qs = queryset.filter(
            created_at__date__gte=start_date
        ).annotate(
            date=TruncDay('created_at')
        ).values('date', 'is_success', 'threat_score').annotate(
            count=Count('id')
        ).order_by('date')

        # To build a complete timeline including days with 0 events, we map dates in Python
        timeline_map = {}
        for i in range(14):
            day = start_date + datetime.timedelta(days=i)
            day_str = day.strftime('%Y-%m-%d')
            timeline_map[day_str] = {'success': 0, 'failed': 0, 'suspicious': 0}

        for item in timeline_qs:
            item_date = item['date']
            if isinstance(item_date, (datetime.datetime, datetime.date)):
                date_str = item_date.strftime('%Y-%m-%d')
            else:
                date_str = str(item_date)[:10]

            if date_str in timeline_map:
                count = item['count']
                if not item['is_success']:
                    timeline_map[date_str]['failed'] += count
                elif item['threat_score'] >= 0.5:
                    timeline_map[date_str]['suspicious'] += count
                else:
                    timeline_map[date_str]['success'] += count

        timeline = [
            {
                "date": date_str,
                "success": data['success'],
                "failed": data['failed'],
                "suspicious": data['suspicious']
            }
            for date_str, data in sorted(timeline_map.items())
        ]

        # Get list of unique countries, browsers, devices for dropdown filters
        filter_options = {
            "countries": [c['country'] for c in queryset.values('country').distinct() if c['country']],
            "browsers": [b['browser'] for b in queryset.values('browser').distinct() if b['browser']],
            "devices": [d['device'] for d in queryset.values('device').distinct() if d['device']]
        }

        return Response({
            "total_logins": total,
            "status_distribution": {
                "success": success,
                "failed": failed,
                "suspicious": suspicious
            },
            "countries": countries,
            "browsers": browsers,
            "devices": devices,
            "timeline": timeline,
            "filter_options": filter_options
        }, status=status.HTTP_200_OK)
