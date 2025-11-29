from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class WeeklyTimeRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_records')
    week_start_date = models.DateField(help_text="Monday of the week")
    week_data = models.JSONField(default=dict, help_text="Store all 7 days with sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'week_start_date')
        ordering = ['-week_start_date']

    def __str__(self):
        return f"{self.user.username} - Week of {self.week_start_date}"

    @staticmethod
    def get_monday_of_week(date=None):
        """Get the Monday of the current or given week"""
        if date is None:
            date = timezone.now().date()
        # Get Monday (0 = Monday)
        days_since_monday = date.weekday()
        monday = date - timezone.timedelta(days=days_since_monday)
        return monday

    @classmethod
    def get_or_create_current_week(cls, user):
        """Get or create the record for the current week"""
        monday = cls.get_monday_of_week()
        record, created = cls.objects.get_or_create(
            user=user,
            week_start_date=monday,
            defaults={
                'week_data': cls.get_empty_week_data()
            }
        )
        return record, created

    @staticmethod
    def get_empty_week_data():
        """Return empty week data structure"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return [
            {
                'day': day,
                'sessions': [{'checkIn': '', 'checkOut': ''}]
            }
            for day in days
        ]

