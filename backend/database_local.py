import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

def hash_password(password):
    """Hash a password using Werkzeug scrypt."""
    return generate_password_hash(password)

def get_db():
    """Create a new database connection."""
    conn = sqlite3.connect('mcq_exam.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the SQLite database with the required schema."""
    conn = get_db()

    # 1. Admin Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )''')

    # 2. Faculty Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faculty_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        phone VARCHAR(255),
        birthday VARCHAR(255),
        created_date VARCHAR(255),
        temp_flag INT DEFAULT 0,
        reset_token VARCHAR(255),
        token_expiry VARCHAR(255)
    )''')

    # 3. Exams Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_code VARCHAR(255) UNIQUE NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        faculty_id VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        duration INT,
        is_active INT DEFAULT 0,
        instructions TEXT,
        passing_percentage INT DEFAULT 40,
        created_date VARCHAR(255),
        FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id) ON DELETE CASCADE
    )''')

    # 3.5. Categories Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_code VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(20) DEFAULT '#3B82F6',
        FOREIGN KEY (exam_code) REFERENCES exams (exam_code) ON DELETE CASCADE
    )''')

    # 4. Questions Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_code VARCHAR(255) NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        difficulty VARCHAR(255) DEFAULT 'Medium',
        category_id INT NULL,
        FOREIGN KEY (exam_code) REFERENCES exams (exam_code) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    )''')

    # 5. Student Attempts Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS student_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name VARCHAR(255) NOT NULL,
        reg_number VARCHAR(255) NOT NULL,
        exam_code VARCHAR(255) NOT NULL,
        answers TEXT,
        score INT,
        total_questions INT,
        percentage DOUBLE,
        time_taken INT,
        attempt_date VARCHAR(255),
        FOREIGN KEY (exam_code) REFERENCES exams (exam_code) ON DELETE CASCADE
    )''')

    # 6. Activity Logs Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_type VARCHAR(255),
        user_id VARCHAR(255),
        action TEXT,
        timestamp VARCHAR(255)
    )''')

    # 7. Backups Table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        size VARCHAR(255),
        created_date VARCHAR(255)
    )''')

    # Insert default admin if not exists
    row = conn.execute("SELECT * FROM admin WHERE username = 'admin'").fetchone()
    if not row:
        hashed_pw = hash_password('admin123')
        conn.execute("INSERT INTO admin (username, password) VALUES (?, ?)", ('admin', hashed_pw))
    
    conn.commit()
    conn.close()
    print("[OK] Database initialized successfully with SQLite.")

def log_activity(user_type, user_id, action):
    """Log system activity."""
    conn = get_db()
    conn.execute(
        "INSERT INTO activity_logs (user_type, user_id, action, timestamp) VALUES (?, ?, ?, ?)",
        (user_type, user_id, action, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def generate_id(prefix, length=6):
    """Generate a unique ID with a prefix and random characters."""
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    unique_part = ''.join(random.choices(chars, k=length))
    return f"{prefix}-{unique_part}"

def check_password(hashed_password, user_password):
    """Verify a password against its hash."""
    if hashed_password.startswith('scrypt:'):
        return check_password_hash(hashed_password, user_password)
    import hashlib
    return hashed_password == hashlib.sha256(user_password.encode()).hexdigest()

def get_admin_stats():
    """Get statistics for the admin dashboard including department breakdown."""
    db = get_db()
    stats = {
        'total_faculty': db.execute('SELECT COUNT(*) FROM faculty').fetchone()[0],
        'total_exams': db.execute('SELECT COUNT(*) FROM exams').fetchone()[0],
        'total_attempts': db.execute('SELECT COUNT(*) FROM student_attempts').fetchone()[0],
        'active_exams': db.execute('SELECT COUNT(*) FROM exams WHERE is_active = 1').fetchone()[0]
    }
    
    # Get department breakdown
    dept_rows = db.execute('SELECT department, COUNT(*) as count FROM faculty GROUP BY department').fetchall()
    stats['dept_stats'] = {row['department'] or 'General': row['count'] for row in dept_rows}
    
    db.close()
    return stats

def get_all_faculties_with_counts(search_query=''):
    """Get all faculties with their exam and question counts, searchable by name, ID, or department."""
    db = get_db()
    query = """
        SELECT f.*, 
               (SELECT COUNT(*) FROM exams WHERE faculty_id = f.faculty_id) as exam_count
        FROM faculty f
    """
    if search_query:
        query += " WHERE f.name LIKE ? OR f.faculty_id LIKE ? OR f.department LIKE ?"
        faculties = db.execute(query, (f'%{search_query}%', f'%{search_query}%', f'%{search_query}%')).fetchall()
    else:
        faculties = db.execute(query).fetchall()
    db.close()
    return [dict(row) for row in faculties]

def get_faculty_exams_with_counts(faculty_id, search_query=''):
    """Get all exams for a specific faculty with student attempt counts, searchable by name, code, or subject."""
    db = get_db()
    query = """
        SELECT e.*, 
               (SELECT COUNT(*) FROM questions WHERE exam_code = e.exam_code) as question_count,
               (SELECT COUNT(*) FROM student_attempts WHERE exam_code = e.exam_code) as attempt_count
        FROM exams e
        WHERE e.faculty_id = ?
    """
    params = [faculty_id]
    if search_query:
        query += " AND (e.exam_name LIKE ? OR e.exam_code LIKE ? OR e.subject LIKE ?)"
        params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])
    
    query += " ORDER BY e.created_date DESC"
    exams = db.execute(query, tuple(params)).fetchall()
    db.close()
    return [dict(row) for row in exams]

def get_all_exams_admin(search_query=''):
    """Get all exams with faculty and department details, searchable by name, code, subject, or department."""
    db = get_db()
    query = """
        SELECT e.*, f.name as faculty_name, f.department as faculty_dept,
               (SELECT COUNT(*) FROM student_attempts WHERE exam_code = e.exam_code) as attempt_count
        FROM exams e
        LEFT JOIN faculty f ON e.faculty_id = f.faculty_id
    """
    if search_query:
        query += " WHERE e.exam_name LIKE ? OR e.exam_code LIKE ? OR e.subject LIKE ? OR f.department LIKE ?"
        exams = db.execute(query, (f'%{search_query}%', f'%{search_query}%', f'%{search_query}%', f'%{search_query}%')).fetchall()
    else:
        exams = db.execute(query + " ORDER BY e.created_date DESC").fetchall()
    db.close()
    return [dict(row) for row in exams]

def get_all_attempts_admin(search_query=''):
    """Get all student attempts across the system for admin review."""
    db = get_db()
    query = """
        SELECT s.*, e.exam_name, f.name as faculty_name, f.department as faculty_dept
        FROM student_attempts s
        JOIN exams e ON s.exam_code = e.exam_code
        JOIN faculty f ON e.faculty_id = f.faculty_id
    """
    if search_query:
        query += " WHERE s.student_name LIKE ? OR s.reg_number LIKE ? OR e.exam_name LIKE ? OR f.department LIKE ?"
        attempts = db.execute(query, (f'%{search_query}%', f'%{search_query}%', f'%{search_query}%', f'%{search_query}%')).fetchall()
    else:
        attempts = db.execute(query + " ORDER BY s.attempt_date DESC").fetchall()
    db.close()
    return [dict(row) for row in attempts]

def get_system_analytics():
    """Calculate deep analytics for the admin dashboard."""
    db = get_db()
    
    avg_score = db.execute("SELECT AVG(percentage) FROM student_attempts").fetchone()[0] or 0
    pass_count = db.execute("SELECT COUNT(*) FROM student_attempts WHERE percentage >= 40").fetchone()[0] or 0
    fail_count = db.execute("SELECT COUNT(*) FROM student_attempts WHERE percentage < 40").fetchone()[0] or 0
    
    peak_date = db.execute("""
        SELECT substr(attempt_date, 1, 10) as day, COUNT(*) as count 
        FROM student_attempts 
        GROUP BY day ORDER BY count DESC LIMIT 1
    """).fetchone()
    
    top_exam = db.execute("""
        SELECT e.exam_name, AVG(s.percentage) as avg_p
        FROM student_attempts s
        JOIN exams e ON s.exam_code = e.exam_code
        GROUP BY e.exam_code ORDER BY avg_p DESC LIMIT 1
    """).fetchone()

    db.close()
    return {
        'avg_score': round(float(avg_score), 1),
        'pass_rate': round((pass_count / (pass_count + fail_count) * 100), 1) if (pass_count + fail_count) > 0 else 0,
        'peak_day': peak_date['day'] if peak_date else 'N/A',
        'top_exam': top_exam['exam_name'] if top_exam else 'N/A'
    }

if __name__ == '__main__':
    init_db()
