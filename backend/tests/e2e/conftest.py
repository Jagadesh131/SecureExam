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
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--window-size=1920,1080")
    return chrome_options

@pytest.fixture()
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

        # Determine Test Category
        test_id_upper = test_id.upper()
        if "UNIT_" in test_id_upper or "TEST_UNIT" in item.location[0].upper():
            category = "Unit Testing"
        elif "AUTH_" in test_id_upper or "SQLI" in test_id_upper or "XSS" in test_id_upper:
            category = "Validation Test"
        elif "UI" in test_id_upper or "DASHBOARD" in test_id_upper or "RENDER" in test_id_upper:
            category = "UI/UX Test"
        else:
            category = "Functional Testing"

        test_results.append({
            "Test ID": test_id,
            "Module": module_name,
            "Test Category": category,
            "Test Case Description": description.strip(),
            "Status": status,
            "Execution Time (s)": round(report.duration, 2),
            "Error Message": error_msg
        })

def pytest_sessionfinish(session, exitstatus):
    """Export results to Excel at the end of the test session"""
    if test_results:
        df = pd.DataFrame(test_results)
        
        # Calculate Summary Metrics
        total_tests = len(df)
        passed_tests = len(df[df['Status'] == 'Pass'])
        failed_tests = total_tests - passed_tests
        pass_rate = f"{(passed_tests / total_tests) * 100:.1f}%" if total_tests > 0 else "0%"
        
        deployable_status = "READY FOR DEPLOYMENT ✅" if failed_tests == 0 and total_tests > 0 else "FAILED / DO NOT DEPLOY ❌"
        
        # Category metrics
        def get_cat_metrics(cat):
            cat_df = df[df['Test Category'] == cat]
            t = len(cat_df)
            p = len(cat_df[cat_df['Status'] == 'Pass'])
            return f"{p}/{t} Passed"

        summary_data = {
            "Metric": [
                "Project Title", 
                "Execution Date", 
                "Deployable Status",
                "Total Test Cases", 
                "Passed Test Cases", 
                "Failed Test Cases", 
                "Pass Rate",
                "-- BREAKDOWN BY CATEGORY --",
                "Unit Testing",
                "UI/UX Test",
                "Functional Testing",
                "Validation Test"
            ],
            "Value": [
                "SecureExam - Automated E2E Testing Report",
                time.strftime("%Y-%m-%d %H:%M:%S"),
                deployable_status,
                total_tests,
                passed_tests,
                failed_tests,
                pass_rate,
                "",
                get_cat_metrics("Unit Testing"),
                get_cat_metrics("UI/UX Test"),
                get_cat_metrics("Functional Testing"),
                get_cat_metrics("Validation Test")
            ]
        }
        summary_df = pd.DataFrame(summary_data)
        
        # Save to the root of the backend directory
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'E2E_Test_Report.xlsx'))
        
        try:
            # We use openpyxl engine automatically with pandas for .xlsx
            with pd.ExcelWriter(report_path, engine='openpyxl') as writer:
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                df.to_excel(writer, sheet_name='Detailed Results', index=False)
                
                # Optional formatting for Summary sheet
                worksheet = writer.sheets['Summary']
                worksheet.column_dimensions['A'].width = 25
                worksheet.column_dimensions['B'].width = 50
                
                # Format Detailed Results sheet
                detailed_ws = writer.sheets['Detailed Results']
                detailed_ws.column_dimensions['A'].width = 30
                detailed_ws.column_dimensions['B'].width = 30
                detailed_ws.column_dimensions['C'].width = 20
                detailed_ws.column_dimensions['D'].width = 50
                detailed_ws.column_dimensions['E'].width = 15
                detailed_ws.column_dimensions['F'].width = 15
                detailed_ws.column_dimensions['G'].width = 80
                
            print(f"\nSuccessfully generated E2E Test Report at: {report_path}")
        except Exception as e:
            print(f"\nFailed to generate E2E Excel Report: {e}")
