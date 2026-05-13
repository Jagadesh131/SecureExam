import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Check all exams
print("--- ALL EXAMS ---")
exams = db.collection('exams').stream()
for e in exams:
    print(f"ID: {e.id} | Data: {e.to_dict()}")

# Check specific faculty (from screenshot: FACB6A500A1)
faculty_id = 'FACB6A500A1'
print(f"\n--- EXAMS FOR {faculty_id} ---")
f_exams = db.collection('exams').where('faculty_id', '==', faculty_id).stream()
count = 0
for e in f_exams:
    print(f"ID: {e.id} | Data: {e.to_dict()}")
    count += 1
print(f"Total for {faculty_id}: {count}")
