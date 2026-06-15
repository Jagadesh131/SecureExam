from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from database import get_db, generate_id, hash_password, check_password
from routes.utils import send_email, get_network_ip
import config
from datetime import date

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(f):
    """Decorator to require admin login."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated


@admin_bp.route('/', methods=['GET'])
def login():
    if session.get('admin_logged_in'):
        return redirect(url_for('admin.dashboard'))
    return render_template('admin/login.html')


@admin_bp.route('/authenticate', methods=['POST'])
def authenticate():
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '')

    db = get_db()
    admin = db.execute('SELECT * FROM admin WHERE username = ?', (username,)).fetchone()
    db.close()

    # Enforce strict case-sensitivity for username at the application level
    if admin and admin['username'] == username and check_password(admin['password'], password):
        session['admin_logged_in'] = True
        session['admin_id'] = admin['id']
        flash('Welcome, Admin!', 'success')
        return redirect(url_for('admin.dashboard'))

    flash('Invalid credentials.', 'error')
    return redirect(url_for('admin.login'))


@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    from database import get_admin_stats
    stats = get_admin_stats()
    return render_template('admin/dashboard.html', stats=stats)


@admin_bp.route('/faculty')
@admin_required
def faculty_list():
    from database import get_all_faculties_with_counts
    search = request.args.get('search', '').strip()
    
    # Search-First Logic: Only fetch faculties if there's an active search query
    if search:
        faculties = get_all_faculties_with_counts(search)
    else:
        faculties = []
        
    return render_template('admin/faculty_list.html', faculties=faculties, search=search)


@admin_bp.route('/faculty/add', methods=['POST'])
@admin_required
def add_faculty():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    department = request.form.get('department', '').strip()
    phone = request.form.get('phone', '').strip()
    birthday = request.form.get('birthday', '')

    if not all([name, email, department]):
        flash('All fields are required.', 'error')
        return redirect(url_for('admin.faculty_list'))

    faculty_id = generate_id('FAC')
    hashed = hash_password(config.TEMP_PASSWORD)

    db = get_db()
    try:
        db.execute(
            'INSERT INTO faculty (faculty_id, name, email, password, department, phone, birthday, temp_flag) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            (faculty_id, name, email, hashed, department, phone, birthday)
        )
        db.commit()

        # Send Welcome Email
        subject = "Welcome to MCQ University Portal - Your Account Details"
        body = f"Hello {name},\n\nYour faculty account has been created.\n\n" \
               f"Faculty ID: {faculty_id}\n" \
               f"Temporary Password: {config.TEMP_PASSWORD}\n\n" \
               f"Please login at: http://{get_network_ip()}:5050{url_for('faculty.login')}\n" \
               "You will be required to change your password on your first login."
        
        send_email(subject, [email], body)

        flash(f'Faculty added! ID: {faculty_id} | Email sent to {email}', 'success')
    except Exception as e:
        flash(f'Error adding faculty: {str(e)}', 'error')
    finally:
        db.close()

    return redirect(url_for('admin.faculty_list'))


@admin_bp.route('/faculty/edit/<faculty_id>', methods=['POST'])
@admin_required
def edit_faculty(faculty_id):
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    department = request.form.get('department', '').strip()
    phone = request.form.get('phone', '').strip()
    birthday = request.form.get('birthday', '')

    if not all([name, email, department]):
        flash('All fields are required.', 'error')
        return redirect(url_for('admin.faculty_list'))

    db = get_db()
    db.execute('UPDATE faculty SET name=?, email=?, department=?, phone=?, birthday=? WHERE faculty_id=?',
               (name, email, department, phone, birthday, faculty_id))
    db.commit()
    db.close()
    flash('Faculty updated successfully.', 'success')
    return redirect(url_for('admin.faculty_list'))


@admin_bp.route('/faculty/reset/<faculty_id>', methods=['POST'])
@admin_required
def reset_password(faculty_id):
    hashed = hash_password(config.TEMP_PASSWORD)
    db = get_db()
    db.execute('UPDATE faculty SET password=?, temp_flag=1 WHERE faculty_id=?',
               (hashed, faculty_id))
    
    # Get faculty email for notification
    faculty = db.execute('SELECT name, email FROM faculty WHERE faculty_id = ?', (faculty_id,)).fetchone()
    db.commit()

    if faculty:
        subject = "Password Reset - MCQ University Portal"
        body = f"Hello {faculty['name']},\n\nYour password has been reset by the administrator.\n\n" \
               f"New Temporary Password: {config.TEMP_PASSWORD}\n\n" \
               "Please login and change your password immediately."
        send_email(subject, [faculty['email']], body)

    db.close()
    flash(f'Password reset successfully. Email sent to {faculty["email"] if faculty else "faculty"}.', 'success')
    return redirect(url_for('admin.faculty_list'))


@admin_bp.route('/faculty/delete/<faculty_id>', methods=['POST'])
@admin_required
def delete_faculty(faculty_id):
    db = get_db()
    db.execute('DELETE FROM faculty WHERE faculty_id=?', (faculty_id,))
    db.commit()
    db.close()
    flash('Faculty and all associated data deleted.', 'success')
    return redirect(url_for('admin.faculty_list'))


@admin_bp.route('/change-password', methods=['GET', 'POST'])
@admin_required
def change_password():
    if request.method == 'POST':
        current = request.form.get('current_password', '')
        new_pass = request.form.get('new_password', '')
        confirm = request.form.get('confirm_password', '')

        db = get_db()
        admin = db.execute('SELECT * FROM admin WHERE id = ?', (session['admin_id'],)).fetchone()

        if not check_password_hash(admin['password'], current):
            flash('Current password is incorrect.', 'error')
            db.close()
            return redirect(url_for('admin.change_password'))

        if new_pass != confirm:
            flash('New passwords do not match.', 'error')
            db.close()
            return redirect(url_for('admin.change_password'))

        import re
        errors = []
        if len(new_pass) < 8: errors.append('Min 8 chars')
        if not re.search(r'[A-Z]', new_pass): errors.append('Uppercase letter')
        if not re.search(r'[a-z]', new_pass): errors.append('Lowercase letter')
        if not re.search(r'[0-9]', new_pass): errors.append('Number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_pass): errors.append('Special character')

        if errors:
            flash('Password requirements not met: ' + ', '.join(errors), 'error')
            db.close()
            return redirect(url_for('admin.change_password'))

        hashed = hash_password(new_pass)
        db.execute('UPDATE admin SET password=? WHERE id=?', (hashed, session['admin_id']))
        db.commit()
        db.close()
        flash('Password changed successfully!', 'success')
        return redirect(url_for('admin.dashboard'))

    return render_template('admin/change_password.html')


@admin_bp.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_id', None)
    flash('Logged out successfully.', 'info')
    return redirect(url_for('admin.login'))

@admin_bp.route('/exams')
@admin_required
def exams():
    from database import get_all_exams_admin
    search = request.args.get('search', '').strip()
    
    # Search-First Logic: Only show exams if searching
    if search:
        exams_list = get_all_exams_admin(search)
    else:
        exams_list = []
        
    return render_template('admin/exams.html', exams=exams_list, search=search)

@admin_bp.route('/exams/toggle/<exam_code>', methods=['POST'])
@admin_required
def toggle_exam(exam_code):
    db = get_db()
    exam = db.execute('SELECT is_active FROM exams WHERE exam_code = ?', (exam_code,)).fetchone()
    if exam:
        new_status = 1 if exam['is_active'] == 0 else 0
        db.execute('UPDATE exams SET is_active = ? WHERE exam_code = ?', (new_status, exam_code))
        db.commit()
        status_text = "Activated" if new_status else "Deactivated"
        flash(f'Exam {exam_code} {status_text} successfully.', 'success')
    db.close()
    return redirect(url_for('admin.exams'))

@admin_bp.route('/attempts')
@admin_required
def attempts():
    from database import get_all_attempts_admin
    search = request.args.get('search', '').strip()
    
    # Search-First Logic: Only show submissions if searching
    if search:
        attempts_list = get_all_attempts_admin(search)
    else:
        attempts_list = []
        
    return render_template('admin/attempts.html', attempts=attempts_list, search=search)

@admin_bp.route('/analytics')
@admin_required
def analytics():
    from database import get_system_analytics, get_admin_stats
    stats = get_admin_stats()
    deep_stats = get_system_analytics()
    return render_template('admin/analytics.html', stats=stats, deep_stats=deep_stats)

@admin_bp.route('/backup')
@admin_required
def backup():
    return render_template('admin/backup.html')

@admin_bp.route('/backup/wipe', methods=['POST'])
@admin_required
def wipe_system():
    # Only if double confirmed (checking for specific confirmation text in form)
    confirm = request.form.get('confirm_text', '')
    if confirm != 'WIPE_ALL_DATA':
        flash('System reset aborted. Invalid confirmation text.', 'error')
        return redirect(url_for('admin.backup'))
    
    db = get_db()
    try:
        # Dangerous: Delete all except admin
        db.execute('DELETE FROM faculty')
        db.execute('DELETE FROM exams')
        db.execute('DELETE FROM questions')
        db.execute('DELETE FROM student_attempts')
        db.execute('DELETE FROM activity_logs')
        db.commit()
        flash('System Factory Reset Successful. All user data cleared.', 'success')
    except Exception as e:
        flash(f'Error during system reset: {str(e)}', 'error')
    finally:
        db.close()
    return redirect(url_for('admin.dashboard'))
