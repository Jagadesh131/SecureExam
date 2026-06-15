import pytest
import sys
import os

# Ensure backend path is included
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database import hash_password, check_password, generate_id

def test_UNIT_001_generate_id_format():
    """Test if generate_id produces correct length and prefix"""
    new_id = generate_id("TEST", length=8)
    assert new_id.startswith("TEST-")
    # 'TEST-' is 5 chars, plus 8 random chars = 13
    assert len(new_id) == 13

def test_UNIT_002_generate_id_uniqueness():
    """Test if multiple generated IDs are unique"""
    id1 = generate_id("USR")
    id2 = generate_id("USR")
    assert id1 != id2

def test_UNIT_003_password_hashing():
    """Test password hashing logic and format"""
    pw = "secretPassword123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert hashed.startswith("pbkdf2:sha256") or hashed.startswith("scrypt:")

def test_UNIT_004_password_verification():
    """Test that check_password validates the correct password"""
    pw = "secure_exam_2026"
    hashed = hash_password(pw)
    assert check_password(hashed, pw) == True
    assert check_password(hashed, "wrong_password") == False


