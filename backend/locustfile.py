from locust import HttpUser, task, between

class StudentLoadTest(HttpUser):
    # This tells the robot to wait between 1 to 3 seconds before taking another action
    # exactly like a real human student thinking about a question.
    wait_time = between(1, 3)

    @task(3)
    def view_exam(self):
        # Simulates a student constantly checking or refreshing the exam page
        # Replace 'EXAM123' with an actual exam code from your database
        self.client.get("/api/exam/EXAM123")

    @task(1)
    def submit_exam(self):
        # Simulates a student submitting an exam
        payload = {
            "student_name": "LoadTest Student",
            "reg_number": "LOAD001",
            "exam_code": "EXAM123",
            "answers": {"1": "A", "2": "B"},
            "score": 2,
            "total_questions": 2,
            "percentage": 100.0,
            "time_taken": 120
        }
        self.client.post("/api/submit_exam", json=payload)
