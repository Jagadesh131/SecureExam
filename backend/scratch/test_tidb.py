import mysql.connector

try:
    conn = mysql.connector.connect(
        host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port=4000,
        user="EzPuqJTV9UFbBBF.root",
        password="v5Z6pNX8tcFdQJx3",
        database="test",
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    print("SUCCESS: Connected to TiDB!")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
