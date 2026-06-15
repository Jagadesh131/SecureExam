import pytest
from database_local import get_db

def test_answers_not_in_student_payload(client):
    """Test 13: Verify that correct answers are not sent to the frontend."""
    # First, login and create an exam with a question
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
        
    client.post('/faculty/exam/create', data={
        'exam_name': 'Security Test', 'subject': 'Testing', 'duration': '60', 'passing_percentage': '40'
    })
    
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Security Test'").fetchone()
    exam_code = exam['exam_code']
    
    client.post(f'/faculty/exam/{exam_code}/status', data={'is_active': 'on'})
    client.post(f'/faculty/exam/{exam_code}/questions/add', data={
        'question_text': 'Secret Question', 'option_a': 'A', 'option_b': 'B', 'option_c': 'C', 'option_d': 'D', 'correct_answer': 'A'
    })

    # Now simulate student starting the exam
    response = client.post(f'/exam/{exam_code}/start', data={
        'student_name': 'Hacker',
        'reg_number': 'HACK01'
    })
    
    # Verify the correct answer 'A' is not explicitly flagged as the correct_answer in the rendered HTML
    # We check that the literal database column or a JSON dump of the answer doesn't exist
    assert b'correct_answer' not in response.data.lower()

def test_duplicate_submission_blocked(client):
    """Test 15 & 19: Try multiple submissions using the same registration number."""
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Security Test'").fetchone()
    exam_code = exam['exam_code']
    
    # First submission
    client.post(f'/student/exam/{exam_code}/submit', data={
        'student_name': 'Honest Student',
        'reg_number': 'STU001'
    })
    
    # Second submission (should be blocked or return already submitted flag)
    client.post(f'/student/exam/{exam_code}/submit', data={
        'student_name': 'Honest Student',
        'reg_number': 'STU001'
    })
    
    # Verify only ONE record exists
    attempts = db.execute("SELECT * FROM student_attempts WHERE reg_number = 'STU001'").fetchall()
    assert len(attempts) == 1

def test_password_storage():
    """Test 16: Check whether faculty passwords are stored securely."""
    db = get_db()
    admin = db.execute("SELECT * FROM admin WHERE username = 'admin'").fetchone()
    assert admin is not None
    # Ensure it's a hash, not plain text (Werkzeug hashes start with pbkdf2: or scrypt:)
    assert admin['password'].startswith('pbkdf2:') or admin['password'].startswith('scrypt:')
    assert 'admin123' not in admin['password']
