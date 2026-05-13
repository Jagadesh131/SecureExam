import mysql.connector

class CustomRow:
    def __init__(self, keys, values):
        self._keys = keys
        self._values = values
        
    def __getitem__(self, item):
        if isinstance(item, int):
            return self._values[item]
        elif isinstance(item, str):
            if item in self._keys:
                return self._values[self._keys.index(item)]
            raise KeyError(item)
        raise TypeError(f"Invalid argument type: {type(item)}")
        
    def keys(self):
        return self._keys
        
    def __iter__(self):
        return iter(self._values)

class MySQLCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor
        
    def fetchone(self):
        row = self.cursor.fetchone()
        if not row:
            return None
        return CustomRow(self.cursor.column_names, row)
        
    def fetchall(self):
        rows = self.cursor.fetchall()
        return [CustomRow(self.cursor.column_names, row) for row in rows]

class MySQLConnWrapper:
    def __init__(self, conn):
        self.conn = conn
        
    def execute(self, query, params=None):
        cursor = self.conn.cursor()
        mysql_query = query.replace('?', '%s')
        if params:
            cursor.execute(mysql_query, params)
        else:
            cursor.execute(mysql_query)
        return MySQLCursorWrapper(cursor)
        
    def commit(self):
        self.conn.commit()
        
    def close(self):
        self.conn.close()

def get_db():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='secure_exam_db'
    )
    return MySQLConnWrapper(conn)

try:
    db = get_db()
    
    # Test execute and parameters
    db.execute('''
    CREATE TABLE IF NOT EXISTS test_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
    )''')
    
    db.execute('INSERT INTO test_table (name) VALUES (?)', ('Alice',))
    db.commit()
    
    # Test fetchone, tuple indexing, string indexing
    row = db.execute('SELECT * FROM test_table WHERE name = ?', ('Alice',)).fetchone()
    print("fetchone string indexing:", row['name'])
    print("fetchone tuple indexing:", row[1])
    
    # Test fetchall
    rows = db.execute('SELECT * FROM test_table').fetchall()
    print("fetchall length:", len(rows))
    print("fetchall iter:", list(rows[0]))
    
    # Test aggregate
    avg = db.execute('SELECT COUNT(*) FROM test_table').fetchone()[0]
    print("aggregate:", avg)
    
    db.close()
    print("[SUCCESS] Wrapper works perfectly!")
except Exception as e:
    print(f"[ERROR] {e}")
