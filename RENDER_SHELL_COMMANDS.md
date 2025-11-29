# Render Shell Commands - Copy and Paste These

## After clicking "Shell" tab in your Render web service, run:

```bash
# Navigate to backend directory
cd backend

# Run database migrations
python manage.py migrate

# Create admin superuser (interactive)
python manage.py createsuperuser

# Collect static files (optional, WhiteNoise handles this)
python manage.py collectstatic --noinput
```

## Expected Output:

After `migrate` you should see:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
  Applying tracker.0001_initial... OK
```

After `createsuperuser` it will ask:
```
Username: [enter your admin username]
Email: [enter your email]
Password: [enter password]
Password (again): [confirm password]
```

## ✅ After This:

Your admin panel will work at:
`https://your-app-name.onrender.com/admin/`

Login with the username and password you just created!
