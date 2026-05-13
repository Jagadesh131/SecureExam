import sqlite3
import firebase_admin
from firebase_admin import credentials, firestore
import os

db_path = 'mcq_exam.db'
cred_path = 'firebase-sdk.json'

# SIDE-BY-SIDE DATA CHECK
def get_counts():
    counts = []
    tables = ['admins', 'faculty', 'exams', 'questions', 'student_attempts']
    
    # SQLite
    sqlite_data = {}
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        for t in tables:
            try:
                c.execute(f"SELECT COUNT(*) FROM {t}")
                sqlite_data[t] = c.fetchone()[0]
            except: sqlite_data[t] = 0
        conn.close()

    # Firestore
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print("DATA_VERIFICATION_START")
    for t in tables:
        docs = db.collection(t).stream()
        f_count = sum(1 for _ in docs)
        s_count = sqlite_data.get(t, 0)
        print(f"REPORT|{t}|SQLite:{s_count}|Firestore:{f_count}")
    print("DATA_VERIFICATION_END")

get_counts()
