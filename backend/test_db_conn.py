import sqlite3
import os

DB_PATH = 'mcq_exam.db'

def test_connection():
    print(f"🔍 Testing connection to {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"❌ Error: {DB_PATH} not found!")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        print("✅ Successfully connected to SQLite.")
        
        # Check tables
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Tables found: {', '.join(tables)}")
        
        # Check Faculty count
        if 'faculty' in tables:
            count = cursor.execute("SELECT COUNT(*) FROM faculty").fetchone()[0]
            print(f"👩‍🏫 Faculty count: {count}")
            if count > 0:
                faculty = cursor.execute("SELECT faculty_id, name FROM faculty LIMIT 1").fetchone()
                print(f"   Sample: {faculty['name']} ({faculty['faculty_id']})")

        # Check Exams
        if 'exams' in tables:
            count = cursor.execute("SELECT COUNT(*) FROM exams").fetchone()[0]
            print(f"📝 Exams count: {count}")

        conn.close()
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

if __name__ == "__main__":
    test_connection()
