-- SecureExam Database Setup
CREATE DATABASE IF NOT EXISTS secure_exam_db;
USE secure_exam_db;

-- Table structure for activity_logs
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_type` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `timestamp` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for admin
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for admin
INSERT IGNORE INTO admin (id, username, password) VALUES (1, 'admin', 'scrypt:32768:8:1$q0qQJJdP4xbvL7Ui$7a6d77ece187b0906cd12c5e386f1222c6fc7814b90b76e16131e598098ff87f704dbc7e1d1331ddc164057cbf509c435748647f78cfa7f07491354390213a12');

-- Table structure for backups
CREATE TABLE `backups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `created_date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for categories
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(20) DEFAULT '#3B82F6',
  PRIMARY KEY (`id`),
  KEY `exam_code` (`exam_code`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`exam_code`) REFERENCES `exams` (`exam_code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for exams
CREATE TABLE `exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(255) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `faculty_id` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT 0,
  `instructions` text DEFAULT NULL,
  `passing_percentage` int(11) DEFAULT 40,
  `created_date` varchar(255) DEFAULT NULL,
  `randomize_questions` tinyint(1) DEFAULT 0,
  `shuffle_options` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_code` (`exam_code`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for exams
INSERT IGNORE INTO exams (id, exam_code, exam_name, faculty_id, subject, duration, is_active, instructions, passing_percentage, created_date, randomize_questions, shuffle_options) VALUES (1, 'EXAM-HBXL', 'Data Structure', 'FAC001', 'DS', 20, 0, NULL, 40, NULL, 0, 0);

-- Table structure for faculty
CREATE TABLE `faculty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `birthday` varchar(255) DEFAULT NULL,
  `created_date` varchar(255) DEFAULT NULL,
  `temp_flag` int(11) DEFAULT 0,
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculty_id` (`faculty_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for faculty
INSERT IGNORE INTO faculty (id, faculty_id, name, email, password, department, phone, birthday, created_date, temp_flag, reset_token, token_expiry) VALUES (1, 'FAC001', 'Demo Faculty', 'demo@university.edu', 'scrypt:32768:8:1$gjnIryJ58h9gJHQ5$5e3c4b25c2a0ce4859ced173c92443f62bb4d33d0398b9da6447d1a3e43c83beed39b099173f821ba99664af999cea685da615d343d4e9eb5aca1a854ff69bc2', 'Computer Science', NULL, NULL, NULL, 0, NULL, NULL);

-- Table structure for questions
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(255) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_answer` text NOT NULL,
  `difficulty` varchar(255) DEFAULT 'Medium',
  `category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_code` (`exam_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_code`) REFERENCES `exams` (`exam_code`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_10` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_11` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_5` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_6` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_7` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_8` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `questions_ibfk_9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for student_attempts
CREATE TABLE `student_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_name` varchar(255) NOT NULL,
  `reg_number` varchar(255) NOT NULL,
  `exam_code` varchar(255) NOT NULL,
  `answers` text DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `total_questions` int(11) DEFAULT NULL,
  `percentage` double DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `attempt_date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_code` (`exam_code`),
  CONSTRAINT `student_attempts_ibfk_1` FOREIGN KEY (`exam_code`) REFERENCES `exams` (`exam_code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

