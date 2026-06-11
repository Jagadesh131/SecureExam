from flask import current_app
from flask_mail import Message
import logging

import urllib.request
import urllib.error
import json

def send_email(subject, recipients, body, html=None):
    """
    Centralized helper to send emails via Brevo HTTP API.
    Bypasses strict cloud SMTP firewalls (like Render).
    """
    try:
        # 1. Validation check
        mail_user = current_app.config.get('MAIL_USERNAME')
        mail_pass = current_app.config.get('MAIL_PASSWORD')
        
        if not mail_user or 'your-email@gmail.com' in mail_user or not mail_pass or mail_pass == 'your-app-password':
            raise ValueError("SMTP/API Credentials not configured in config.py")

        # 2. Prepare payload for Brevo API
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": mail_pass,
            "content-type": "application/json"
        }
        
        to_list = [{"email": r} for r in recipients]
        payload = {
            "sender": {"name": "SecureExam", "email": mail_user},
            "to": to_list,
            "subject": subject,
            "textContent": body
        }
        if html:
            payload["htmlContent"] = html
            
        data = json.dumps(payload).encode("utf-8")

        # 3. Send via HTTP POST
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            current_app.logger.info(f"✅ Email sent via HTTP API to {recipients}")
            return True

    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8')
        current_app.logger.error(f"❌ Brevo API Error: {error_msg}")
        return False
    except Exception as e:
        current_app.logger.error(f"❌ Failed to send email: {str(e)}")
        return False

def send_email_debug(subject, recipients, body, html=None):
    """
    Debug version of send_email that returns the actual error message.
    """
    import urllib.request
    import urllib.error
    import json
    
    try:
        mail_user = current_app.config.get('MAIL_USERNAME')
        mail_pass = current_app.config.get('MAIL_PASSWORD')
        
        if not mail_user or 'your-email@gmail.com' in mail_user or not mail_pass or mail_pass == 'your-app-password':
            return False, "SMTP Credentials not configured in config.py"

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": mail_pass,
            "content-type": "application/json"
        }
        
        to_list = [{"email": r} for r in recipients]
        payload = {
            "sender": {"name": "SecureExam", "email": mail_user},
            "to": to_list,
            "subject": subject,
            "textContent": body
        }
        if html:
            payload["htmlContent"] = html
            
        data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            return True, "Success"

    except urllib.error.HTTPError as e:
        return False, f"Brevo API Error: {e.code} - {e.read().decode('utf-8')}"
    except Exception as e:
        return False, str(e)

def get_network_ip():
    """Helper to find the local network IP address."""
    import socket
    # Method 1: Connection to external (most reliable for multiple interfaces)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and ip != "127.0.0.1": return ip
    except:
        pass

    # Method 2: Hostname lookup
    try:
        host_name = socket.gethostname()
        ip_list = socket.gethostbyname_ex(host_name)[2]
        for ip in ip_list:
            if not ip.startswith("127."):
                return ip
    except:
        pass

    return "127.0.0.1"
