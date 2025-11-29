# Crontab configuration for weekly reset
# Add this line to your crontab (run `crontab -e`):
# 
# Run every Monday at 12:01 AM
# 1 0 * * 1 cd /home/semed/Documents/hour_calculator/backend && source venv/bin/activate && python manage.py create_weekly_records >> /tmp/weekly_reset.log 2>&1
#
# Or use Django-cron, Celery Beat, or APScheduler for more advanced scheduling
