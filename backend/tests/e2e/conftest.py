import pytest
import time
import os
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Global list to store test results
test_results = []

@pytest.fixture(scope="session")
def browser_config():
    """Setup Chrome Options once per session"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    return chrome_options

@pytest.fixture(scope="session")
def browser(browser_config):
    """Provide a fresh WebDriver instance per test"""
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=browser_config)
    driver.implicitly_wait(5)
    
    yield driver
    
    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Intercept test results to build the Excel report"""
    outcome = yield
    report = outcome.get_result()
    
    # We only care about the actual test execution phase (not setup/teardown)
    # or setup failures.
    if report.when == "call" or (report.when == "setup" and report.failed):
        # Determine Module from filename
        module_name = os.path.basename(item.location[0])
        
        # Determine Test ID and Description
        test_id = item.name
        description = item.function.__doc__ if item.function.__doc__ else item.name
        
        status = "Pass" if report.passed else "Fail"
        
        # Format the error message if failed
        error_msg = ""
        if report.failed:
            error_msg = str(report.longreprtext)
            # Truncate very long errors for Excel readability
            if len(error_msg) > 500:
                error_msg = error_msg[:500] + "... [truncated]"

        test_results.append({
            "Test ID": test_id,
            "Module": module_name,
            "Test Case Description": description.strip(),
            "Status": status,
            "Execution Time (s)": round(report.duration, 2),
            "Error Message": error_msg
        })

def pytest_sessionfinish(session, exitstatus):
    """Export results to Excel at the end of the test session"""
    if test_results:
        df = pd.DataFrame(test_results)
        
        # Save to the root of the backend directory
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'E2E_Test_Report.xlsx'))
        
        try:
            # We use openpyxl engine automatically with pandas for .xlsx
            df.to_excel(report_path, index=False, engine='openpyxl')
            print(f"\nSuccessfully generated E2E Test Report at: {report_path}")
        except Exception as e:
            print(f"\nFailed to generate E2E Excel Report: {e}")
