import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("--- EXAMS AUDIT ---")
exams = db.collection('exams').stream()
for e in exams:
    data = e.to_dict()
    print(f"Exam: {data.get('exam_code')} | Name: {data.get('exam_name')} | Faculty: {data.get('faculty_id')}")
print("--- END ---")
