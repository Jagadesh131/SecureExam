import mysql.connector

try:
    conn = mysql.connector.connect(
        host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port=4000,
        user="EzPuqJTV9UFbBBF.root",
        password="v5Z6pNX8tcFdQJx3",
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )
    cursor = conn.cursor()
    
    # Disable foreign key checks for import
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
    
    with open('database_setup.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
        
    commands = sql_script.split(';')
    for cmd in commands:
        if cmd.strip():
            try:
                cursor.execute(cmd)
            except Exception as cmd_e:
                print(f"Failed to execute command: {cmd[:50]}... Error: {cmd_e}")
                
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
    conn.commit()
    print("SUCCESS: TiDB initialized with database_setup.sql data!")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
