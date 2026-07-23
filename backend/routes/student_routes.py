from flask import Blueprint, render_template, request, redirect, url_for, flash
from database import get_db
import json

student_bp = Blueprint('student', __name__)

@student_bp.route('/access', methods=['GET', 'POST'])
def access():
    """Handle student entry via manual URL/Code."""
    if request.method == 'POST':
        raw_input = request.form.get('exam_url', '').strip()
        # Extract code from URL (e.g. /exam/CODE) or just use the code
        import re
        match = re.search(r'exam/([A-Z0-9-]+)', raw_input)
        exam_code = match.group(1) if match else raw_input.split('/')[-1].upper()
        
        return redirect(url_for('student.exam_landing', exam_code=exam_code))

    return render_template('student/access.html')

@student_bp.route('/exam/<exam_code>', methods=['GET'])
def exam_landing(exam_code):
    """Show exam registration page."""
    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND is_active = 1',
                      (exam_code,)).fetchone()
    db.close()

    if not exam:
        return render_template('student/exam_not_found.html'), 404

    return render_template('student/exam_landing.html', exam=exam)


@student_bp.route('/exam/<exam_code>/start', methods=['POST'])
def start_exam(exam_code):
    """Start the exam after student registration."""
    student_name = request.form.get('student_name', '').strip()
    reg_number = request.form.get('reg_number', '').strip().upper()

    if not all([student_name, reg_number]):
        flash('Please enter your full name and registration number.', 'error')
        return redirect(url_for('student.exam_landing', exam_code=exam_code))

    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ? AND is_active = 1',
                      (exam_code,)).fetchone()
    if not exam:
        db.close()
        return render_template('student/exam_not_found.html'), 404

    # Check if student already attempted
    existing = db.execute(
        'SELECT * FROM student_attempts WHERE reg_number = ? AND exam_code = ?',
        (reg_number, exam_code)
    ).fetchone()
    if existing:
        db.close()
        flash('You have already attempted this exam.', 'error')
        return redirect(url_for('student.exam_landing', exam_code=exam_code))

    # Check max capacity
    if exam['max_students'] and exam['max_students'] > 0:
        attempts_count = db.execute('SELECT COUNT(*) FROM student_attempts WHERE exam_code = ?', (exam_code,)).fetchone()[0]
        if attempts_count >= exam['max_students']:
            db.close()
            flash('This exam has reached its maximum enrollment capacity.', 'error')
            return redirect(url_for('student.exam_landing', exam_code=exam_code))

    import random
    
    questions = db.execute(
        'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE exam_code = ? ORDER BY id',
        (exam_code,)
    ).fetchall()
    db.close()

    if not questions:
        flash('This exam has no questions yet. Please contact your faculty.', 'error')
        return redirect(url_for('student.exam_landing', exam_code=exam_code))
        
    # Convert Row objects to dicts so we can manipulate them
    formatted_questions = []
    for q in questions:
        opts = [
            ('A', q['option_a']),
            ('B', q['option_b']),
            ('C', q['option_c']),
            ('D', q['option_d'])
        ]
        if exam['shuffle_options']:
            random.shuffle(opts)
            
        formatted_questions.append({
            'id': q['id'],
            'question_text': q['question_text'],
            'options': opts
        })
        
    if exam['randomize_questions']:
        random.shuffle(formatted_questions)

    return render_template('student/take_exam.html',
                           exam=exam,
                           questions=formatted_questions,
                           student_name=student_name,
                           reg_number=reg_number)


@student_bp.route('/exam/<exam_code>/submit', methods=['POST'])
def submit_exam(exam_code):
    """Submit exam answers and show results."""
    student_name = request.form.get('student_name', '').strip()
    reg_number = request.form.get('reg_number', '').strip().upper()

    db = get_db()
    exam = db.execute('SELECT * FROM exams WHERE exam_code = ?', (exam_code,)).fetchone()
    if not exam:
        db.close()
        return render_template('student/exam_not_found.html'), 404

    # Check duplicate submission
    existing = db.execute(
        'SELECT * FROM student_attempts WHERE reg_number = ? AND exam_code = ?',
        (reg_number, exam_code)
    ).fetchone()
    if existing:
        db.close()
        return render_template('student/result.html',
                               exam=exam,
                               student_name=existing['student_name'],
                               reg_number=existing['reg_number'],
                               score=existing['score'],
                               total=existing['total_questions'],
                               percentage=existing['percentage'],
                               already_submitted=True)

    questions = db.execute(
        'SELECT id, correct_answer FROM questions WHERE exam_code = ? ORDER BY id',
        (exam_code,)
    ).fetchall()

    total = len(questions)
    score = 0
    answers = {}

    for q in questions:
        answer = request.form.get(f'q_{q["id"]}', '')
        answers[str(q['id'])] = answer
        if answer.upper() == q['correct_answer'].upper():
            score += 1

    percentage = round((score / total * 100), 2) if total > 0 else 0
    from datetime import datetime
    now_str = datetime.now().isoformat()

    db.execute(
        '''INSERT INTO student_attempts (student_name, reg_number, exam_code, answers, score, total_questions, percentage, attempt_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (student_name, reg_number, exam_code, json.dumps(answers), score, total, percentage, now_str)
    )
    db.commit()
    db.close()

    return render_template('student/result.html',
                           exam=exam,
                           student_name=student_name,
                           reg_number=reg_number,
                           score=score,
                           total=total,
                           percentage=percentage,
                           already_submitted=False)
