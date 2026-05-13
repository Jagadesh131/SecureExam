import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

SECRET_KEY = os.environ.get('SECRET_KEY', 'mcq-app-secret-key-change-in-production')
DATABASE = os.path.join(BASE_DIR, 'mcq_exam.db')
TEMP_PASSWORD = 'Temp@123'
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'

# Email Configuration (REQUIRED for Mail functionality)
# ======================================================
# To use Gmail, you MUST generate an "App Password":
# 1. Go to your Google Account (myaccount.google.com)
# 2. Search for "App Passwords"
# 3. Generate a password for "Mail" and "Windows Computer"
# 4. Copy the 16-character code and paste it below.

MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_SSL = False
MAIL_USE_TLS = True
MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'jagadesh.0116@gmail.com')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '') # Set this in your environment variables
MAIL_DEFAULT_SENDER = ('MCQ System', MAIL_USERNAME)
