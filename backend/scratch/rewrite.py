import os

with open('backend/database.py', 'r') as f:
    content = f.read()

new_content = "import os\n\nif os.environ.get('USE_OFFLINE_DB') == '1':\n    from database_local import *\nelse:\n"

for line in content.splitlines():
    if line:
        new_content += '    ' + line + '\n'
    else:
        new_content += '\n'

with open('backend/database.py', 'w') as f:
    f.write(new_content)
