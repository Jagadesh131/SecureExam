import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("--- SEARCHING FOR 'PYTHON' EXAMS ---")
exams = db.collection('exams').stream()
found = False
for e in exams:
    data = e.to_dict()
    name = data.get('exam_name', '').lower()
    if 'python' in name or 'phython' in name:
        print(f"FOUND: ID={e.id} | Name={data.get('exam_name')} | Faculty={data.get('faculty_id')}")
        found = True

if not found:
    print("No exam named 'Python' or 'phython' found in the entire database.")

print("\n--- ALL EXAMS LIST ---")
exams = db.collection('exams').stream()
for e in exams:
    data = e.to_dict()
    print(f"- {data.get('exam_name')} ({e.id}) by {data.get('faculty_id')}")

print("--- END ---")
