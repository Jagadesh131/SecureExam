import os
import pytest
import sqlite3
import tempfile

# Force local SQLite mode for tests
os.environ['USE_OFFLINE_DB'] = '1'

from app import create_app
import database_local

@pytest.fixture(scope='session')
def app():
    """Create and configure a new app instance for each test session."""
    
    # Create a temporary file for the database
    db_fd, db_path = tempfile.mkstemp()
    
    # Monkey patch get_db to connect to this temp file
    def get_test_db():
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
        
    database_local.get_db = get_test_db
    
    # Initialize the tables in the temp db
    database_local.init_db()

    app = create_app()
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False
    })

    yield app
    
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture()
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(autouse=True)
def clean_db(app):
    """Clean the database before each test to prevent test pollution."""
    with app.app_context():
        import database_local
        conn = database_local.get_db()
        # Get all tables
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        for table in tables:
            # Don't delete from admin since it's seeded in init_db
            if table['name'] not in ('admin', 'sqlite_sequence'):
                conn.execute(f"DELETE FROM {table['name']}")
        conn.commit()
@pytest.fixture()
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()
