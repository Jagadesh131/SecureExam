import sqlite3
import os

DB_PATH = os.path.join(os.getcwd(), 'backend', 'mcq_exam.db')

def check_health():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Database Health Report ---")
    
    # Check Faculty
    faculties = cursor.execute("SELECT * FROM faculty").fetchall()
    print(f"Total Faculties: {len(faculties)}")
    
    no_dept = []
    for f in faculties:
        # Check if department is None, empty string, or just whitespace
        dept = f['department']
        if dept is None or str(dept).strip() == "":
            no_dept.append(f['name'])
            
    if no_dept:
        print(f"[!] Warning: {len(no_dept)} faculties have NO department set: {no_dept}")
    else:
        print("[OK] All faculties have departments assigned.")

    # Check Exams
    exams = cursor.execute("SELECT * FROM exams").fetchall()
    print(f"Total Exams: {len(exams)}")
    
    # Check for Orphaned Exams (pointing to non-existent faculty)
    orphans = cursor.execute("""
        SELECT e.exam_code, e.exam_name, e.faculty_id
        FROM exams e 
        LEFT JOIN faculty f ON e.faculty_id = f.faculty_id 
        WHERE f.faculty_id IS NULL
    """).fetchall()
    
    if orphans:
        print(f"[ERROR] {len(orphans)} Orphaned exams found (No matching faculty):")
        for o in orphans:
            print(f"   - {o['exam_code']}: {o['exam_name']} (Points to: {o['faculty_id']})")
    else:
        print("[OK] No orphaned exams found.")

    # Check Departments
    depts = cursor.execute("SELECT DISTINCT department FROM faculty").fetchall()
    dept_list = [d['department'] for d in depts if d['department']]
    print(f"Unique Departments found: {dept_list}")

    conn.close()

if __name__ == "__main__":
    check_health()
