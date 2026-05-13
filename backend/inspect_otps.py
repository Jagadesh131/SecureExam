import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("Inspecting faculty_otps collection...")
docs = db.collection('faculty_otps').stream()
for doc in docs:
    print(f"ID: {doc.id} => {doc.to_dict()}")
