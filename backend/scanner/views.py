import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.files.base import ContentFile
from .models import FileScan, CleanedFile
from .remediation import clean_file

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        filename = file_obj.name
        file_size = file_obj.size
        
        # Get extension
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        allowed_exts = ['pdf', 'zip', 'exe', 'docx']
        
        if ext not in allowed_exts:
            return Response({"error": f"Extension .{ext} not supported. Use PDF, ZIP, EXE, or DOCX."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate SHA256 and gather content for entropy
        sha256_hash = hashlib.sha256()
        file_obj.seek(0)
        content = file_obj.read()
        sha256_hash.update(content)
        file_hash = sha256_hash.hexdigest()

        # Check if this exact file matches a previously cleaned file
        is_previously_cleaned = CleanedFile.objects.filter(cleaned_file_hash=file_hash).exists()
        print(f"[SCAN TELEMETRY] File: {filename}, Size: {file_size} bytes, Hash: {file_hash}, Is Cleaned Whitelisted: {is_previously_cleaned}")

        # EICAR Test Hash
        EICAR_SHA256 = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"

        risk_score = 0
        malware_family = None

        if is_previously_cleaned:
            risk_score = 0
            malware_family = None
        elif file_hash.lower() == EICAR_SHA256:
            risk_score = 100
            malware_family = "EICAR-Test-File"
        else:
            # Check magic bytes for mismatch
            magic_bytes = content[:4] if len(content) >= 4 else b''
            if ext == 'exe' and not magic_bytes.startswith(b'MZ'):
                risk_score += 40  # Spoofed extension
            elif ext == 'pdf' and not magic_bytes.startswith(b'%PDF'):
                risk_score += 40
            elif ext == 'zip' and not magic_bytes.startswith(b'PK'):
                risk_score += 40

            # Calculate simple entropy to simulate packed executable detection
            if content:
                import math
                from collections import Counter
                p, lns = Counter(content), float(len(content))
                entropy = -sum(count/lns * math.log2(count/lns) for count in p.values())
                if ext == 'exe' and entropy > 7.5:
                    risk_score += 50  # Highly packed/encrypted
                    malware_family = "Packed.Generic"
                elif entropy > 7.8:
                    risk_score += 30

            # Penalize very large/small files abnormally
            if file_size > 50 * 1024 * 1024 or file_size < 100:
                risk_score += 15

        # Cap score
        risk_score = min(risk_score, 100)

        # Classification
        if risk_score < 30:
            classification = "SAFE"
            db_status = "CLEAN"
        elif risk_score <= 70:
            classification = "SUSPICIOUS"
            db_status = "SUSPICIOUS"
        else:
            classification = "DANGEROUS"
            db_status = "MALICIOUS"

        # Save to DB
        scan = FileScan.objects.create(
            user=request.user,
            file_name=filename,
            file_hash=file_hash,
            file_size=file_size,
            extension=ext,
            risk_score=risk_score,
            status=db_status,
            malware_family=malware_family
        )

        return Response({
            "id": scan.id,
            "file_name": filename,
            "file_size": file_size,
            "extension": ext,
            "file_hash": file_hash,
            "risk_score": risk_score,
            "classification": classification,
            "malware_family": malware_family
        }, status=status.HTTP_201_CREATED)


class FileCleanView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        scan_id = request.data.get('scan_id')

        if not file_obj:
            return Response({"error": "No file uploaded for cleaning."}, status=status.HTTP_400_BAD_REQUEST)
        if not scan_id:
            return Response({"error": "No original scan ID provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            scan = FileScan.objects.get(id=scan_id, user=request.user)
        except FileScan.DoesNotExist:
            return Response({"error": "Original scan record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Process the file in-memory
        file_obj.seek(0)
        content = file_obj.read()

        cleaned_content, stats = clean_file(content, scan.file_name, scan.extension)
        
        # Calculate cleaned file hash
        cleaned_hash = hashlib.sha256(cleaned_content).hexdigest()

        # Generate a clean filename: e.g. "cleaned_name.pdf" or "name_cleaned.pdf"
        filename_parts = scan.file_name.rsplit('.', 1)
        if len(filename_parts) == 2:
            clean_filename = f"{filename_parts[0]}_cleaned.{filename_parts[1]}"
        else:
            clean_filename = f"{scan.file_name}_cleaned"

        # Create ContentFile for Django FileField
        cleaned_file_obj = ContentFile(cleaned_content, name=clean_filename)

        # Create CleanedFile record
        cleaned_rec = CleanedFile.objects.create(
            user=request.user,
            original_scan=scan,
            file_name=clean_filename,
            threats_removed=stats['threats_removed'],
            javascript_removed=stats['javascript_removed'],
            hyperlinks_removed=stats['hyperlinks_removed'],
            embedded_objects_removed=stats['embedded_objects_removed'],
            metadata_removed=stats['metadata_removed'],
            cleaning_time_seconds=stats['cleaning_time_seconds'],
            status='Cleaned',
            cleaned_file_hash=cleaned_hash
        )
        # Save file to media folder
        cleaned_rec.cleaned_file.save(clean_filename, cleaned_file_obj, save=True)

        return Response({
            "id": cleaned_rec.id,
            "file_name": cleaned_rec.file_name,
            "threats_removed": cleaned_rec.threats_removed,
            "javascript_removed": cleaned_rec.javascript_removed,
            "hyperlinks_removed": cleaned_rec.hyperlinks_removed,
            "embedded_objects_removed": cleaned_rec.embedded_objects_removed,
            "metadata_removed": cleaned_rec.metadata_removed,
            "cleaning_time_seconds": cleaned_rec.cleaning_time_seconds,
            "status": cleaned_rec.status,
            "download_url": request.build_absolute_uri(cleaned_rec.cleaned_file.url),
            "created_at": cleaned_rec.created_at
        }, status=status.HTTP_201_CREATED)

