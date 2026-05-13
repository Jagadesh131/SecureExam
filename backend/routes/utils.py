from flask import current_app
from flask_mail import Message
import logging

def send_email(subject, recipients, body, html=None):
    """
    Centralized helper to send emails via Flask-Mail.
    Falls back to terminal logging if SMTP is not properly configured.
    """
    try:
        # 1. Validation check for basic config
        mail_user = current_app.config.get('MAIL_USERNAME')
        mail_pass = current_app.config.get('MAIL_PASSWORD')
        
        # Check if placeholders are still present
        if not mail_user or 'your-email@gmail.com' in mail_user or not mail_pass or mail_pass == 'your-app-password':
            raise ValueError("SMTP Credentials not configured in config.py")

        # 2. Prepare message
        msg = Message(subject, recipients=recipients)
        msg.body = body
        if html:
            msg.html = html
        
        # 3. Send via Flask-Mail
        current_app.mail.send(msg)
        current_app.logger.info(f"✅ Email sent successfully to {recipients}")
        return True

    except Exception as e:
        # PREMIUM DEVELOPMENT FALLBACK
        header = "═" * 60
        sub = "─" * 60
        current_app.logger.warning(f"\n\033[93m{header}")
        current_app.logger.warning(f"║ {'⚠️  MAIL SYSTEM FALLBACK (EMAIL NOT SENT)':^56} ║")
        current_app.logger.warning(f"{header}")
        current_app.logger.warning(f"  REASON:   {str(e)}")
        current_app.logger.warning(f"  TO:       {recipients}")
        current_app.logger.warning(f"  SUBJECT:  {subject}")
        current_app.logger.warning(f"  {sub}")
        current_app.logger.warning(f"  CONTENT Preview:\n{body[:200]}...")
        current_app.logger.warning(f"{header}\033[0m\n")
        
        return False

def send_email_debug(subject, recipients, body, html=None):
    """
    Debug version of send_email that returns the actual error message.
    """
    try:
        mail_user = current_app.config.get('MAIL_USERNAME')
        mail_pass = current_app.config.get('MAIL_PASSWORD')
        
        if not mail_user or 'your-email@gmail.com' in mail_user or not mail_pass or mail_pass == 'your-app-password':
            return False, "SMTP Credentials not configured in config.py"

        msg = Message(subject, recipients=recipients)
        msg.body = body
        if html:
            msg.html = html
        
        current_app.mail.send(msg)
        return True, "Success"

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
