from flask import Blueprint, render_template, request, redirect, url_for, session, flash, current_app, make_response
from routes.utils import send_email, send_email_debug, get_network_ip
from flask_mail import Message
import random
import string
import csv
import io
from datetime import datetime, timedelta
from database import get_db, generate_id, hash_password, check_password
import json
import re
import os
import google.generativeai as genai
import PyPDF2

faculty_bp = Blueprint('faculty', __name__, url_prefix='/faculty')


def faculty_required(f):
    """Decorator to require faculty login."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('faculty_logged_in'):
            return redirect(url_for('faculty.login'))
        # If temp_flag is set, force password change
        if session.get('temp_flag') and request.endpoint not in ['faculty.force_change_password', 'faculty.logout']:
            return redirect(url_for('faculty.force_change_password'))
        return f(*args, **kwargs)
    return decorated


def validate_password(password):
    """Validate password strength."""
    errors = []
    if len(password) < 8:
        errors.append('At least 8 characters')
    if not re.search(r'[A-Z]', password):
        errors.append('At least one uppercase letter')
    if not re.search(r'[a-z]', password):
        errors.append('At least one lowercase letter')
    if not re.search(r'[0-9]', password):
        errors.append('At least one number')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append('At least one special character')
    return errors


@faculty_bp.route('/', methods=['GET'])
def login():
    return render_template('faculty/login.html')


@faculty_bp.route('/authenticate', methods=['POST'])
def authenticate():
    faculty_id = request.form.get('faculty_id', '').strip().upper()
    password = request.form.get('password', '')

    db = get_db()
    faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?', (faculty_id,)).fetchone()
    db.close()

    if faculty and check_password(faculty['password'], password):
        session['faculty_logged_in'] = True
        session['faculty_id'] = faculty['faculty_id']
        session['faculty_name'] = faculty['name']
        session['temp_flag'] = faculty['temp_flag']

        if faculty['temp_flag'] == 1:
            flash('You must change your temporary password before continuing.', 'warning')
            return redirect(url_for('faculty.force_change_password'))

        flash(f'Welcome, {faculty["name"]}!', 'success')
        return redirect(url_for('faculty.dashboard'))

    flash('Invalid Faculty ID or password.', 'error')
    return redirect(url_for('faculty.login'))


@faculty_bp.route('/force-change-password', methods=['GET', 'POST'])
def force_change_password():
    if not session.get('faculty_logged_in'):
        return redirect(url_for('faculty.login'))

    if request.method == 'POST':
        new_pass = request.form.get('new_password', '')
        confirm = request.form.get('confirm_password', '')

        if new_pass != confirm:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('faculty.force_change_password'))

        errors = validate_password(new_pass)
        if errors:
            flash('Password requirements not met: ' + ', '.join(errors), 'error')
            return redirect(url_for('faculty.force_change_password'))

        hashed = hash_password(new_pass)
        db = get_db()
        db.execute('UPDATE faculty SET password=?, temp_flag=0 WHERE faculty_id=?',
                   (hashed, session['faculty_id']))
        db.commit()
        db.close()

        session['temp_flag'] = 0
        flash('Password changed successfully! Please login with your new password.', 'success')
        return redirect(url_for('faculty.logout'))

    return render_template('faculty/force_change_password.html')


@faculty_bp.route('/dashboard')
@faculty_required
def dashboard():
    from database import get_faculty_exams_with_counts
    exams = get_faculty_exams_with_counts(session['faculty_id'])
    return render_template('faculty/dashboard.html', exams=exams)

@faculty_bp.route('/exam/create', methods=['GET'])
@faculty_required
def create_exam_view():
    return render_template('faculty/create_exam_full.html')

@faculty_bp.route('/exam/create', methods=['POST'])
@faculty_required
def create_exam():
    exam_name = request.form.get('exam_name', '').strip()
    subject = request.form.get('subject', '').strip()
    duration = request.form.get('duration', '0').strip()
    passing_percentage = request.form.get('passing_percentage', '40').strip()
    instructions = request.form.get('instructions', '').strip()

    if not all([exam_name, subject, duration]):
        flash('All fields are required.', 'error')
        return redirect(url_for('faculty.create_exam_view'))

    try:
        duration = int(duration)
        if duration < 5 or duration > 180:
            flash('Duration must be between 5 and 180 minutes.', 'error')
            return redirect(url_for('faculty.create_exam_view'))
            
        passing_percentage = int(passing_percentage)
    except ValueError:
        flash('Invalid numeric values provided.', 'error')
        return redirect(url_for('faculty.create_exam_view'))

    exam_code = generate_id('EXAM', 4)
    db = get_db()
    try:
        db.execute(
            'INSERT INTO exams (exam_code, exam_name, faculty_id, subject, duration, passing_percentage, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (exam_code, exam_name, session['faculty_id'], subject, duration, passing_percentage, instructions)
        )
        db.commit()
        flash(f'Exam created! Code: {exam_code}', 'success')
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')
    finally:
        db.close()

    return redirect(url_for('faculty.manage_questions', exam_code=exam_code))


@faculty_bp.route('/exam/<exam_code>')
@faculty_required
def exam_detail(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?',
                      (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    questions = db.execute('SELECT * FROM questions WHERE exam_code = ? ORDER BY id',
                           (exam_code,)).fetchall()
    
    # Fetch Stats for Premium Dashboard
    attempts = db.execute('SELECT * FROM student_attempts WHERE exam_code = ? ORDER BY attempt_date DESC', (exam_code,)).fetchall()
    
    total_students = len(attempts)
    avg_score = 0
    if total_students > 0:
        total_score = sum(a['percentage'] for a in attempts)
        avg_score = round(total_score / total_students)
    
    # Recent Activity (Top 5)
    recent_activity = attempts[:5]

    db.close()
    return render_template('faculty/exam_detail.html', 
                          exam=exam, 
                          questions=questions,
                          total_students=total_students,
                          avg_score=avg_score,
                          recent_activity=recent_activity)


@faculty_bp.route('/exam/<exam_code>/edit', methods=['GET', 'POST'])
@faculty_required
def edit_exam(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    if request.method == 'POST':
        exam_name = request.form.get('exam_name', '').strip()
        subject = request.form.get('subject', '').strip()
        duration = request.form.get('duration', '0').strip()

        if not all([exam_name, subject, duration]):
            flash('All fields are required.', 'error')
            db.close()
            return redirect(url_for('faculty.edit_exam', exam_code=exam_code))

        try:
            duration = int(duration)
            if duration < 5 or duration > 180:
                flash('Duration must be between 5 and 180 minutes.', 'error')
                db.close()
                return redirect(url_for('faculty.edit_exam', exam_code=exam_code))
        except ValueError:
            flash('Invalid duration.', 'error')
            db.close()
            return redirect(url_for('faculty.edit_exam', exam_code=exam_code))

        db.execute('UPDATE exams SET exam_name=?, subject=?, duration=? WHERE exam_code=? AND faculty_id=?',
                   (exam_name, subject, duration, exam_code, session['faculty_id']))
        db.commit()
        db.close()
        flash('Exam updated.', 'success')
        return redirect(url_for('faculty.edit_exam', exam_code=exam_code))

    db.close()
    return render_template('faculty/edit_exam_full.html', exam=exam)


@faculty_bp.route('/exam/<exam_code>/settings', methods=['GET', 'POST'])
@faculty_required
def exam_settings(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    if request.method == 'POST':
        instructions = request.form.get('instructions', '').strip()
        passing_percentage = request.form.get('passing_percentage', '40').strip()
        randomize_questions = 1 if request.form.get('randomize_questions') else 0
        shuffle_options = 1 if request.form.get('shuffle_options') else 0

        try:
            passing_percentage = int(passing_percentage)
        except ValueError:
            passing_percentage = 40

        db.execute('''UPDATE exams SET instructions=?, passing_percentage=?, randomize_questions=?, shuffle_options=? 
                      WHERE exam_code=? AND faculty_id=?''',
                   (instructions, passing_percentage, randomize_questions, shuffle_options, exam_code, session['faculty_id']))
        db.commit()
        db.close()
        flash('Exam settings saved.', 'success')
        return redirect(url_for('faculty.exam_settings', exam_code=exam_code))
        
    db.close()
    return render_template('faculty/exam_settings_full.html', exam=exam)


@faculty_bp.route('/exam/<exam_code>/questions', methods=['GET'])
@faculty_required
def manage_questions(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    questions = db.execute('SELECT * FROM questions WHERE exam_code = ? ORDER BY id', (exam_code,)).fetchall()
    db.close()
    return render_template('faculty/manage_questions_full.html', exam=exam, questions=questions)

@faculty_bp.route('/exam/<exam_code>/toggle', methods=['POST'])
@faculty_required
def toggle_exam(exam_code):
    db = get_db()
    exam = db.execute('SELECT is_active FROM exams WHERE exam_code = ? AND faculty_id = ?',
                      (exam_code, session['faculty_id'])).fetchone()
    if exam:
        new_status = 0 if exam['is_active'] else 1
        db.execute('UPDATE exams SET is_active=? WHERE exam_code=?', (new_status, exam_code))
        db.commit()
        status_text = 'activated' if new_status else 'deactivated'
        flash(f'Exam {status_text}.', 'success')
    db.close()
    return redirect(url_for('faculty.dashboard'))


@faculty_bp.route('/exam/<exam_code>/delete', methods=['POST'])
@faculty_required
def delete_exam(exam_code):
    db = get_db()
    db.execute('DELETE FROM exams WHERE exam_code=? AND faculty_id=?',
               (exam_code, session['faculty_id']))
    db.commit()
    db.close()
    flash('Exam deleted with all questions and results.', 'success')
    return redirect(url_for('faculty.dashboard'))


@faculty_bp.route('/exam/<exam_code>/question/add', methods=['POST'])
@faculty_required
def add_question(exam_code):
    question_text = request.form.get('question_text', '').strip()
    option_a = request.form.get('option_a', '').strip()
    option_b = request.form.get('option_b', '').strip()
    option_c = request.form.get('option_c', '').strip()
    option_d = request.form.get('option_d', '').strip()
    correct_answer = request.form.get('correct_answer', '').strip().upper()
    difficulty = request.form.get('difficulty', 'Medium').strip()

    if not all([question_text, option_a, option_b, option_c, option_d, correct_answer]):
        flash('All fields are required.', 'error')
        return redirect(url_for('faculty.manage_questions', exam_code=exam_code))

    if correct_answer not in ['A', 'B', 'C', 'D']:
        flash('Correct answer must be A, B, C, or D.', 'error')
        return redirect(url_for('faculty.manage_questions', exam_code=exam_code))

    db = get_db()
    db.execute(
        'INSERT INTO questions (exam_code, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (exam_code, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty)
    )
    db.commit()
    db.close()
    flash('Question added.', 'success')
    return redirect(url_for('faculty.manage_questions', exam_code=exam_code))


@faculty_bp.route('/exam/<exam_code>/question/<int:q_id>/edit', methods=['POST'])
@faculty_required
def edit_question(exam_code, q_id):
    question_text = request.form.get('question_text', '').strip()
    option_a = request.form.get('option_a', '').strip()
    option_b = request.form.get('option_b', '').strip()
    option_c = request.form.get('option_c', '').strip()
    option_d = request.form.get('option_d', '').strip()
    correct_answer = request.form.get('correct_answer', '').strip().upper()
    difficulty = request.form.get('difficulty', 'Medium').strip()

    if not all([question_text, option_a, option_b, option_c, option_d, correct_answer]):
        flash('All fields are required.', 'error')
        return redirect(url_for('faculty.manage_questions', exam_code=exam_code))

    db = get_db()
    db.execute(
        '''UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=?, difficulty=?
           WHERE id=? AND exam_code=?''',
        (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, q_id, exam_code)
    )
    db.commit()
    db.close()
    flash('Question updated.', 'success')
    return redirect(url_for('faculty.manage_questions', exam_code=exam_code))


@faculty_bp.route('/exam/<exam_code>/question/<int:q_id>/delete', methods=['POST'])
@faculty_required
def delete_question(exam_code, q_id):
    db = get_db()
    db.execute('DELETE FROM questions WHERE id=? AND exam_code=?', (q_id, exam_code))
    db.commit()
    db.close()
    flash('Question deleted.', 'success')
    return redirect(url_for('faculty.manage_questions', exam_code=exam_code))


@faculty_bp.route('/exam/<exam_code>/bulk_upload', methods=['GET', 'POST'])
@faculty_required
def bulk_upload(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file uploaded.', 'error')
            db.close()
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash('No file selected.', 'error')
            db.close()
            return redirect(request.url)

        if not file.filename.endswith('.csv'):
            flash('Only CSV files are allowed.', 'error')
            db.close()
            return redirect(request.url)

        try:
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_input = csv.reader(stream)
            
            try:
                header = next(csv_input)
            except StopIteration:
                flash('The CSV file is empty.', 'error')
                db.close()
                return redirect(request.url)

            valid_rows = 0
            skipped_rows = 0
            
            for row in csv_input:
                if len(row) < 6:
                    skipped_rows += 1
                    continue
                    
                q_text = row[0].strip()
                opt_a = row[1].strip()
                opt_b = row[2].strip()
                opt_c = row[3].strip()
                opt_d = row[4].strip()
                correct = row[5].strip().upper()
                diff = row[6].strip() if len(row) > 6 else 'Medium'
                
                if not diff:
                    diff = 'Medium'
                    
                if not all([q_text, opt_a, opt_b, opt_c, opt_d, correct]) or correct not in ['A', 'B', 'C', 'D']:
                    skipped_rows += 1
                    continue
                    
                db.execute(
                    'INSERT INTO questions (exam_code, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (exam_code, q_text, opt_a, opt_b, opt_c, opt_d, correct, diff)
                )
                valid_rows += 1
                
            db.commit()
            
            if valid_rows > 0:
                flash(f'Successfully uploaded {valid_rows} questions. Skipped {skipped_rows} invalid rows.', 'success')
            else:
                flash(f'No valid questions found in CSV. Skipped {skipped_rows} rows.', 'error')
                
            db.close()
            return redirect(url_for('faculty.manage_questions', exam_code=exam_code))
            
        except Exception as e:
            flash(f'Error processing file: {str(e)}', 'error')
            db.close()
            return redirect(request.url)

    db.close()
    return render_template('faculty/bulk_upload_full.html', exam=exam)


@faculty_bp.route('/exam/<exam_code>/download_template')
@faculty_required
def download_template(exam_code):
    # Verify exam ownership
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    db.close()
    
    if not exam:
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    # Generate CSV template
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Difficulty'])
    writer.writerow(['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', 'Easy'])
    
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=questions_template.csv"
    response.headers["Content-type"] = "text/csv"
    return response


@faculty_bp.route('/exam/<exam_code>/results')
@faculty_required
def exam_results(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?',
                      (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))

    results = db.execute(
        'SELECT * FROM student_attempts WHERE exam_code = ? ORDER BY attempt_date DESC',
        (exam_code,)
    ).fetchall()
    db.close()
    return render_template('faculty/results.html', exam=exam, results=results)


@faculty_bp.route('/exam/<exam_code>/categories')
@faculty_required
def categories(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))
        
    rows = db.execute('''
        SELECT c.id, c.name, c.color, COUNT(q.id) as question_count
        FROM categories c
        LEFT JOIN questions q ON c.id = q.category_id
        WHERE c.exam_code = ?
        GROUP BY c.id
        ORDER BY c.id DESC
    ''', (exam_code,)).fetchall()
    categories_list = [dict(row) for row in rows]
    db.close()
    
    return render_template('faculty/categories_full.html', exam=exam, categories=categories_list)

@faculty_bp.route('/exam/<exam_code>/category/add', methods=['POST'])
@faculty_required
def add_category(exam_code):
    name = request.form.get('name')
    color = request.form.get('color', '#3B82F6')
    
    if name:
        db = get_db()
        # Verify exam ownership
        exam = db.execute('SELECT id FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
        if exam:
            db.execute('INSERT INTO categories (exam_code, name, color) VALUES (?, ?, ?)', (exam_code, name, color))
            db.commit()
            flash('Category added.', 'success')
        db.close()
    
    return redirect(url_for('faculty.categories', exam_code=exam_code))

@faculty_bp.route('/exam/<exam_code>/category/<int:category_id>/delete', methods=['POST'])
@faculty_required
def delete_category(exam_code, category_id):
    db = get_db()
    exam = db.execute('SELECT id FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    if exam:
        db.execute('DELETE FROM categories WHERE id = ?', (category_id,))
        db.commit()
        flash('Category deleted.', 'success')
    db.close()
    return redirect(url_for('faculty.categories', exam_code=exam_code))


@faculty_bp.route('/exam/<exam_code>/attendance')
@faculty_required
def student_attendance(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    if not exam:
        db.close()
        flash('Exam not found.', 'error')
        return redirect(url_for('faculty.dashboard'))
        
    attempts = db.execute('SELECT * FROM student_attempts WHERE exam_code = ? ORDER BY attempt_date DESC', (exam_code,)).fetchall()
    db.close()
    return render_template('faculty/attendance_full.html', exam=exam, attempts=attempts)


@faculty_bp.route('/analytics/trends')
@faculty_required
def performance_trends():
    db = get_db()
    exams = db.execute('SELECT * FROM exams WHERE faculty_id = ? ORDER BY id DESC', (session['faculty_id'],)).fetchall()
    db.close()
    return render_template('faculty/performance_trends.html', exams=exams)


@faculty_bp.route('/exams')
@faculty_required
def all_exams():
    """Dedicated page showing all exams created by the faculty."""
    db = get_db()
    exams = db.execute('SELECT * FROM exams WHERE faculty_id = ? ORDER BY id DESC', (session['faculty_id'],)).fetchall()
    db.close()
    return render_template('faculty/exams_list.html', exams=exams)

@faculty_bp.route('/questions/select')
@faculty_required
def select_exam_for_questions():
    """Hub page asking the user to select which exam they want to manage questions for."""
    db = get_db()
    exams = db.execute('SELECT * FROM exams WHERE faculty_id = ? ORDER BY id DESC', (session['faculty_id'],)).fetchall()
    db.close()
    return render_template('faculty/questions_select.html', exams=exams)


@faculty_bp.route('/reports/export')
@faculty_required
def export_reports():
    db = get_db()
    exams = db.execute('SELECT * FROM exams WHERE faculty_id = ? ORDER BY id DESC', (session['faculty_id'],)).fetchall()
    db.close()
    return render_template('faculty/export_reports.html', exams=exams)


@faculty_bp.route('/change-password', methods=['GET', 'POST'])
@faculty_required
def change_password():
    if request.method == 'POST':
        current = request.form.get('current_password', '')
        new_pass = request.form.get('new_password', '')
        confirm = request.form.get('confirm_password', '')

        db = get_db()
        faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?',
                             (session['faculty_id'],)).fetchone()

        if not check_password_hash(faculty['password'], current):
            flash('Current password is incorrect.', 'error')
            db.close()
            return redirect(url_for('faculty.change_password'))

        if new_pass != confirm:
            flash('Passwords do not match.', 'error')
            db.close()
            return redirect(url_for('faculty.change_password'))

        errors = validate_password(new_pass)
        if errors:
            flash('Password requirements not met: ' + ', '.join(errors), 'error')
            db.close()
            return redirect(url_for('faculty.change_password'))

        hashed = hash_password(new_pass)
        db.execute('UPDATE faculty SET password=? WHERE faculty_id=?',
                   (hashed, session['faculty_id']))
        db.commit()
        db.close()
        flash('Password changed successfully! Please login again.', 'success')
        return redirect(url_for('faculty.logout'))

    return render_template('faculty/change_password.html')



@faculty_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        faculty_id = request.form.get('faculty_id', '').strip().upper()
        email = request.form.get('email', '').strip()
        
        db = get_db()
        
        if faculty_id:
            faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?', (faculty_id,)).fetchone()
        elif email:
            faculty = db.execute('SELECT * FROM faculty WHERE email = ?', (email,)).fetchone()
        else:
            faculty = None

        if faculty:
            faculty_id = faculty['faculty_id']  # Ensure we have it for the email template
            # Generate a new random strong temporary password
            new_clear_pass = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            hashed = hash_password(new_clear_pass)
            
            # Update database with temporary password and set temp_flag=1
            db.execute('UPDATE faculty SET password=?, temp_flag=1 WHERE faculty_id=?', 
                       (hashed, faculty_id))
            db.commit()

            # Prepare Email Content (Plain Text Fallback)
            subject = 'Password Recovery - MCQ System'
            body = (
                f"Hello {faculty['name']},\n\n"
                f"Your password has been reset.\n\n"
                f"Faculty ID: {faculty_id}\n"
                f"Temporary Password: {new_clear_pass}\n\n"
                f"Change this on your next login."
            )
            
            # Premium HTML Template
            html_content = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
                    <h2 style="color: #2c3e50; margin: 0;">MCQ Examination System</h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0;">University Faculty Portal</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 25px;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Password Recovery</h3>
                    <p style="color: #34495e; font-size: 16px;">Hello <strong>{faculty['name']}</strong>,</p>
                    <p style="color: #34495e; font-size: 16px;">Following your request, a temporary password has been generated for your account.</p>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; color: #7f8c8d; width: 40%; border-bottom: 1px solid #eee;">Faculty ID</td>
                            <td style="padding: 10px; color: #2c3e50; font-weight: bold; border-bottom: 1px solid #eee;">{faculty_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; color: #7f8c8d; border-bottom: 1px solid #eee;">Temporary Password</td>
                            <td style="padding: 10px; color: #e74c3c; font-weight: bold; font-family: monospace; font-size: 18px; border-bottom: 1px solid #eee;">{new_clear_pass}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="http://{get_network_ip()}:5050{url_for('faculty.login')}" style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Portal</a>
                </div>
                
                <p style="color: #e67e22; font-size: 14px; text-align: center; background-color: #fff3e0; padding: 10px; border-radius: 4px;">
                    <strong>Security Note:</strong> You will be required to change this temporary password immediately after logging in.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #95a5a6; font-size: 12px; text-align: center; margin: 0;">
                    This is an automated message from the MCQ Examination System. Please do not reply to this email.
                </p>
            </div>
            """
            
            # Send Email
            success, error_msg = send_email_debug(subject, [faculty['email']], body, html=html_content)
            if success:
                email_parts = faculty['email'].split('@')
                masked_email = email_parts[0][0] + "***" + email_parts[0][-1] + "@" + email_parts[1]
                flash(f'Login details have been sent to {masked_email}. Please check your inbox.', 'success')
            else:
                flash(f'Email blocked by Cloud. Reason: {error_msg}. Your temporary password is: {new_clear_pass}', 'warning')
            
            db.close()
            return redirect(url_for('faculty.login'))
        else:
            flash('No account found with that Email or Faculty ID.', 'error')
            db.close()

    return render_template('faculty/forgot_password.html')


@faculty_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        department = request.form.get('department', '').strip()
        phone = request.form.get('phone', '').strip()
        birthday = request.form.get('birthday', '')
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')

        if not all([name, email, department, phone, birthday, password]):
            flash('All fields are required.', 'error')
            return redirect(url_for('faculty.signup'))

        if password != confirm:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('faculty.signup'))

        errors = validate_password(password)
        if errors:
            flash('Password requirements not met: ' + ', '.join(errors), 'error')
            return redirect(url_for('faculty.signup'))

        db = get_db()
        # Check if email already exists
        existing = db.execute('SELECT id FROM faculty WHERE email = ?', (email,)).fetchone()
        if existing:
            flash('Email already registered.', 'error')
            db.close()
            return redirect(url_for('faculty.signup'))

        faculty_id = generate_id('FAC')
        hashed = hash_password(password)

        try:
            db.execute(
                '''INSERT INTO faculty (faculty_id, name, email, password, department, phone, birthday, temp_flag) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, 0)''',
                (faculty_id, name, email, hashed, department, phone, birthday)
            )
            db.commit()
            flash(f'Registration successful! Your Faculty ID is: {faculty_id}', 'success')
            return redirect(url_for('faculty.login'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
        finally:
            db.close()

    return render_template('faculty/signup.html')


@faculty_bp.route('/my-account')
@faculty_required
def my_account():
    db = get_db()
    faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?', (session['faculty_id'],)).fetchone()
    db.close()
    return render_template('faculty/my_account.html', faculty=faculty)


@faculty_bp.route('/edit-profile', methods=['GET', 'POST'])
@faculty_required
def edit_profile():
    db = get_db()
    # Fetch faculty details once, needed for both GET and POST (for department in POST)
    faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?', (session['faculty_id'],)).fetchone()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        department = request.form.get('department', '').strip()
        phone = request.form.get('phone', '').strip()
        birthday = request.form.get('birthday', '')

        if not all([name, email, department]):
            flash('Name, Email, and Department are required.', 'error')
            db.close()
            return redirect(url_for('faculty.edit_profile'))

        # Check for unique email if changed
        # Only check if the email is different from the current one
        if email != faculty['email']:
            existing = db.execute('SELECT id FROM faculty WHERE email = ?', (email,)).fetchone()
            if existing:
                flash('This email is already used by another account.', 'error')
                db.close()
                return redirect(url_for('faculty.edit_profile'))

        db.execute('UPDATE faculty SET email=?, name=?, department=?, phone=?, birthday=? WHERE faculty_id=?',
                   (email, name, department, phone, birthday, session['faculty_id']))
        db.commit()
        session['faculty_name'] = name # Update session name
        flash('Profile updated successfully!', 'success')
        db.close()
        return redirect(url_for('faculty.my_account'))

    db.close() # Close DB connection for GET request path
    return render_template('faculty/edit_profile.html', faculty=faculty)


@faculty_bp.route('/upload-photo', methods=['POST'])
@faculty_required
def upload_photo():
    if 'profile_pic' not in request.files:
        flash('No file part', 'error')
        return redirect(url_for('faculty.my_account'))
    
    file = request.files['profile_pic']
    if file.filename == '':
        flash('No selected file', 'error')
        return redirect(url_for('faculty.my_account'))

    if file:
        import os
        from werkzeug.utils import secure_filename
        filename = secure_filename(f"{session['faculty_id']}_{file.filename}")
        upload_path = os.path.join(current_app.root_path, 'static', 'images', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        
        file.save(upload_path)
        
        db = get_db()
        db.execute('UPDATE faculty SET profile_pic=? WHERE faculty_id=?', (filename, session['faculty_id']))
        db.commit()
        db.close()
        
        flash('Profile picture updated!', 'success')
        return redirect(url_for('faculty.my_account'))


@faculty_bp.route('/logout')
def logout():
    session.pop('faculty_logged_in', None)
    session.pop('faculty_id', None)
    session.pop('faculty_name', None)
    session.pop('temp_flag', None)
    flash('Logged out successfully.', 'info')
    return redirect(url_for('faculty.login'))

@faculty_bp.route('/exam/<exam_code>/generate_from_document', methods=['POST'])
@faculty_required
def generate_from_document(exam_code):
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND faculty_id = ?', (exam_code, session['faculty_id'])).fetchone()
    
    if not exam:
        db.close()
        return json.dumps({"error": "Exam not found or unauthorized."}), 404

    if 'file' not in request.files:
        db.close()
        return json.dumps({"error": "No file uploaded."}), 400

    file = request.files['file']
    if file.filename == '':
        db.close()
        return json.dumps({"error": "No file selected."}), 400

    num_easy = int(request.form.get('num_easy', 0))
    num_medium = int(request.form.get('num_medium', 0))
    num_hard = int(request.form.get('num_hard', 0))
    
    total_questions = num_easy + num_medium + num_hard
    if total_questions == 0:
        db.close()
        return json.dumps({"error": "Please specify the number of questions."}), 400

    try:
        # Extract text from file
        text_content = ""
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
        elif file.filename.endswith('.csv') or file.filename.endswith('.txt'):
            text_content = file.read().decode('utf-8', errors='ignore')
        else:
            db.close()
            return json.dumps({"error": "Unsupported file format. Please upload PDF or CSV/TXT."}), 400

        # AI processing
        from config import GEMINI_API_KEY
        genai.configure(api_key=GEMINI_API_KEY)
        # Auto-discover the best available model for this specific API key
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods and 'gemini' in m.name.lower()]
        
        if not available_models:
            raise Exception("No Gemini text models are available for this API key. Your API key might be an old PaLM key or restricted in your region.")
            
        # Prefer flash or pro if available, otherwise just pick the first one
        preferred_model = next((m for m in available_models if 'flash' in m), 
                          next((m for m in available_models if 'pro' in m), available_models[0]))
        
        current_app.logger.info(f"Dynamically selected Gemini model: {preferred_model}")
        model = genai.GenerativeModel(preferred_model)
        
        prompt = f"""
You are an expert professor. I am providing you with a document containing a bank of multiple-choice questions.
Your task is to analyze these questions, classify their difficulty, and extract exactly the following number of questions:
- {num_easy} Easy questions
- {num_medium} Medium questions
- {num_hard} Hard questions
Total: {total_questions} questions.

Document content:
\"\"\"
{text_content[:25000]} # Limit to roughly 25k chars to avoid token limits on huge files
\"\"\"

Return the extracted questions strictly as a JSON array of objects. Do not include markdown formatting or extra text.
Each object MUST have these exact keys:
"question_text" (string)
"option_a" (string)
"option_b" (string)
"option_c" (string)
"option_d" (string)
"correct_answer" (string, strictly "A", "B", "C", or "D")
"difficulty" (string, strictly "Easy", "Medium", or "Hard")
"""
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up possible markdown wrappers
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        questions_data = json.loads(response_text)
        
        valid_count = 0
        for q in questions_data:
            q_text = q.get('question_text', '').strip()
            opt_a = q.get('option_a', '').strip()
            opt_b = q.get('option_b', '').strip()
            opt_c = q.get('option_c', '').strip()
            opt_d = q.get('option_d', '').strip()
            correct = q.get('correct_answer', '').strip().upper()
            diff = q.get('difficulty', 'Medium').strip().capitalize()
            
            if diff not in ['Easy', 'Medium', 'Hard']:
                diff = 'Medium'
                
            if all([q_text, opt_a, opt_b, opt_c, opt_d, correct]) and correct in ['A', 'B', 'C', 'D']:
                db.execute(
                    'INSERT INTO questions (exam_code, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (exam_code, q_text, opt_a, opt_b, opt_c, opt_d, correct, diff)
                )
                valid_count += 1
                
        db.commit()
        db.close()
        
        return json.dumps({"success": True, "message": f"Successfully imported {valid_count} questions via AI."})

    except Exception as e:
        db.close()
        print(f"AI Generation Error: {str(e)}")
        return json.dumps({"error": f"AI processing failed: {str(e)}"}), 500

