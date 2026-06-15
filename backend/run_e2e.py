import subprocess
import sys
import os
import time

def run_e2e_tests():
    print("Starting Selenium End-to-End Testing Suite...")
    print("Spawning isolated test server with Offline SQLite Database...")
    
    # Start the Flask app with the local SQLite database
    env = os.environ.copy()
    env["USE_OFFLINE_DB"] = "1"
    
    # We use python app.py to start it
    server_process = subprocess.Popen(
        [sys.executable, "app.py"],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    # Wait a moment for the server to fully start
    time.sleep(3)
    
    print("Please wait. Simulating hundreds of browser interactions...")
    start_time = time.time()
    
    # Run pytest on the e2e directory
    try:
        subprocess.run(
            [sys.executable, "-m", "pytest", "tests/e2e/", "-v", "--disable-warnings"], 
            check=False
        )
    except Exception as e:
        print(f"Error running tests: {e}")
    finally:
        # Guarantee we kill the server after tests
        print("Shutting down test server...")
        server_process.terminate()
        server_process.wait()
        
    duration = time.time() - start_time
    
    print(f"\nE2E Testing Completed in {duration:.2f} seconds.")
    print("Check the 'E2E_Test_Report.xlsx' file for the detailed breakdown.")

if __name__ == "__main__":
    run_e2e_tests()
