import json
import os
import sys

os.environ['USE_OFFLINE_DB']='0'
from database import get_db, hash_password

def restore():
    print("Reading tidb_data_dump.json...")
    try:
        with open('../tidb_data_dump.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading dump file: {e}")
        return

    db = get_db()
    
    # 1. Restore Faculty
    for fac in data.get('faculty', []):
        # Check if email exists
        existing = db.execute("SELECT faculty_id FROM faculty WHERE email = %s", (fac['email'],)).fetchone()
        if existing and existing['faculty_id'] != fac['faculty_id']:
            # Rename old email to avoid unique constraint
            old_id = existing['faculty_id']
            new_email = fac['email'].replace('@', f"_old_{old_id}@")
            db.execute("UPDATE faculty SET email = %s WHERE faculty_id = %s", (new_email, old_id))
            print(f"Moved old faculty {old_id} email to {new_email} to avoid conflict.")
        
        # Check if faculty already exists
        exists = db.execute("SELECT * FROM faculty WHERE faculty_id = %s", (fac['faculty_id'],)).fetchone()
        if not exists:
            pw = hash_password('faculty123')
            db.execute(
                "INSERT INTO faculty (faculty_id, name, email, password, department, temp_flag) VALUES (%s, %s, %s, %s, %s, %s)",
                (fac['faculty_id'], fac['name'], fac['email'], pw, fac['department'], fac.get('temp_flag', 0))
            )
            print(f"Inserted Faculty: {fac['name']} ({fac['faculty_id']})")
        else:
            print(f"Faculty {fac['faculty_id']} already exists. Updating...")
            db.execute(
                "UPDATE faculty SET name=%s, email=%s WHERE faculty_id=%s",
                (fac['name'], fac['email'], fac['faculty_id'])
            )

    # 2. Restore Exams
    for exam in data.get('exams', []):
        exists = db.execute("SELECT * FROM exams WHERE exam_code = %s", (exam['exam_code'],)).fetchone()
        if not exists:
            db.execute(
                "INSERT INTO exams (exam_code, exam_name, faculty_id, subject, is_active) VALUES (%s, %s, %s, %s, %s)",
                (exam['exam_code'], exam['exam_name'], exam['faculty_id'], exam['subject'], exam.get('is_active', 0))
            )
            print(f"Inserted Exam: {exam['exam_name']} ({exam['exam_code']})")
        else:
            print(f"Exam {exam['exam_code']} already exists.")

    db.commit()
    db.close()
    print("\n✅ Restore from JSON Dump Complete!")

if __name__ == '__main__':
    restore()
