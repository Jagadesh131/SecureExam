from flask import Blueprint, request, jsonify
import json
from database import get_db, check_password, get_faculty_exams_with_counts, hash_password, generate_id

api_bp = Blueprint('api', __name__, url_prefix='/api')

from database import get_all_faculties_with_counts, get_all_exams_admin, get_all_attempts_admin, get_system_analytics, get_admin_stats

@api_bp.route('/login', methods=['POST'])
def api_login():
    """Authentication for Faculty/Admin (if ever needed for mobile)"""
    data = request.get_json()
    user_id = data.get('faculty_id')
    password = data.get('password')
    
    db = get_db()
    faculty = db.execute('SELECT * FROM faculty WHERE faculty_id = ?', (user_id,)).fetchone()
    db.close()
    
    if faculty and check_password(faculty['password'], password):
        return jsonify({
            'success': True,
            'user': {
                'id': faculty['faculty_id'],
                'name': faculty['name'],
                'role': 'faculty'
            }
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@api_bp.route('/signup', methods=['POST'])
def api_signup():
    """Faculty registration via API"""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    department = data.get('department', 'General')
    phone = data.get('phone', '')
    birthday = data.get('birthday', '')

    if not all([name, email, password]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    db = get_db()
    existing = db.execute('SELECT id FROM faculty WHERE email = ?', (email,)).fetchone()
    if existing:
        db.close()
        return jsonify({'success': False, 'message': 'Email already exists'}), 409

    faculty_id = generate_id('FAC')
    hashed = hash_password(password)

    try:
        db.execute(
            'INSERT INTO faculty (faculty_id, name, email, password, department, phone, birthday) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (faculty_id, name, email, hashed, department, phone, birthday)
        )
        db.commit()
        return jsonify({
            'success': True, 
            'faculty_id': faculty_id,
            'message': 'Registration successful'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        db.close()

@api_bp.route('/faculty/register', methods=['POST'])
def api_faculty_register():
    """Alias for signup to match the mobile app's add-faculty.tsx fetch call"""
    return api_signup()

@api_bp.route('/faculty/dashboard', methods=['GET'])
def faculty_dashboard_api():
    """Get dashboard stats and exams for a faculty member"""
    faculty_id = request.args.get('faculty_id')
    search_query = request.args.get('search', '')
    if not faculty_id:
        return jsonify({'error': 'Missing faculty_id parameter'}), 400
        
    exams_rows = get_faculty_exams_with_counts(faculty_id, search_query)
    exams = [dict(row) for row in exams_rows]
    
    # Calculate aggregate stats
    total_exams = len(exams)
    active_exams = sum(1 for e in exams if e.get('is_active') == 1)
    total_attempts = sum(e.get('attempt_count', 0) for e in exams)
    
    return jsonify({
        'success': True,
        'stats': {
            'total_exams': total_exams,
            'active_exams': active_exams,
            'total_attempts': total_attempts
        },
        'exams': exams
    })

@api_bp.route('/faculty/exam/create', methods=['POST'])
def api_create_exam():
    """Create a new exam via API"""
    data = request.get_json()
    faculty_id = data.get('faculty_id')
    exam_name = data.get('exam_name', '').strip()
    subject = data.get('subject', '').strip()
    duration = data.get('duration', 60)

    if not all([faculty_id, exam_name, subject]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    exam_code = generate_id('EXAM', 4)
    db = get_db()
    try:
        db.execute(
            'INSERT INTO exams (exam_code, exam_name, faculty_id, subject, duration) VALUES (?, ?, ?, ?, ?)',
            (exam_code, exam_name, faculty_id, subject, duration)
        )
        db.commit()
        return jsonify({'success': True, 'exam_code': exam_code, 'message': 'Exam created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        db.close()

@api_bp.route('/faculty/exam/<exam_code>/toggle', methods=['POST'])
def api_toggle_exam(exam_code):
    """Toggle exam status via API"""
    db = get_db()
    exam = db.execute('SELECT is_active FROM exams WHERE exam_code = ?', (exam_code,)).fetchone()
    if not exam:
        db.close()
        return jsonify({'success': False, 'message': 'Exam not found'}), 404
        
    new_status = 0 if exam['is_active'] else 1
    db.execute('UPDATE exams SET is_active=? WHERE exam_code=?', (new_status, exam_code))
    db.commit()
    db.close()
    return jsonify({'success': True, 'new_status': new_status})

@api_bp.route('/faculty/exam/<exam_code>/questions', methods=['GET'])
def api_get_questions(exam_code):
    """Get all questions for an exam (including correct answer for faculty)"""
    db = get_db()
    questions = db.execute('SELECT * FROM questions WHERE exam_code = ?', (exam_code,)).fetchall()
    db.close()
    return jsonify({'success': True, 'questions': [dict(q) for q in questions]})

@api_bp.route('/faculty/exam/<exam_code>/question/add', methods=['POST'])
def api_add_question(exam_code):
    """Add a question to an exam via API"""
    data = request.get_json()
    q_text = data.get('question_text')
    opt_a = data.get('option_a')
    opt_b = data.get('option_b')
    opt_c = data.get('option_c')
    opt_d = data.get('option_d')
    correct = data.get('correct_answer')

    if not all([q_text, opt_a, opt_b, opt_c, opt_d, correct]):
        return jsonify({'success': False, 'message': 'Missing fields'}), 400

    db = get_db()
    try:
        db.execute(
            'INSERT INTO questions (exam_code, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (exam_code, q_text, opt_a, opt_b, opt_c, opt_d, correct)
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Question added'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        db.close()

@api_bp.route('/exams', methods=['GET'])
def get_exams():
    """Get list of active exams"""
    db = get_db()
    exams = db.execute('SELECT exam_code, exam_name, subject, duration FROM exams WHERE is_active = 1').fetchall()
    db.close()
    
    return jsonify([dict(row) for row in exams])

@api_bp.route('/exam/<exam_code>', methods=['GET'])
def get_exam_details(exam_code):
    """Get specific exam details and questions"""
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND is_active = 1', (exam_code,)).fetchone()
    
    if not exam:
        db.close()
        return jsonify({'error': 'Exam not found'}), 404
        
    questions_rows = db.execute(
        'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE exam_code = ?',
        (exam_code,)
    ).fetchall()
    db.close()
    
    questions = [dict(q) for q in questions_rows]
    
    return jsonify({
        'exam': dict(exam),
        'questions': questions
    })

@api_bp.route('/exam/<exam_code>/submit', methods=['POST'])
def submit_exam_api(exam_code):
    """Submit exam answers via API"""
    data = request.get_json()
    student_name = data.get('student_name')
    reg_number = data.get('reg_number', '').upper()
    user_answers = data.get('answers', {}) # Dict of {question_id: selected_option}
    
    if not student_name or not reg_number:
        return jsonify({'error': 'Missing student details'}), 400
        
    db = get_db()
    
    # Check duplicate
    existing = db.execute(
        'SELECT id FROM student_attempts WHERE reg_number = ? AND exam_code = ?',
        (reg_number, exam_code)
    ).fetchone()
    
    if existing:
        db.close()
        return jsonify({'error': 'Already submitted'}), 409
        
    # Get correct answers
    questions = db.execute(
        'SELECT id, correct_answer FROM questions WHERE exam_code = ?',
        (exam_code,)
    ).fetchall()
    
    total = len(questions)
    score = 0
    
    for q in questions:
        q_id = str(q['id'])
        if q_id in user_answers:
            if user_answers[q_id].upper() == q['correct_answer'].upper():
                score += 1
                
    percentage = round((score / total * 100), 2) if total > 0 else 0
    
    db.execute(
        '''INSERT INTO student_attempts (student_name, reg_number, exam_code, answers, score, total_questions, percentage)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (student_name, reg_number, exam_code, json.dumps(user_answers), score, total, percentage)
    )
    db.commit()
    db.close()
    
    return jsonify({
        'success': True,
        'score': score,
        'total': total,
        'percentage': percentage
    })

# --- ADMIN API ENDPOINTS ---

@api_bp.route('/admin/login', methods=['POST'])
def api_admin_login():
    """Authentication for Admin Mobile Portal"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db()
    admin = db.execute('SELECT * FROM admin WHERE username = ?', (username,)).fetchone()
    db.close()
    
    if admin and check_password(admin['password'], password):
        return jsonify({
            'success': True,
            'user': {
                'id': admin['id'],
                'username': admin['username'],
                'role': 'admin'
            }
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@api_bp.route('/faculty/list', methods=['GET'])
def get_faculty_list():
    """Get all faculty for the Admin Portal"""
    search_query = request.args.get('search', '')
    faculties_rows = get_all_faculties_with_counts(search_query)
    faculties = [dict(row) for row in faculties_rows]
    return jsonify({'success': True, 'faculty': faculties})

@api_bp.route('/exams/all', methods=['GET'])
def get_all_exams():
    """Get all exams for the Admin Portal"""
    search_query = request.args.get('search', '')
    exams_rows = get_all_exams_admin(search_query)
    exams = [dict(row) for row in exams_rows]
    return jsonify({'success': True, 'exams': exams})

@api_bp.route('/admin/attempts', methods=['GET'])
def get_all_attempts():
    """Get all student attempts for the Admin Portal"""
    search_query = request.args.get('search', '')
    attempts_rows = get_all_attempts_admin(search_query)
    attempts = [dict(row) for row in attempts_rows]
    return jsonify({'success': True, 'attempts': attempts})

@api_bp.route('/admin/analytics', methods=['GET'])
def get_admin_analytics():
    """Get detailed analytics for the Admin Portal"""
    stats = get_admin_stats()
    deep_stats = get_system_analytics()
    return jsonify({
        'success': True,
        'stats': stats,
        'deep_stats': deep_stats
    })
