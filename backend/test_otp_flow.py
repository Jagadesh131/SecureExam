import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Test insert
data = {'faculty_id': 'TEST', 'otp': '123456', 'expires_at': '2026-03-20 14:00:00'}
db.collection('faculty_otps').add(data)

# Test fetch
docs = db.collection('faculty_otps').where('faculty_id', '==', 'TEST').stream()
for doc in docs:
    d = doc.to_dict()
    print(f"Fetched: {d}")
    print(f"expires_at type: {type(d.get('expires_at'))}")
