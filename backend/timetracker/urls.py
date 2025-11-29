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
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

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

urlpatterns = [
    path('', home, name='home'),
    path('health/', health_check, name='health'),
    path('admin/', admin.site.urls),
    path('api/', include('tracker.urls')),
]
