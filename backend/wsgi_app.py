import sys
import os

# Add the project directory to the sys.path
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

# Import the 'create_app' function from your app.py
from app import create_app

# Create the application instance that PythonAnywhere will use
application = create_app()
