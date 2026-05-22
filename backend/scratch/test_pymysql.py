import pymysql
import ssl

try:
    ssl_context = ssl.create_default_context()
    conn = pymysql.connect(
        host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port=4000,
        user="EzPuqJTV9UFbBBF.root",
        password="v5Z6pNX8tcFdQJx3",
        database="test",
        ssl=ssl_context,
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("SUCCESS: Connected to TiDB with PyMySQL!")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
