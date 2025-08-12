-- Create database
CREATE DATABASE IF NOT EXISTS university_attendance;
USE university_attendance;

-- Create instructors table
CREATE TABLE IF NOT EXISTS instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(10) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (course_id, student_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES instructors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (course_id, student_id, attendance_date)
);

-- Insert instructor (password is 'password123' hashed with bcrypt)
INSERT INTO instructors (email, password, name) VALUES 
('bobby@prof.edu', '$2b$10$8K1p/a0dKADy0BacZuXTAeBdkFjYdHqJFvQFj0wHJmvh3qA2F9Z8q', 'Professor Bobby Smith');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, instructor_id) VALUES 
('CS101', 'Introduction to Computer Science', 1),
('MATH201', 'Calculus II', 1),
('ENG150', 'English Composition', 1);

-- Insert sample students
INSERT INTO students (student_id, first_name, last_name, email) VALUES 
('STU001', 'Alice', 'Johnson', 'alice.johnson@student.edu'),
('STU002', 'Bob', 'Williams', 'bob.williams@student.edu'),
('STU003', 'Charlie', 'Brown', 'charlie.brown@student.edu'),
('STU004', 'Diana', 'Davis', 'diana.davis@student.edu'),
('STU005', 'Edward', 'Miller', 'edward.miller@student.edu'),
('STU006', 'Fiona', 'Wilson', 'fiona.wilson@student.edu'),
('STU007', 'George', 'Moore', 'george.moore@student.edu'),
('STU008', 'Hannah', 'Taylor', 'hannah.taylor@student.edu'),
('STU009', 'Ian', 'Anderson', 'ian.anderson@student.edu'),
('STU010', 'Julia', 'Thomas', 'julia.thomas@student.edu');

-- Enroll students in courses (10 students per course)
INSERT INTO course_enrollments (course_id, student_id) VALUES
-- CS101 enrollments
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- MATH201 enrollments
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
-- ENG150 enrollments
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10);
