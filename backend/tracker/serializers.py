from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WeeklyTimeRecord


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class WeeklyTimeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyTimeRecord
        fields = ['id', 'user', 'week_start_date', 'week_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
