import unittest
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

class SecureExamAppiumTests(unittest.TestCase):
    
    def setUp(self):
        """
        Setup Appium Desired Capabilities for the Android Emulator
        and launch the SecureExam.apk
        """
        print("Starting Appium Server connection...")
        
        # Define the exact location of the downloaded APK
        # Ensure the APK is downloaded and placed in the same directory as this script
        apk_path = os.path.join(os.getcwd(), 'SecureExam.apk')
        
        capabilities = {
            'platformName': 'Android',
            'automationName': 'UiAutomator2',
            'deviceName': 'Android Emulator', # Or the name of the physical device
            'app': apk_path,
            'appPackage': 'com.jagadeshsai.student_app',
            'appActivity': 'com.jagadeshsai.student_app.MainActivity',
            'autoGrantPermissions': True
        }
        
        # Connect to the local Appium server
        appium_server_url = 'http://localhost:4723'
        
        try:
            self.driver = webdriver.Remote(appium_server_url, capabilities)
            self.wait = WebDriverWait(self.driver, 10)
            print("Successfully launched SecureExam on the Android device!")
        except Exception as e:
            print(f"Failed to connect to Appium. Make sure the server is running on port 4723. Error: {e}")
            self.skipTest("Appium Server is not running.")

    def test_student_login_and_exam_flow(self):
        """
        End-to-End Test: Opens the app, inputs Student Name and Exam Code,
        and clicks the Start Exam button.
        """
        print("Test Step 1: Locating input fields...")
        
        try:
            # 1. Find the Student Name Input Field
            name_input = self.wait.until(EC.presence_of_element_located(
                (AppiumBy.XPATH, "//android.widget.EditText[@text='Enter your full name']")
            ))
            name_input.click()
            name_input.send_keys("Automated Test Student")
            print("✓ Entered Student Name")
            
            # 2. Find the Exam Code Input Field
            code_input = self.driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[@text='Enter Exam Code']")
            code_input.click()
            code_input.send_keys("CS101")
            print("✓ Entered Exam Code")
            
            # 3. Find and click the 'Start Exam' button
            start_button = self.driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='START EXAM']")
            start_button.click()
            print("✓ Clicked Start Exam button")
            
            # 4. Verify we reached the exam screen
            time.sleep(2)
            timer = self.wait.until(EC.presence_of_element_located(
                (AppiumBy.XPATH, "//*[contains(@text, 'Time Remaining')]")
            ))
            
            self.assertIsNotNone(timer)
            print("✓ Successfully transitioned to the Live Exam Screen!")
            
        except Exception as e:
            self.fail(f"Appium UI Test Failed: {e}")

    def tearDown(self):
        """
        Clean up after the test completes
        """
        if hasattr(self, 'driver') and self.driver:
            self.driver.quit()
            print("Closed Android application.")

if __name__ == '__main__':
    print("===================================================")
    print("   SECUREEXAM NATIVE ANDROID APPIUM TESTING SUITE  ")
    print("===================================================")
    unittest.main()
