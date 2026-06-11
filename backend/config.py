import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

SECRET_KEY = os.environ.get('SECRET_KEY', 'mcq-app-secret-key-change-in-production')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE')
DATABASE = os.path.join(BASE_DIR, 'mcq_exam.db')
TEMP_PASSWORD = 'Temp@123'
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'

# Email Configuration (Supports Brevo, SendGrid, Gmail, etc.)
# ======================================================
# Set these in your Cloud Provider's Environment Variables
MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp-relay.brevo.com')
MAIL_PORT = int(os.environ.get('MAIL_PORT', 465))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'False') == 'True'
MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'True') == 'True'

MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'jagadesh.0116@gmail.com')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'YOUR_BREVO_SMTP_KEY_HERE') 
MAIL_DEFAULT_SENDER = ('MCQ System', MAIL_USERNAME)
