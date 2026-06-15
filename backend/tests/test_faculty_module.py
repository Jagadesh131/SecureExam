import pytest
import json
from database_local import hash_password, get_db

def test_faculty_login_success(client):
    """Test 1: Verify successful login."""
    # Setup test faculty
    db = get_db()
    hashed = hash_password('TestPass@123')
    db.execute("INSERT INTO faculty (faculty_id, name, email, password, temp_flag) VALUES (?, ?, ?, ?, ?)",
               ('FAC001', 'John Doe', 'john@example.com', hashed, 0))
    db.commit()

    response = client.post('/faculty/authenticate', data={
        'faculty_id': 'FAC001',
        'password': 'TestPass@123'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    assert b'Welcome, John Doe' in response.data or b'Dashboard' in response.data

def test_faculty_login_incorrect_password(client):
    """Test 2: Test login with incorrect password."""
    response = client.post('/faculty/authenticate', data={
        'faculty_id': 'FAC001',
        'password': 'WrongPassword123'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    assert b'Invalid Faculty ID or password' in response.data

def test_create_exam_and_questions(client):
    """Test 3 & 4: Create exam and verify questions are saved properly."""
    # Login first
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
        sess['faculty_name'] = 'John Doe'
    
    # Create Exam
    response = client.post('/faculty/exam/create', data={
        'exam_name': 'Midterm Physics',
        'subject': 'Physics 101',
        'duration': '60',
        'passing_percentage': '40',
        'instructions': 'Answer all questions.'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    
    # Get the generated exam_code
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Midterm Physics'").fetchone()
    assert exam is not None
    exam_code = exam['exam_code']
    
    # Add a Question
    response = client.post(f'/faculty/exam/{exam_code}/questions/add', data={
        'question_text': 'What is the speed of light?',
        'option_a': '3x10^8 m/s',
        'option_b': 'Sound speed',
        'option_c': 'Mach 1',
        'option_d': 'Zero',
        'correct_answer': 'A',
        'difficulty': 'Easy'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    
    # Verify question is saved properly
    question = db.execute("SELECT * FROM questions WHERE exam_code = ?", (exam_code,)).fetchone()
    assert question is not None
    assert question['correct_answer'] == 'A'
    assert question['option_a'] == '3x10^8 m/s'

def test_edit_delete_question(client):
    """Test 5: Edit and delete questions."""
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Midterm Physics'").fetchone()
    exam_code = exam['exam_code']
    question = db.execute("SELECT * FROM questions WHERE exam_code = ?", (exam_code,)).fetchone()
    q_id = question['id']
    
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
    
    # Edit
    client.post(f'/faculty/exam/{exam_code}/questions/{q_id}/edit', data={
        'question_text': 'Updated Speed of Light?',
        'option_a': 'Updated A',
        'option_b': 'B',
        'option_c': 'C',
        'option_d': 'D',
        'correct_answer': 'B',
        'difficulty': 'Medium'
    })
    
    updated_q = db.execute("SELECT * FROM questions WHERE id = ?", (q_id,)).fetchone()
    assert updated_q['correct_answer'] == 'B'
    assert updated_q['question_text'] == 'Updated Speed of Light?'
    
    # Delete
    client.post(f'/faculty/exam/{exam_code}/questions/{q_id}/delete')
    deleted_q = db.execute("SELECT * FROM questions WHERE id = ?", (q_id,)).fetchone()
    assert deleted_q is None

def test_unique_exam_codes(client):
    """Test 6: Check whether exam codes are generated uniquely."""
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
        
    client.post('/faculty/exam/create', data={
        'exam_name': 'Test 1', 'subject': 'Sub 1', 'duration': '60', 'passing_percentage': '40'
    })
    client.post('/faculty/exam/create', data={
        'exam_name': 'Test 2', 'subject': 'Sub 2', 'duration': '60', 'passing_percentage': '40'
    })
    
    db = get_db()
    exams = db.execute("SELECT exam_code FROM exams WHERE faculty_id = 'FAC001'").fetchall()
    codes = [e['exam_code'] for e in exams]
    assert len(codes) == len(set(codes)) # All unique
