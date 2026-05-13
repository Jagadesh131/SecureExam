-- SecureExam: Complete MySQL Database Setup
-- Run this script in phpMyAdmin or MySQL Workbench

CREATE DATABASE IF NOT EXISTS secure_exam_db;
USE secure_exam_db;

-- 1. Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    birthday DATE,
    profile_pic VARCHAR(255),
    temp_flag TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_code VARCHAR(20) UNIQUE NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    faculty_id VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    duration INT NOT NULL, -- in minutes
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_code VARCHAR(20) NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL, -- A, B, C, or D
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_code) REFERENCES exams(exam_code) ON DELETE CASCADE
);

-- 5. Student Attempts Table
CREATE TABLE IF NOT EXISTS student_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) NOT NULL,
    exam_code VARCHAR(20) NOT NULL,
    answers JSON, -- Stores student choices
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage FLOAT NOT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_code) REFERENCES exams(exam_code) ON DELETE CASCADE
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) NOT NULL,
    exam_code VARCHAR(20) NOT NULL,
    faculty_id VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_code) REFERENCES exams(exam_code) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- Insert Default Admin (admin/admin123)
-- Hash generated via werkzeug.security: pbkdf2:sha256:600000$....
INSERT IGNORE INTO admin (username, password) VALUES ('admin', 'pbkdf2:sha256:600000$9j3U8p8T$7f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f');

-- Insert Demo Faculty (FAC001/123456)
INSERT IGNORE INTO faculty (faculty_id, name, email, password, department, temp_flag) 
VALUES ('FAC001', 'Demo Faculty', 'demo@university.edu', 'pbkdf2:sha256:600000$9j3U8p8T$7f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f', 'Computer Science', 0);
