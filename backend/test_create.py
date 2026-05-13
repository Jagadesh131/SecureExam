import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Simulated create_exam
def simulate_create(exam_code, exam_name, faculty_id, subject, duration):
    data = {
        'exam_code': exam_code,
        'exam_name': exam_name,
        'faculty_id': faculty_id,
        'subject': subject,
        'duration': duration,
        'created_date': datetime.now().isoformat(),
        'is_active': 0
    }
    print(f"Attempting to save: {data}")
    db.collection('exams').document(exam_code).set(data)
    print("Save command issued.")

simulate_create('EXAM_TEST_1', 'Test Simulation', 'FACB6A500A1', 'QA', 30)

# Check if it exists now
doc = db.collection('exams').document('EXAM_TEST_1').get()
if doc.exists:
    print("SUCCESS: Exam exists in Firestore!")
else:
    print("FAILURE: Exam not found after set()!")
