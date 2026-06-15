import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://127.0.0.1:5050"

# Generate 25+ test cases using parametrization
@pytest.mark.parametrize("username, password, expected_message, test_id", [
    ("", "", "required", "AUTH_001_Empty"),
    ("admin", "", "required", "AUTH_002_EmptyPass"),
    ("", "admin123", "required", "AUTH_003_EmptyUser"),
    ("wronguser", "wrongpass", "Invalid", "AUTH_004_WrongCreds"),
    ("admin", "wrongpass", "Invalid", "AUTH_005_WrongPass"),
    ("wronguser", "admin123", "Invalid", "AUTH_006_WrongUser"),
    ("' OR 1=1 --", "admin123", "Invalid", "AUTH_007_SQLi_1"),
    ("admin", "' OR 1=1 --", "Invalid", "AUTH_008_SQLi_2"),
    ("<script>alert(1)</script>", "pass", "Invalid", "AUTH_009_XSS_1"),
    ("admin", "<script>alert(1)</script>", "Invalid", "AUTH_010_XSS_2"),
    ("12345678901234567890", "pass", "Invalid", "AUTH_011_LongUser"),
    ("admin", "12345678901234567890", "Invalid", "AUTH_012_LongPass"),
    (" ", " ", "Invalid", "AUTH_013_SpaceSpace"),
    ("admin ", "admin123", "Dashboard", "AUTH_014_TrailingSpace"),
    (" admin", "admin123", "Dashboard", "AUTH_015_LeadingSpace"),
    ("!@#$%", "^&*(", "Invalid", "AUTH_016_SpecialChars"),
    ("FAC001", "wrong", "Invalid", "AUTH_017_FacWrong"),
    ("FAC002", "wrong", "Invalid", "AUTH_018_FacWrong2"),
    ("STU001", "wrong", "Invalid", "AUTH_019_StuWrong"),
    ("STU002", "wrong", "Invalid", "AUTH_020_StuWrong2"),
    ("admin", "ADMIN123", "Invalid", "AUTH_021_CaseSensitivePass"),
    ("ADMIN", "admin123", "Invalid", "AUTH_022_CaseSensitiveUser"),
    ("a", "b", "Invalid", "AUTH_023_ShortUser"),
    ("ab", "cd", "Invalid", "AUTH_024_ShortPass"),
    ("admin", "admin123", "Dashboard", "AUTH_025_ValidAdminLogin"), # Should succeed!
])
def test_admin_login_variations(browser, username, password, expected_message, test_id):
    """Test various login combinations and security constraints for Admin"""
    browser.delete_all_cookies()
    browser.get(f"{BASE_URL}/admin/")
    
    # Wait for fields to load
    wait = WebDriverWait(browser, 20)
    username_field = wait.until(EC.presence_of_element_located((By.NAME, "username")))
    password_field = browser.find_element(By.NAME, "password")
    submit_button = browser.find_element(By.CSS_SELECTOR, "button[type='submit']")
    
    # Enter credentials
    username_field.send_keys(username)
    password_field.send_keys(password)
    submit_button.click()
    
    # Assert expected behavior
    if "required" in expected_message:
        # HTML5 form validation prevents submission
        assert username_field.get_attribute("validationMessage") or password_field.get_attribute("validationMessage")
    else:
        # Check page source for expected message or successful redirect
        wait.until(lambda d: expected_message in d.page_source or "Dashboard" in d.page_source)
        assert expected_message in browser.page_source

def test_faculty_forgot_password_ui(browser):
    """Verify Forgot Password UI and local testing mode"""
    browser.get(f"{BASE_URL}/faculty/forgot-password")
    wait = WebDriverWait(browser, 20)
    
    fac_id_field = wait.until(EC.presence_of_element_located((By.NAME, "faculty_id")))
    fac_id_field.send_keys("UNKNOWN999")
    browser.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    
    # In a real app we'd mock the DB, but here we just check if it handles unknown ID gracefully
    # If the faculty is not found, the code currently redirects back with no message or an error.
    assert "Login" in browser.page_source or "password" in browser.page_source
