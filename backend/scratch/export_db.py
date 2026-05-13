import mysql.connector

try:
    conn = mysql.connector.connect(
        host='127.0.0.1',
        user='root',
        password='',
        database='secure_exam_db'
    )
    cursor = conn.cursor(dictionary=True)
    
    with open('database_setup.sql', 'w', encoding='utf-8') as f:
        f.write("-- SecureExam Database Setup\n")
        f.write("CREATE DATABASE IF NOT EXISTS secure_exam_db;\n")
        f.write("USE secure_exam_db;\n\n")
        
        cursor.execute("SHOW TABLES")
        tables = [list(t.values())[0] for t in cursor.fetchall()]
        
        for table in tables:
            # Get Create Table
            cursor.execute(f"SHOW CREATE TABLE {table}")
            create_sql = cursor.fetchone()['Create Table']
            f.write(f"-- Table structure for {table}\n")
            f.write(f"{create_sql};\n\n")
            
            # Get Data
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            if rows:
                f.write(f"-- Data for {table}\n")
                for row in rows:
                    cols = ", ".join(row.keys())
                    vals = []
                    for v in row.values():
                        if v is None: vals.append("NULL")
                        elif isinstance(v, (int, float)): vals.append(str(v))
                        else: vals.append(f"'{str(v).replace(chr(39), chr(39)+chr(39))}'")
                    f.write(f"INSERT IGNORE INTO {table} ({cols}) VALUES ({', '.join(vals)});\n")
                f.write("\n")
                
    print("SUCCESS: database_setup.sql generated!")
    conn.close()
except Exception as e:
    print(f"ERROR: {str(e)}")
