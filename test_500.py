import sys
sys.path.append('backend')
from app import create_app

app = create_app()
app.testing = True

with app.test_client() as client:
    print("Hitting /auth/login...")
    # Need to pass data to /auth/login, but wait, the database is in MySQL and the test client might not hit the real database if it's not configured right. But let's assume it is.
    response = client.post('/auth/login', data={'email': 'prof@example.com', 'password': 'password'}, follow_redirects=True)
    
    # Or just bypass faculty_required by setting session securely
    with client.session_transaction() as sess:
        sess['faculty_id'] = 1
        sess['faculty_name'] = 'Test Faculty'
        sess['faculty_email'] = 'test@example.com'
        sess['user_role'] = 'faculty'
        sess['faculty_logged_in'] = True
        
    print("Hitting /faculty/exams...")
    try:
        response = client.get('/faculty/exams')
        print("Status code:", response.status_code)
        if response.status_code == 500:
            print(response.text)
    except Exception as e:
        print("EXCEPTION RAISED:")
        import traceback
        traceback.print_exc()

    print("Hitting /faculty/dashboard...")
    try:
        response = client.get('/faculty/dashboard')
        print("Status code:", response.status_code)
        if response.status_code == 500:
            print(response.text)
    except Exception as e:
        print("EXCEPTION RAISED:")
        import traceback
        traceback.print_exc()
