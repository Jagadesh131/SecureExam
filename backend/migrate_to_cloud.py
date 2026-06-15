import sqlite3
import os
import pymysql
import ssl

# SQLite Local DB
LOCAL_DB = 'mcq_exam.db'

# TiDB Cloud DB Config
MYSQL_HOST = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'
MYSQL_PORT = 4000
MYSQL_USER = 'EzPuqJTV9UFbBBF.root'
MYSQL_PASSWORD = 'v5Z6pNX8tcFdQJx3'
MYSQL_DB = 'secure_exam_db'

def get_cloud_conn():
    ssl_context = ssl.create_default_context()
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        ssl=ssl_context
    )

def migrate():
    print("🚀 Starting Database Migration to TiDB Cloud...")
    
    if not os.path.exists(LOCAL_DB):
        print("❌ No local database (mcq_exam.db) found!")
        return

    try:
        local_conn = sqlite3.connect(LOCAL_DB)
        local_conn.row_factory = sqlite3.Row
        local_cursor = local_conn.cursor()

        cloud_conn = get_cloud_conn()
        cloud_cursor = cloud_conn.cursor()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return

    tables = [
        'admin',
        'faculty',
        'exams',
        'categories',
        'questions',
        'student_attempts',
        'activity_logs'
    ]

    cloud_cursor.execute("SET FOREIGN_KEY_CHECKS=0")

    for table in tables:
        print(f"\n📦 Migrating table: {table}...")
        
        # Clear cloud table first
        cloud_cursor.execute(f"SET FOREIGN_KEY_CHECKS=0")
        try:
            cloud_cursor.execute(f"TRUNCATE TABLE {table}")
        except Exception:
            pass
        
        # Read from local
        try:
            local_cursor.execute(f"SELECT * FROM {table}")
            rows = local_cursor.fetchall()
        except sqlite3.OperationalError:
            print(f"  ⚠️ Local table {table} does not exist. Skipping.")
            continue
        
        if not rows:
            print(f"  ✓ No records found. Skipped.")
            continue
            
        columns = rows[0].keys()
        placeholders = ', '.join(['%s'] * len(columns))
        col_names = ', '.join(columns)
        
        query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
        
        success_count = 0
        for row in rows:
            values = tuple(row)
            try:
                cloud_cursor.execute(query, values)
                success_count += 1
            except Exception as e:
                print(f"  ❌ Error inserting row: {e}")
                
        print(f"  ✓ Migrated {success_count} records.")
        cloud_conn.commit()

    cloud_cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    local_conn.close()
    cloud_conn.close()
    print("\n✅ Migration Complete! Your cloud database is now perfectly synced.")

if __name__ == '__main__':
    migrate()
