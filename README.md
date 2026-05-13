# MCQ Examination System

A complete 3-tier web application for automated MCQ examinations in university settings.

## Features

- **Admin Panel**: Manage faculty, view statistics, reset passwords (hidden at `/admin`).
- **Faculty Portal**: Create exams, add questions, view student results, manage exam status.
- **Student Interface**: Take timed exams with anti-cheat measures (disables right-click, copy-paste, and common shortcuts).
- **Responsive Design**: Works on desktop and mobile (Android WebView wrapper supported).
- **Automatic Grading**: Students see results immediately after submission.

## Local Network Deployment

Since this app is designed for local university networks (no internet required):

1.  **Identify Server IP**: On the server machine, run `ipconfig`. Find the IPv4 address (e.g., `192.168.1.10`).
2.  **Firewall Setup**: Open Port 5000 on the server's firewall:
    - Go to **Windows Security** > **Firewall & network protection** > **Advanced settings**.
    - Create a new **Inbound Rule** for **Port 5000 (TCP)**.
3.  **Clients Access**: Students and Faculty can connect using the server's IP (e.g., `http://192.168.1.10:5000`).

### 🌐 Network Access for Students
To allow other computers on your network to access the exam:
1. **Firewall (Easy Way)**: 
   - Find the file `setup_network.bat` in this folder.
   - **Right-click** it and select **"Run as Administrator"**.
   - This will automatically open the port for you.
2. **Student Link**: 
   - The script will show you your IP (e.g., `http://172.23.29.67:5050/`).
   - Give this link to the students.
3. **Troubleshooting**: 
   - Ensure your network profile is set to **"Private"**.
   - Ensure you only have **one** instance of `python app.py` running.

## Portals & URLs
    - **Faculty Login**: `http://localhost:5050/` (Redirects to `/faculty`)
    - **Admin Panel**: `http://localhost:5050/admin` (Direct URL access only)
    - **Student Exam**: Access via the specific exam URL provided by faculty (e.g., `http://localhost:5000/exam/EXAM1234`).

## Default Credentials

- **Admin**: `admin` / `admin123`
- **Faculty**: Credentials created by Admin (Temporary Password: `Temp@123`).

## Mobile App

Refer to [android_webview_guide.md](android_webview_guide.md) for instructions on how to create the Android app wrapper.
