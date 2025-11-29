from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from tracker.models import WeeklyTimeRecord


class Command(BaseCommand):
    help = 'Create new empty week records for all users every Monday'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Check if today is Monday
        if today.weekday() != 0:
            self.stdout.write(self.style.WARNING(f'Today is not Monday (weekday: {today.weekday()})'))
            return
        
        # Get this Monday
        monday = WeeklyTimeRecord.get_monday_of_week(today)
        
        users = User.objects.all()
        created_count = 0
        skipped_count = 0
        
        for user in users:
            record, created = WeeklyTimeRecord.objects.get_or_create(
                user=user,
                week_start_date=monday,
                defaults={
                    'week_data': WeeklyTimeRecord.get_empty_week_data()
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created new week for user: {user.username}')
                )
            else:
                skipped_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nWeek reset complete! Created: {created_count}, Already existed: {skipped_count}'
            )
        )
