import sqlite3
import os

DB_PATH = os.path.join(os.getcwd(), 'backend', 'mcq_exam.db')

def list_faculties():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Faculty Department Listing ---")
    faculties = cursor.execute("SELECT name, department FROM faculty").fetchall()
    for f in faculties:
        print(f"{f['name']}: {f['department']}")

    conn.close()

if __name__ == "__main__":
    list_faculties()
