import pymysql
import ssl
import json
from datetime import datetime

MYSQL_HOST = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'
MYSQL_PORT = 4000
MYSQL_USER = 'EzPuqJTV9UFbBBF.root'
MYSQL_PASSWORD = 'v5Z6pNX8tcFdQJx3'
MYSQL_DB = 'secure_exam_db'

def fetch_data():
    ssl_context = ssl.create_default_context()
    conn = pymysql.connect(
        host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
        password=MYSQL_PASSWORD, database=MYSQL_DB, ssl=ssl_context
    )
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    data = {}
    
    # Fetch Faculty
    cursor.execute("SELECT id, faculty_id, name, email, department, temp_flag FROM faculty")
    data['faculty'] = cursor.fetchall()
    
    # Fetch Exams
    cursor.execute("SELECT id, exam_code, exam_name, faculty_id, subject, is_active FROM exams")
    data['exams'] = cursor.fetchall()
    
    # Fetch Students
    cursor.execute("SELECT id, student_name, reg_number, exam_code, score, percentage, attempt_date FROM student_attempts")
    data['student_attempts'] = cursor.fetchall()
    
    conn.close()
    
    with open('tidb_data_dump.json', 'w') as f:
        json.dump(data, f, indent=4)
    print("Data dumped successfully.")

if __name__ == '__main__':
    fetch_data()
