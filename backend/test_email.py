import os
import sys

# Add the current directory to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from routes.utils import send_email

def test_config():
    app = create_app()
    with app.app_context():
        print("\n--- 📧 MCQ SYSTEM EMAIL TEST ---")
        recipient = input("Enter your email address to receive a test message: ").strip()
        
        if not recipient:
            print("❌ No email entered. Exiting.")
            return

        print(f"🔄 Attempting to send test email to {recipient}...")
        
        subject = "MCQ System - SMTP Test Email"
        body = "This is a test email from your MCQ Examination System. If you are reading this, your SMTP configuration is working perfectly!"
        
        success = send_email(subject, [recipient], body)
        
        if success:
            print("\n✅ SUCCESS! Check your inbox (and spam folder).")
        else:
            print("\n❌ FAILED. Check the console logs above for the error reason.")
            print("\nPossible reasons:")
            print("1. Your email/password in config.py is incorrect.")
            print("2. You didn't use a 'Gmail App Password'.")
            print("3. Your internet is blocking SMTP (port 587).")

if __name__ == "__main__":
    test_config()
