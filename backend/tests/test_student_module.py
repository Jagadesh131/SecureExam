import pytest
import json
from database_local import get_db

@pytest.fixture
def test_exam(client):
    """Fixture to create an active exam with questions for testing."""
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
        
    client.post('/faculty/exam/create', data={
        'exam_name': 'Student Test Exam', 'subject': 'Testing', 'duration': '60', 'passing_percentage': '40'
    })
    
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Student Test Exam'").fetchone()
    exam_code = exam['exam_code']
    
    # Activate Exam
    client.post(f'/faculty/exam/{exam_code}/status', data={'is_active': 'on'})
    
    # Add Questions
    client.post(f'/faculty/exam/{exam_code}/questions/add', data={
        'question_text': 'Q1', 'option_a': 'A', 'option_b': 'B', 'option_c': 'C', 'option_d': 'D', 'correct_answer': 'A'
    })
    client.post(f'/faculty/exam/{exam_code}/questions/add', data={
        'question_text': 'Q2', 'option_a': 'A', 'option_b': 'B', 'option_c': 'C', 'option_d': 'D', 'correct_answer': 'B'
    })
    
    return exam_code

def test_join_invalid_exam(client):
    """Test 8: Invalid Exam Code."""
    response = client.get('/exam/INVALIDCODE')
    assert response.status_code == 404
    assert b'Exam Not Found' in response.data or b'not active' in response.data.lower() or b'Invalid' in response.data

def test_join_valid_exam(client, test_exam):
    """Test 7: Join valid exam."""
    response = client.get(f'/exam/{test_exam}')
    assert response.status_code == 200
    assert b'Student Test Exam' in response.data
    
def test_attempt_and_submit_exam(client, test_exam):
    """Test 9 & 10: Attempt exam and verify score calculation."""
    # Start Exam
    response = client.post(f'/exam/{test_exam}/start', data={
        'student_name': 'Alice Smith',
        'reg_number': 'REG123'
    })
    assert response.status_code == 200
    assert b'Q1' in response.data
    assert b'Q2' in response.data
    
    # Get question IDs
    db = get_db()
    questions = db.execute("SELECT id FROM questions WHERE exam_code = ?", (test_exam,)).fetchall()
    q1_id, q2_id = questions[0]['id'], questions[1]['id']
    
    # Submit Answers (1 correct, 1 wrong)
    submit_response = client.post(f'/exam/{test_exam}/submit', data={
        'student_name': 'Alice Smith',
        'reg_number': 'REG123',
        f'q_{q1_id}': 'A', # Correct
        f'q_{q2_id}': 'C'  # Wrong (correct is B)
    })
    
    assert submit_response.status_code == 200
    
    # Verify DB calculation
    attempt = db.execute("SELECT * FROM student_attempts WHERE reg_number = 'REG123'").fetchone()
    assert attempt is not None
    assert attempt['score'] == 1
    assert attempt['total_questions'] == 2
    assert attempt['percentage'] == 50.0

def test_auto_submission(client, test_exam):
    """Test 12: Verify auto submission via POST."""
    db = get_db()
    questions = db.execute("SELECT id FROM questions WHERE exam_code = ?", (test_exam,)).fetchall()
    q1_id = questions[0]['id']
    
    submit_response = client.post(f'/exam/{test_exam}/submit', data={
        'student_name': 'Bob Jones',
        'reg_number': 'REG456',
        f'q_{q1_id}': 'A', 
        'auto_submit': 'true' # Simulating frontend auto submit
    })
    
    assert submit_response.status_code == 200
    attempt = db.execute("SELECT * FROM student_attempts WHERE reg_number = 'REG456'").fetchone()
    assert attempt['score'] == 1
