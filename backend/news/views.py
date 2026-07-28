from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import CyberNews
from .serializers import CyberNewsSerializer
import math
from rest_framework.response import Response

class NewsPagination(PageNumberPagination):
    page_size = 9
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': math.ceil(self.page.paginator.count / self.page_size),
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class CyberNewsListView(generics.ListAPIView):
    serializer_class = CyberNewsSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NewsPagination

    def get_queryset(self):
        queryset = CyberNews.objects.all().order_by('-published_date')
        
        category = self.request.query_params.get('category', None)
        if category and category != 'All':
            queryset = queryset.filter(category__iexact=category)
            
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset
