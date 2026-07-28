import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import FileScan

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

        # EICAR Test Hash
        EICAR_SHA256 = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"

        risk_score = 0
        malware_family = None

        if file_hash.lower() == EICAR_SHA256:
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
