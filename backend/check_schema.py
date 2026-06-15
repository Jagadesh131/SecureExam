import sqlite3

conn = sqlite3.connect('mcq_exam.db')
cursor = conn.cursor()

cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='faculty'")
print(cursor.fetchone()[0])
