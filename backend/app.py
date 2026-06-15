from flask import Flask, redirect, url_for, render_template, request, jsonify
from flask_mail import Mail
from flask_cors import CORS
from database import init_db
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

"""
MCQ Examination System - Main Application Entry Point
Architecture: 3-Tier (Presentation, Application, Data)
- Presentation: templates/ and static/
- Application: routes/ (Admin, Faculty, Student blueprints)
- Data: database.py and SQLite
"""

def create_app():
    # Initialize Flask Application
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    
    # Load configuration from config.py
    app.config.from_pyfile('config.py')
    app.secret_key = app.config.get('SECRET_KEY', 'mcq-secret-key-123')

    # Initialize Flask-Mail
    mail = Mail(app)
    app.mail = mail

    # Configure Premium Logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR) # Quiet the static file noise
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )
    app.logger.info("🚀 MCQ System Initializing...")

    # Initialize MySQL Database
    with app.app_context():
        init_db()

    # Register Blueprints (Separation of Concerns)
    from routes.admin_routes import admin_bp
    from routes.faculty_routes import faculty_bp
    from routes.student_routes import student_bp
    from routes.api_routes import api_bp

    app.register_blueprint(admin_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(api_bp)

    # Root Route - Redirects to Welcome Screen
    @app.route('/')
    def welcome():
        from datetime import datetime
        return render_template('welcome.html', now=datetime.now())

    @app.route('/index')
    def index_redirect():
        return redirect(url_for('welcome'))

    # Global Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        # Only show exam_not_found for exam-related URLs
        if request.path.startswith('/exam/'):
            return render_template('student/exam_not_found.html'), 404
        return f"Page not found: {request.path}", 404

    @app.errorhandler(500)
    def internal_server_error(e):
        app.logger.error(f"Server Error: {e}")
        return f"Internal Server Error: {str(e)}", 500

    @app.context_processor
    def inject_server_info():
        import socket
        try:
            # Get local IP address
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
        except:
            ip = "127.0.0.1"
        return {'SERVER_IP': ip}

    @app.route('/report-cheating', methods=['POST'])
    @app.route('/report-cheating-beacon', methods=['POST'])
    def report_cheating():
        from datetime import datetime
        if request.is_json:
            data = request.get_json(silent=True) or {}
        else:
            # Handle beacon (usually text/plain)
            try:
                import json
                data = json.loads(request.data.decode('utf-8'))
            except:
                data = {}

        # Use absolute path for log file (works on cloud)
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cheating_log.txt')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"{datetime.now()} - Exam: {data.get('exam_code', 'N/A')}, Student: {data.get('student_name', 'Unknown')}, Reason: {data.get('reason', 'N/A')}\n")
        return jsonify({'success': True})

    @app.route('/test-email')
    def test_email_route():
        from routes.utils import send_email_debug
        recipient = app.config.get('MAIL_USERNAME')
        subject = "MCQ System - Debug Test"
        body = "If you can see this, your email settings are finally working!"
        
        success, error_msg = send_email_debug(subject, [recipient], body)
        
        if success:
            return f"""
            <div style='font-family: sans-serif; text-align: center; padding: 50px;'>
                <h1 style='color: #27ae60;'>✅ SUCCESS!</h1>
                <p>Email sent successfully to <b>{recipient}</b>.</p>
                <p>Check your inbox and spam folder.</p>
                <a href='/' style='color: #3498db;'>Back to Login</a>
            </div>
            """
        else:
            return f"""
            <div style='font-family: sans-serif; padding: 50px; background-color: #fff5f5;'>
                <h1 style='color: #e74c3c;'>❌ Email Failed to Send</h1>
                <p><b>SMTP Server said:</b></p>
                <pre style='background: #eee; padding: 15px; border-radius: 5px; border: 1px solid #ddd; word-wrap: break-word; white-space: pre-wrap;'>{error_msg}</pre>
                <hr>
                <h3>Potential Fixes:</h3>
                <ul>
                    <li><b>Port 587 Blocked?</b> Use a Mobile Hotspot.</li>
                    <li><b>App Password Wrong?</b> Double check config.py (it should be 16 characters).</li>
                    <li><b>Wrong Email?</b> Make sure the App Password matches <b>{recipient}</b>.</li>
                </ul>
                <a href='/' style='color: #3498db;'>Back to Login</a>
            </div>
            """

    return app


if __name__ == '__main__':
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    # Initialize Application
    app = create_app()
    
    # Get Network IP for Mobile Access
    from routes.utils import get_network_ip
    network_ip = get_network_ip()

    # Premium Startup Banner
    line = "═" * 66
    print(f"\n\033[95m{line}")
    print(f"║ {'🎓 SECUREEXAM - UNIVERSITY PORTAL':^62} ║")
    print(f"{line}\033[0m")
    print(f"  {'-'*62}")
    print(f"  📌 Local Access:    \033[94mhttp://127.0.0.1:5050\033[0m")
    print(f"  📌 Faculty Portal:  \033[92mhttp://{network_ip}:5050\033[0m (Use on Mobile)")
    print(f"  📌 Admin Access:    \033[93mhttp://{network_ip}:5050/admin\033[0m")
    print(f"  {'-'*62}")
    print(f"  🔐 Default Admin:   \033[90madmin / admin123\033[0m")
    print(f"\033[95m{line}\033[0m\n")

    # Run Server
    try:
        app.run(host='0.0.0.0', port=5050, debug=True)
    except Exception as e:
        print(f"\n[!] FATAL ERROR: Could not start server: {e}")
        print("[!] Suggestion: Another app might be using Port 5000. Try closing other programs.")
