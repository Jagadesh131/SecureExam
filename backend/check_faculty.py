import sqlite3
import os
os.environ['USE_OFFLINE_DB']='0'
from database import get_db

fac_id = "FAC-WZLXRO"

print(f"Checking for {fac_id}...")

local = sqlite3.connect('mcq_exam.db')
local.row_factory = sqlite3.Row
l = local.execute("SELECT * FROM faculty WHERE faculty_id=?", (fac_id,)).fetchone()
print('Local SQLite:', dict(l) if l else 'Not Found')

cloud = get_db()
c = cloud.execute("SELECT * FROM faculty WHERE faculty_id=%s", (fac_id,)).fetchone()
if c:
    d = {}
    for k in c.keys():
        d[k] = c[k]
    print('Cloud TiDB:', d)
else:
    print('Cloud TiDB: Not Found')
