import sqlite3
import firebase_admin
from firebase_admin import credentials, firestore
import os

# SQLite check
db_path = 'mcq_exam.db'
sqlite_counts = {}
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    tables = ['admins', 'faculty', 'exams', 'questions', 'student_attempts']
    for table in tables:
        try:
            cursor.execute(f"SELECT count(*) FROM {table}")
            sqlite_counts[table] = cursor.fetchone()[0]
        except:
            sqlite_counts[table] = "Error/Missing"
    conn.close()

# Firestore check
cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

firestore_counts = {}
collections = ['admins', 'faculty', 'exams', 'questions', 'student_attempts']
for coll in collections:
    docs = db.collection(coll).stream()
    count = sum(1 for _ in docs)
    firestore_counts[coll] = count

print(f"{'Table/Collection':<20} | {'SQLite Count':<15} | {'Firestore Count':<15}")
print("-" * 55)
for item in collections:
    s_count = sqlite_counts.get(item, 0)
    f_count = firestore_counts.get(item, 0)
    status = "✅ Match" if str(s_count) == str(f_count) else "❌ Mismatch"
    print(f"{item:<20} | {s_count:<15} | {f_count:<15} | {status}")
