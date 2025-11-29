from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('week/current/', views.get_current_week, name='get_current_week'),
    path('week/save/', views.save_current_week, name='save_current_week'),
    path('week/history/', views.get_week_history, name='get_week_history'),
]
