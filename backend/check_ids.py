import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'firebase-sdk.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Check Faculty Document
fac_id_to_check = 'FACB6A500A1'
doc = db.collection('faculty').document(fac_id_to_check).get()
if doc.exists:
    d = doc.to_dict()
    fid = d.get('faculty_id')
    print(f"FACULTY DOC: ID='{doc.id}', field faculty_id='{repr(fid)}'")
else:
    print(f"FACULTY DOC {fac_id_to_check} NOT FOUND")

# Check Exams
exams = db.collection('exams').stream()
for e in exams:
    ed = e.to_dict()
    efid = ed.get('faculty_id')
    print(f"EXAM {e.id}: faculty_id field='{repr(efid)}'")
