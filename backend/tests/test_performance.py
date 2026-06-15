import pytest
import time
import threading
from database_local import get_db

def test_concurrent_submissions(client):
    """Test 20 & 21: Simulate 10-20 students submitting exams simultaneously."""
    # First, setup an exam
    with client.session_transaction() as sess:
        sess['faculty_logged_in'] = True
        sess['faculty_id'] = 'FAC001'
        
    client.post('/faculty/exam/create', data={
        'exam_name': 'Performance Test', 'subject': 'Stress Testing', 'duration': '60', 'passing_percentage': '40'
    })
    
    db = get_db()
    exam = db.execute("SELECT * FROM exams WHERE exam_name = 'Performance Test'").fetchone()
    exam_code = exam['exam_code']
    
    client.post(f'/faculty/exam/{exam_code}/status', data={'is_active': 'on'})
    client.post(f'/faculty/exam/{exam_code}/questions/add', data={
        'question_text': 'Load Q1', 'option_a': 'A', 'option_b': 'B', 'option_c': 'C', 'option_d': 'D', 'correct_answer': 'A'
    })
    
    questions = db.execute("SELECT id FROM questions WHERE exam_code = ?", (exam_code,)).fetchall()
    q1_id = questions[0]['id']

    # Function to simulate a single student submission
    def simulate_student(student_id, results):
        reg_number = f"PERF{student_id:03d}"
        
        start_time = time.time()
        response = client.post(f'/exam/{exam_code}/submit', data={
            'student_name': f'Stress Tester {student_id}',
            'reg_number': reg_number,
            f'q_{q1_id}': 'A'
        })
        end_time = time.time()
        
        results.append({
            'reg_number': reg_number,
            'status_code': response.status_code,
            'response_time': end_time - start_time
        })

    # Spawn 20 threads to simulate concurrent submissions
    threads = []
    results = []
    num_students = 20
    
    for i in range(num_students):
        thread = threading.Thread(target=simulate_student, args=(i, results))
        threads.append(thread)
        
    # Start all threads simultaneously
    for thread in threads:
        thread.start()
        
    # Wait for all to finish
    for thread in threads:
        thread.join()

    # Verify all 20 submissions succeeded (Status 200)
    for result in results:
        assert result['status_code'] == 200
        # Test 22: Verify response time is relatively fast (under 1 second per request even under load)
        assert result['response_time'] < 1.0

    # Verify exactly 20 records exist in DB
    db = get_db()
    attempts = db.execute("SELECT COUNT(*) as count FROM student_attempts WHERE exam_code = ?", (exam_code,)).fetchone()
    assert attempts['count'] == 20
