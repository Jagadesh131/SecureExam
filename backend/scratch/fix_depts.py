import sqlite3
import os

DB_PATH = os.path.join(os.getcwd(), 'backend', 'mcq_exam.db')

def standardize_departments():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Database Alignment Initialized ---")
    
    # Update 'Computer Science' to 'CSE'
    cursor.execute("UPDATE faculty SET department = 'CSE' WHERE department = 'Computer Science'")
    changed = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    print(f"✅ Success: {changed} faculty members migrated to 'CSE' department.")
    print("🚀 All departmental intelligence views are now synchronized.")

if __name__ == "__main__":
    standardize_departments()
