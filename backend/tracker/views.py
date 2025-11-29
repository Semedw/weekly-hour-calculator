from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import WeeklyTimeRecord
from .serializers import WeeklyTimeRecordSerializer, UserSerializer


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not password:
        return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email or '', password=password)
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_user(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
    
    login(request, user)
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def logout_user(request):
    """Logout user"""
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_current_week(request):
    """Get the current week's time data for the logged-in user"""
    # For development, accept user_id from query params
    user_id = request.query_params.get('user_id')
    
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    elif request.user.is_authenticated:
        user = request.user
    else:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    record, created = WeeklyTimeRecord.get_or_create_current_week(user)
    serializer = WeeklyTimeRecordSerializer(record)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def save_current_week(request):
    """Save the current week's time data for the logged-in user"""
    # For development, accept user_id from body
    user_id = request.data.get('user_id')
    
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    elif request.user.is_authenticated:
        user = request.user
    else:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    week_data = request.data.get('week_data')
    if not week_data:
        return Response({'error': 'week_data is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    record, created = WeeklyTimeRecord.get_or_create_current_week(user)
    record.week_data = week_data
    record.save()
    
    serializer = WeeklyTimeRecordSerializer(record)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_week_history(request):
    """Get all historical weeks for the logged-in user"""
    user_id = request.query_params.get('user_id')
    
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    elif request.user.is_authenticated:
        user = request.user
    else:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    records = WeeklyTimeRecord.objects.filter(user=user)
    serializer = WeeklyTimeRecordSerializer(records, many=True)
    return Response(serializer.data)

