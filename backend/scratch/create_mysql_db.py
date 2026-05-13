import mysql.connector

try:
    # Connect to MySQL Server (XAMPP default)
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password=""
    )
    cursor = conn.cursor()
    
    # Create the database
    cursor.execute("CREATE DATABASE IF NOT EXISTS secure_exam_db")
    print("[SUCCESS] Database 'secure_exam_db' created or already exists.")
    
    conn.commit()
    cursor.close()
    conn.close()
except Exception as e:
    print(f"[ERROR] Could not connect to MySQL or create database: {e}")
