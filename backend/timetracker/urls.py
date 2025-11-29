"""
URL configuration for timetracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse, FileResponse
from django.db import connection
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

def home(request):
    return JsonResponse({
        'message': 'Weekly Hour Calculator API',
        'status': 'running',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'health': '/health/',
        }
    })

def health_check(request):
    """Check database connection and migrations"""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check if tables exist
        from django.contrib.auth.models import User
        user_count = User.objects.count()
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'users': user_count,
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'message': 'Database might not be migrated yet'
        }, status=500)

def serve_react_assets(request, path):
    """Serve React static assets"""
    import mimetypes
    asset_path = settings.BASE_DIR.parent / 'dist' / 'assets' / path
    if asset_path.exists() and asset_path.is_file():
        content_type, _ = mimetypes.guess_type(str(asset_path))
        return FileResponse(open(asset_path, 'rb'), content_type=content_type or 'application/octet-stream')
    return HttpResponse('Asset not found', status=404)

def serve_react(request, path=''):
    """Serve React app"""
    try:
        index_path = settings.BASE_DIR.parent / 'dist' / 'index.html'
        if index_path.exists():
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
        else:
            return JsonResponse({
                'error': 'Frontend not built yet',
                'message': 'React app is being built. Please wait a few minutes.',
                'status': 'building'
            })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

urlpatterns = [
    path('api-info/', home, name='api-info'),
    path('health/', health_check, name='health'),
    path('admin/', admin.site.urls),
    path('api/', include('tracker.urls')),
    # Serve React assets
    re_path(r'^assets/(?P<path>.*)$', serve_react_assets, name='react-assets'),
]

# Serve static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve React app for all other routes (must be last)
urlpatterns += [
    re_path(r'^.*$', serve_react, name='frontend'),
]
