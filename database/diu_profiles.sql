-- =====================================================================
-- DIU CSE Student Profiles — Alternative Scenarios
-- Run AFTER student_portal.sql AND schema_update.sql
--
-- Creates 4 realistic student profiles:
--   A) Anika Tabassum  — Newly Admitted (Batch 2026, zero history)
--   B) Sakib Al Hasan  — 1st Semester   (Batch 2026, active enrollments)
--   C) Maryam Khatun   — 6th Semester   (Batch 2024, CGPA 3.42)
--   D) Tanvir Ahmed    — Final Year     (Batch 2022, CGPA 3.64)
--
-- Grade scale: Unchanged — already matches DIU/UGC Bangladesh standard
--   A+ 4.00 (80-100), A 3.75 (75-79), A- 3.50 (70-74),
--   B+ 3.25 (65-69), B 3.00 (60-64), B- 2.75 (55-59),
--   C+ 2.50 (50-54), C 2.25 (45-49), D 2.00 (40-44), F 0.00 (0-39)
--
-- Courses: DIU CSE curriculum for all 12 trimesters
-- =====================================================================

USE student_portal;

-- =====================================================================
-- 1. ADD MISSING SEMESTERS (fill 2023-2025 gap)
-- DIU follows Trimester system: Spring / Summer / Fall
-- Current max semester_id = 7 (Spring 2026)
-- =====================================================================
INSERT INTO semesters (name, start_date, end_date, status) VALUES
('Spring 2023', '2023-01-15', '2023-05-15', 'completed'),   -- 8
('Summer 2023', '2023-05-20', '2023-09-20', 'completed'),   -- 9
('Fall 2023',   '2023-09-25', '2024-01-25', 'completed'),   -- 10
('Spring 2024', '2024-01-30', '2024-05-30', 'completed'),   -- 11
('Summer 2024', '2024-06-01', '2024-10-01', 'completed'),   -- 12
('Fall 2024',   '2024-10-05', '2025-02-05', 'completed'),   -- 13
('Spring 2025', '2025-02-10', '2025-06-10', 'completed'),   -- 14
('Summer 2025', '2025-06-15', '2025-10-15', 'completed'),   -- 15
('Fall 2025',   '2025-10-20', '2026-01-20', 'completed'),   -- 16
('Summer 2026', '2026-05-20', '2026-09-20', 'upcoming');     -- 17

-- =====================================================================
-- 2. ADD DIU CSE COURSES FOR SEMESTERS 5-12
-- Existing: Sem 1 (CSE101-ENG101), Sem 2 (CSE201-ENG201),
--           Sem 3 (CSE301-MAT301), Sem 4 (CSE401-CSE405),
--           Sem 7 (CSE701-MGT701)
-- Current max course_id = 31
-- =====================================================================
INSERT INTO courses (dept_id, course_code, title, credit, category) VALUES
-- Semester 5: 3rd Year Trimester 2
(1, 'CSE501', 'Computer Graphics',               3.0, 'Major'),     -- 32
(1, 'CSE502', 'Compiler Design',                  3.0, 'Major'),     -- 33
(1, 'CSE503', 'Microprocessors & Interfacing',    3.0, 'Major'),     -- 34
(1, 'CSE504', 'Digital Signal Processing',         3.0, 'Elective'),  -- 35
(1, 'CSE505', 'Software Project Management',       3.0, 'Major'),     -- 36
-- Semester 6: 3rd Year Trimester 3
(1, 'CSE601', 'Machine Learning',                  3.0, 'Major'),     -- 37
(1, 'CSE602', 'Information & Network Security',    3.0, 'Major'),     -- 38
(1, 'CSE603', 'Distributed Systems',               3.0, 'Major'),     -- 39
(1, 'CSE604', 'Embedded Systems Design',           3.0, 'Elective'),  -- 40
(1, 'CSE605', 'Technical Writing & Presentation',  3.0, 'Minor'),     -- 41
-- Semester 8: 4th Year Trimester 2
(1, 'CSE801', 'Cloud Computing',                   3.0, 'Major'),     -- 42
(1, 'CSE802', 'Natural Language Processing',       3.0, 'Elective'),  -- 43
(1, 'CSE803', 'Data Science & Analytics',          3.0, 'Major'),     -- 44
(1, 'CSE804', 'Thesis/Project I',                  6.0, 'Major'),     -- 45
-- Semester 9: 4th Year Trimester 3
(1, 'CSE901', 'Deep Learning',                     3.0, 'Elective'),  -- 46
(1, 'CSE902', 'Cyber Forensics',                   3.0, 'Elective'),  -- 47
(1, 'CSE903', 'Digital Image Processing',          3.0, 'Elective'),  -- 48
(1, 'CSE904', 'Thesis/Project II',                 6.0, 'Major'),     -- 49
-- Semester 10-12: Final stretch
(1, 'CSE1001', 'Human Computer Interaction',       3.0, 'Elective'),  -- 50
(1, 'CSE1002', 'Advanced Database Systems',        3.0, 'Major'),     -- 51
(1, 'CSE1003', 'Industrial Attachment',            3.0, 'Major'),     -- 52
(1, 'CSE1004', 'Capstone Project',                 6.0, 'Major'),     -- 53
(1, 'CSE1005', 'Professional Ethics in Computing', 3.0, 'Minor'),     -- 54
(1, 'CSE1006', 'Seminar & Viva Voce',             1.0, 'Major');      -- 55

-- =====================================================================
-- 3. CREATE USER ACCOUNTS (IDs 27-30)
-- =====================================================================
INSERT INTO users (email, password_hash, full_name, phone, status) VALUES
('anika.tabassum@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu',
  'Anika Tabassum', '+8801612345001', 'active'),       -- 27
('sakib.hasan@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu',
  'Sakib Al Hasan', '+8801612345002', 'active'),        -- 28
('maryam.khatun@diu.edu.bd',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu',
  'Maryam Khatun', '+8801612345003', 'active'),         -- 29
('tanvir.ahmed@diu.edu.bd',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu',
  'Tanvir Ahmed', '+8801612345004', 'active');           -- 30

-- Assign student role (role_id = 2)
INSERT INTO user_roles (user_id, role_id) VALUES
(27, 2), (28, 2), (29, 2), (30, 2);

-- =====================================================================
-- 4. CREATE STUDENT RECORDS (IDs 17-20)
-- =====================================================================
INSERT INTO students (user_id, student_code, program_id, batch_year, section, enrollment_date, advisor_id) VALUES
-- A) Anika: Newly admitted for Summer 2026. No advisor yet.
(27, 'CSE2026001', 1, 2026, 'A', '2026-05-20', NULL),    -- student 17
-- B) Sakib: 1st semester in Spring 2026.
(28, 'CSE2026002', 1, 2026, 'A', '2026-01-15', 3),       -- student 18
-- C) Maryam: 6th semester. Started Spring 2024.
(29, 'CSE2024001', 1, 2024, 'A', '2024-01-30', 4),       -- student 19
-- D) Tanvir: Final year (12th trimester). Started Spring 2022.
(30, 'CSE2022004', 1, 2022, 'A', '2022-01-30', 2);       -- student 20

-- =====================================================================
-- 5. COURSE OFFERINGS (IDs 17-75)
-- Need offerings in past semesters for Maryam & Tanvir's history
-- =====================================================================
INSERT INTO course_offerings (course_id, semester_id, teacher_id, section) VALUES

-- ── Sakib: 1st-year courses offered in Spring 2026, section C ──
(1,  7,  3, 'C'),   -- 17: CSE101 Intro to CS
(2,  7,  4, 'C'),   -- 18: CSE102 Structured Programming
(3,  7,  5, 'C'),   -- 19: MAT101 Differential Calculus
(4,  7,  6, 'C'),   -- 20: PHY101 Physics I
(6,  7,  9, 'C'),   -- 21: ENG101 English I

-- ── Maryam: 1st semester — Spring 2024 (sem 11) ──
(1,  11, 2, 'A'),   -- 22: CSE101
(2,  11, 3, 'A'),   -- 23: CSE102
(3,  11, 4, 'A'),   -- 24: MAT101
(6,  11, 5, 'A'),   -- 25: ENG101

-- ── Maryam: 2nd semester — Summer 2024 (sem 12) ──
(9,  12, 3, 'A'),   -- 26: CSE201 Data Structures
(10, 12, 4, 'A'),   -- 27: CSE202 OOP
(11, 12, 5, 'A'),   -- 28: MAT201 Integral Calculus

-- ── Maryam: 3rd semester — Fall 2024 (sem 13) ──
(15, 13, 2, 'A'),   -- 29: CSE301 DBMS
(16, 13, 3, 'A'),   -- 30: CSE302 Algorithms
(18, 13, 6, 'A'),   -- 31: CSE304 Discrete Mathematics

-- ── Maryam: 4th semester — Spring 2025 (sem 14) ──
(21, 14, 3, 'A'),   -- 32: CSE401 Operating Systems
(22, 14, 5, 'A'),   -- 33: CSE402 Computer Networks
(23, 14, 4, 'A'),   -- 34: CSE403 Theory of Computation

-- ── Maryam: 5th semester — Summer 2025 (sem 15) ──
(32, 15, 4, 'A'),   -- 35: CSE501 Computer Graphics
(33, 15, 3, 'A'),   -- 36: CSE502 Compiler Design
(34, 15, 9, 'A'),   -- 37: CSE503 Microprocessors

-- ── Maryam: 6th semester (current) — Spring 2026 (sem 7) ──
(37, 7, 10, 'A'),   -- 38: CSE601 Machine Learning
(38, 7,  9, 'A'),   -- 39: CSE602 Info Security
(39, 7, 11, 'A'),   -- 40: CSE603 Distributed Systems

-- ── Tanvir: 1st semester — Spring 2022 (sem 4) ──
(1,  4,  2, 'A'),   -- 41: CSE101
(2,  4,  3, 'A'),   -- 42: CSE102
(3,  4,  5, 'A'),   -- 43: MAT101

-- ── Tanvir: 2nd semester — Summer 2022 (sem 5) ──
(9,  5,  3, 'A'),   -- 44: CSE201
(10, 5,  4, 'A'),   -- 45: CSE202
(11, 5,  6, 'A'),   -- 46: MAT201

-- ── Tanvir: 3rd semester — Fall 2022 (sem 6) ──
(15, 6,  2, 'B'),   -- 47: CSE301 (sec B to avoid conflict with existing)
(16, 6,  3, 'B'),   -- 48: CSE302
(17, 6,  4, 'B'),   -- 49: CSE303 Computer Architecture

-- ── Tanvir: 4th semester — Spring 2023 (sem 8) ──
(21, 8,  3, 'A'),   -- 50: CSE401
(22, 8,  5, 'A'),   -- 51: CSE402
(23, 8,  4, 'A'),   -- 52: CSE403

-- ── Tanvir: 5th semester — Summer 2023 (sem 9) ──
(32, 9,  4, 'A'),   -- 53: CSE501
(33, 9,  3, 'A'),   -- 54: CSE502
(34, 9,  9, 'A'),   -- 55: CSE503

-- ── Tanvir: 6th semester — Fall 2023 (sem 10) ──
(37, 10, 10, 'A'),  -- 56: CSE601
(38, 10,  9, 'A'),  -- 57: CSE602
(39, 10, 11, 'A'),  -- 58: CSE603

-- ── Tanvir: 7th semester — Spring 2024 (sem 11) ──
(26, 11, 3, 'B'),   -- 59: CSE701 AI (sec B, A taken by Maryam's batch)
(27, 11, 4, 'B'),   -- 60: CSE702 Software Architecture
(28, 11, 5, 'B'),   -- 61: CSE703 IoT

-- ── Tanvir: 8th semester — Summer 2024 (sem 12) ──
(42, 12, 3, 'A'),   -- 62: CSE801 Cloud Computing
(43, 12, 5, 'A'),   -- 63: CSE802 NLP
(44, 12, 4, 'A'),   -- 64: CSE803 Data Science

-- ── Tanvir: 9th semester — Fall 2024 (sem 13) ──
(46, 13, 10, 'A'),  -- 65: CSE901 Deep Learning
(47, 13,  9, 'A'),  -- 66: CSE902 Cyber Forensics
(48, 13,  3, 'A'),  -- 67: CSE903 Digital Image Processing

-- ── Tanvir: 10th semester — Spring 2025 (sem 14) ──
(50, 14, 4, 'A'),   -- 68: CSE1001 HCI
(51, 14, 3, 'A'),   -- 69: CSE1002 Advanced DBMS
(52, 14, 9, 'A'),   -- 70: CSE1003 Industrial Attachment

-- ── Tanvir: 11th semester — Summer 2025 (sem 15) ──
(54, 15, 11, 'A'),  -- 71: CSE1005 Ethics
(55, 15,  2, 'A'),  -- 72: CSE1006 Seminar

-- ── Tanvir: 12th semester (current) — Spring 2026 (sem 7) ──
(53, 7,  2, 'A'),   -- 73: CSE1004 Capstone Project
(41, 7, 11, 'A');   -- 74: CSE605 Technical Writing (final requirement)

-- =====================================================================
-- 6. ENROLLMENTS
-- Current max enrollment_id ≈ 32 → new IDs start at 33
-- =====================================================================
INSERT INTO enrollments (student_id, offering_id, status) VALUES

-- ── B) Sakib: 1st semester — all active, no results yet ──
(18, 17, 'active'),  -- 33: CSE101
(18, 18, 'active'),  -- 34: CSE102
(18, 19, 'active'),  -- 35: MAT101
(18, 20, 'active'),  -- 36: PHY101
(18, 21, 'active'),  -- 37: ENG101

-- ── C) Maryam: 5 completed semesters + current active ──
-- Semester 1 (Spring 2024)
(19, 22, 'completed'),  -- 38: CSE101
(19, 23, 'completed'),  -- 39: CSE102
(19, 24, 'completed'),  -- 40: MAT101
(19, 25, 'completed'),  -- 41: ENG101
-- Semester 2 (Summer 2024)
(19, 26, 'completed'),  -- 42: CSE201
(19, 27, 'completed'),  -- 43: CSE202
(19, 28, 'completed'),  -- 44: MAT201
-- Semester 3 (Fall 2024)
(19, 29, 'completed'),  -- 45: CSE301
(19, 30, 'completed'),  -- 46: CSE302
(19, 31, 'completed'),  -- 47: CSE304
-- Semester 4 (Spring 2025)
(19, 32, 'completed'),  -- 48: CSE401
(19, 33, 'completed'),  -- 49: CSE402
(19, 34, 'completed'),  -- 50: CSE403
-- Semester 5 (Summer 2025)
(19, 35, 'completed'),  -- 51: CSE501
(19, 36, 'completed'),  -- 52: CSE502
(19, 37, 'completed'),  -- 53: CSE503
-- Semester 6 — current (Spring 2026)
(19, 38, 'active'),     -- 54: CSE601 Machine Learning
(19, 39, 'active'),     -- 55: CSE602 Info Security
(19, 40, 'active'),     -- 56: CSE603 Distributed Systems

-- ── D) Tanvir: 11 completed semesters + current active ──
-- Semester 1 (Spring 2022)
(20, 41, 'completed'),  -- 57: CSE101
(20, 42, 'completed'),  -- 58: CSE102
(20, 43, 'completed'),  -- 59: MAT101
-- Semester 2 (Summer 2022)
(20, 44, 'completed'),  -- 60: CSE201
(20, 45, 'completed'),  -- 61: CSE202
(20, 46, 'completed'),  -- 62: MAT201
-- Semester 3 (Fall 2022)
(20, 47, 'completed'),  -- 63: CSE301
(20, 48, 'completed'),  -- 64: CSE302
(20, 49, 'completed'),  -- 65: CSE303
-- Semester 4 (Spring 2023)
(20, 50, 'completed'),  -- 66: CSE401
(20, 51, 'completed'),  -- 67: CSE402
(20, 52, 'completed'),  -- 68: CSE403
-- Semester 5 (Summer 2023)
(20, 53, 'completed'),  -- 69: CSE501
(20, 54, 'completed'),  -- 70: CSE502
(20, 55, 'completed'),  -- 71: CSE503
-- Semester 6 (Fall 2023)
(20, 56, 'completed'),  -- 72: CSE601
(20, 57, 'completed'),  -- 73: CSE602
(20, 58, 'completed'),  -- 74: CSE603
-- Semester 7 (Spring 2024)
(20, 59, 'completed'),  -- 75: CSE701
(20, 60, 'completed'),  -- 76: CSE702
(20, 61, 'completed'),  -- 77: CSE703
-- Semester 8 (Summer 2024)
(20, 62, 'completed'),  -- 78: CSE801
(20, 63, 'completed'),  -- 79: CSE802
(20, 64, 'completed'),  -- 80: CSE803
-- Semester 9 (Fall 2024)
(20, 65, 'completed'),  -- 81: CSE901
(20, 66, 'completed'),  -- 82: CSE902
(20, 67, 'completed'),  -- 83: CSE903
-- Semester 10 (Spring 2025)
(20, 68, 'completed'),  -- 84: CSE1001
(20, 69, 'completed'),  -- 85: CSE1002
(20, 70, 'completed'),  -- 86: CSE1003
-- Semester 11 (Summer 2025)
(20, 71, 'completed'),  -- 87: CSE1005
(20, 72, 'completed'),  -- 88: CSE1006
-- Semester 12 — current (Spring 2026)
(20, 73, 'active'),     -- 89: CSE1004 Capstone
(20, 74, 'active');      -- 90: CSE605 Technical Writing

-- =====================================================================
-- 7. RESULTS — Past completed semesters
-- Current max result_id = 8 → new IDs start at 9
--
-- Maryam (CGPA ≈ 3.42): Solid mid-range student
-- Tanvir (CGPA ≈ 3.64): Strong senior student
-- =====================================================================
INSERT INTO results (enrollment_id, grade_code, total_mark, published_at, locked) VALUES

-- ── Maryam's Results (enrollment 38-53, 16 courses × 3 credits) ──
-- Sem 1 — Adjusting to university
(38, 'A-', 72, '2024-05-10 10:00:00', TRUE),  -- CSE101
(39, 'B+', 68, '2024-05-10 10:00:00', TRUE),  -- CSE102
(40, 'A',  77, '2024-05-10 10:00:00', TRUE),  -- MAT101
(41, 'A-', 71, '2024-05-10 10:00:00', TRUE),  -- ENG101
-- Sem 2 — Improving
(42, 'B+', 66, '2024-09-15 10:00:00', TRUE),  -- CSE201
(43, 'A',  75, '2024-09-15 10:00:00', TRUE),  -- CSE202
(44, 'B',  62, '2024-09-15 10:00:00', TRUE),  -- MAT201
-- Sem 3 — Core CS, some challenge
(45, 'A-', 73, '2025-01-20 10:00:00', TRUE),  -- CSE301 DBMS
(46, 'B',  60, '2025-01-20 10:00:00', TRUE),  -- CSE302 Algorithms
(47, 'B+', 67, '2025-01-20 10:00:00', TRUE),  -- CSE304 Discrete Math
-- Sem 4 — Steady
(48, 'B+', 65, '2025-05-25 10:00:00', TRUE),  -- CSE401 OS
(49, 'A-', 70, '2025-05-25 10:00:00', TRUE),  -- CSE402 Networks
(50, 'A',  76, '2025-05-25 10:00:00', TRUE),  -- CSE403 Theory of Comp.
-- Sem 5 — Strongest semester
(51, 'A',  78, '2025-10-01 10:00:00', TRUE),  -- CSE501 Graphics
(52, 'B+', 68, '2025-10-01 10:00:00', TRUE),  -- CSE502 Compiler Design
(53, 'A-', 74, '2025-10-01 10:00:00', TRUE),  -- CSE503 Microprocessors

-- ── Tanvir's Results (enrollment 57-88, 21+ courses) ──
-- Sem 1 — Strong start
(57, 'A+', 82, '2022-05-10 10:00:00', TRUE),  -- CSE101
(58, 'A',  78, '2022-05-10 10:00:00', TRUE),  -- CSE102
(59, 'A-', 72, '2022-05-10 10:00:00', TRUE),  -- MAT101
-- Sem 2 — Excellent
(60, 'A',  76, '2022-09-15 10:00:00', TRUE),  -- CSE201
(61, 'A+', 80, '2022-09-15 10:00:00', TRUE),  -- CSE202
(62, 'B+', 68, '2022-09-15 10:00:00', TRUE),  -- MAT201
-- Sem 3 — Core CS
(63, 'A-', 74, '2023-01-20 10:00:00', TRUE),  -- CSE301 DBMS
(64, 'A-', 70, '2023-01-20 10:00:00', TRUE),  -- CSE302 Algorithms
(65, 'B+', 66, '2023-01-20 10:00:00', TRUE),  -- CSE303 Architecture
-- Sem 4 — Consistent
(66, 'A+', 80, '2023-05-10 10:00:00', TRUE),  -- CSE401 OS
(67, 'A-', 72, '2023-05-10 10:00:00', TRUE),  -- CSE402 Networks
(68, 'B+', 67, '2023-05-10 10:00:00', TRUE),  -- CSE403 ToC
-- Sem 5
(69, 'A',  75, '2023-09-15 10:00:00', TRUE),  -- CSE501 Graphics
(70, 'A',  78, '2023-09-15 10:00:00', TRUE),  -- CSE502 Compiler
(71, 'B+', 65, '2023-09-15 10:00:00', TRUE),  -- CSE503 Micro
-- Sem 6
(72, 'A+', 82, '2024-01-20 10:00:00', TRUE),  -- CSE601 ML
(73, 'A',  77, '2024-01-20 10:00:00', TRUE),  -- CSE602 Security
(74, 'A-', 70, '2024-01-20 10:00:00', TRUE),  -- CSE603 Distributed
-- Sem 7
(75, 'A+', 85, '2024-05-25 10:00:00', TRUE),  -- CSE701 AI
(76, 'A',  76, '2024-05-25 10:00:00', TRUE),  -- CSE702 Software Arch.
(77, 'A-', 73, '2024-05-25 10:00:00', TRUE),  -- CSE703 IoT
-- Sem 8
(78, 'A',  79, '2024-09-25 10:00:00', TRUE),  -- CSE801 Cloud
(79, 'A-', 74, '2024-09-25 10:00:00', TRUE),  -- CSE802 NLP
(80, 'A+', 81, '2024-09-25 10:00:00', TRUE),  -- CSE803 Data Science
-- Sem 9
(81, 'A+', 83, '2025-01-30 10:00:00', TRUE),  -- CSE901 Deep Learning
(82, 'A',  77, '2025-01-30 10:00:00', TRUE),  -- CSE902 Cyber Forensics
(83, 'A-', 71, '2025-01-30 10:00:00', TRUE),  -- CSE903 Image Processing
-- Sem 10
(84, 'A',  75, '2025-06-01 10:00:00', TRUE),  -- CSE1001 HCI
(85, 'A+', 84, '2025-06-01 10:00:00', TRUE),  -- CSE1002 Adv. DBMS
(86, 'A',  78, '2025-06-01 10:00:00', TRUE),  -- CSE1003 Internship
-- Sem 11
(87, 'A',  76, '2025-10-10 10:00:00', TRUE),  -- CSE1005 Ethics
(88, 'A+', 80, '2025-10-10 10:00:00', TRUE);  -- CSE1006 Seminar

-- =====================================================================
-- 8. INVOICES — Current semester for all 4 students
-- =====================================================================
INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status) VALUES
-- A) Anika: Newly admitted, Summer 2026 — unpaid
(17, 17, 'INV202605200017', '2026-05-20', '2026-06-20', 'pending'),
-- B) Sakib: 1st semester Spring 2026 — paid
(18,  7, 'INV202601150018', '2026-01-15', '2026-02-15', 'paid'),
-- C) Maryam: 6th semester Spring 2026 — partial
(19,  7, 'INV202601150019', '2026-01-15', '2026-02-15', 'partial'),
-- D) Tanvir: Final year Spring 2026 — paid
(20,  7, 'INV202601150020', '2026-01-15', '2026-02-15', 'paid');

-- Invoice items (standard DIU CSE fee structure)
-- Get the invoice IDs by order: Anika, Sakib, Maryam, Tanvir
SET @inv_anika  = (SELECT invoice_id FROM student_invoices WHERE invoice_no = 'INV202605200017');
SET @inv_sakib  = (SELECT invoice_id FROM student_invoices WHERE invoice_no = 'INV202601150018');
SET @inv_maryam = (SELECT invoice_id FROM student_invoices WHERE invoice_no = 'INV202601150019');
SET @inv_tanvir = (SELECT invoice_id FROM student_invoices WHERE invoice_no = 'INV202601150020');

INSERT INTO invoice_items (invoice_id, fee_head_id, amount) VALUES
-- Anika (full fresh invoice)
(@inv_anika, 1, 55000.00),  (@inv_anika, 2, 8000.00),
(@inv_anika, 3, 3000.00),   (@inv_anika, 4, 5000.00),
(@inv_anika, 5, 7000.00),   (@inv_anika, 6, 7000.00),
-- Sakib
(@inv_sakib, 1, 55000.00),  (@inv_sakib, 2, 8000.00),
(@inv_sakib, 3, 3000.00),   (@inv_sakib, 4, 5000.00),
(@inv_sakib, 5, 7000.00),   (@inv_sakib, 6, 7000.00),
-- Maryam
(@inv_maryam, 1, 55000.00), (@inv_maryam, 2, 8000.00),
(@inv_maryam, 3, 3000.00),  (@inv_maryam, 4, 5000.00),
(@inv_maryam, 5, 7000.00),  (@inv_maryam, 6, 7000.00),
-- Tanvir
(@inv_tanvir, 1, 55000.00), (@inv_tanvir, 2, 8000.00),
(@inv_tanvir, 3, 3000.00),  (@inv_tanvir, 4, 5000.00),
(@inv_tanvir, 5, 7000.00),  (@inv_tanvir, 6, 7000.00);

-- Payments for paid invoices
INSERT INTO payments (invoice_id, amount, method, reference_no, paid_at) VALUES
(@inv_sakib,  85000.00, 'bank_transfer', 'BT-2026-SAK001', '2026-01-20 09:30:00'),
(@inv_maryam, 55000.00, 'bank_transfer', 'BT-2026-MAR001', '2026-01-22 11:00:00'),
(@inv_tanvir, 85000.00, 'online',        'OL-2026-TAN001', '2026-01-18 14:15:00');

-- =====================================================================
-- 9. HOSTEL ALLOCATION — Anika & Sakib (freshers)
-- =====================================================================
-- Anika gets a hostel room (newly admitted)
INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status)
SELECT 17, hr.room_id, 
  COALESCE((SELECT MAX(ra.bed_no) FROM room_allocations ra WHERE ra.room_id = hr.room_id AND ra.status = 'active'), 0) + 1,
  '2026-05-20', '2027-05-20', 48000.00, FALSE, 'active'
FROM hostel_rooms hr
LEFT JOIN (SELECT room_id, COUNT(*) AS occ FROM room_allocations WHERE status='active' GROUP BY room_id) o 
  ON hr.room_id = o.room_id
WHERE hr.hostel_type = 'Girls' AND COALESCE(o.occ, 0) < hr.capacity
ORDER BY hr.room_id LIMIT 1;

-- Sakib gets a hostel room
INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status)
SELECT 18, hr.room_id,
  COALESCE((SELECT MAX(ra.bed_no) FROM room_allocations ra WHERE ra.room_id = hr.room_id AND ra.status = 'active'), 0) + 1,
  '2026-01-15', '2027-01-15', 48000.00, TRUE, 'active'
FROM hostel_rooms hr
LEFT JOIN (SELECT room_id, COUNT(*) AS occ FROM room_allocations WHERE status='active' GROUP BY room_id) o 
  ON hr.room_id = o.room_id
WHERE hr.hostel_type = 'Boys' AND COALESCE(o.occ, 0) < hr.capacity
ORDER BY hr.room_id LIMIT 1;

-- =====================================================================
-- 10. SCENARIO SUMMARY QUERIES (verify the profiles)
-- =====================================================================

-- A) Anika — Newly Admitted
-- Expected: user + student record, pending invoice, hostel allocated, ZERO enrollments
SELECT '── Profile A: Newly Admitted ──' AS scenario;
SELECT s.student_code, u.full_name, p.name AS program, s.batch_year,
  0 AS completed_courses, 0 AS active_courses, NULL AS cgpa,
  si.invoice_no, si.status AS invoice_status,
  CASE WHEN ra.allocation_id IS NOT NULL THEN 'Yes' ELSE 'No' END AS hostel
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN programs p ON s.program_id = p.program_id
LEFT JOIN student_invoices si ON s.student_id = si.student_id
LEFT JOIN room_allocations ra ON s.student_id = ra.student_id AND ra.status='active'
WHERE s.student_id = 17;

-- B) Sakib — 1st Semester
-- Expected: 5 active enrollments, zero results, invoice paid
SELECT '── Profile B: 1st Semester ──' AS scenario;
SELECT s.student_code, u.full_name, s.batch_year,
  COUNT(e.enrollment_id) AS active_courses,
  0 AS completed_credits, NULL AS cgpa,
  GROUP_CONCAT(c.course_code ORDER BY c.course_code) AS enrolled_in
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN enrollments e ON s.student_id = e.student_id AND e.status = 'active'
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
WHERE s.student_id = 18
GROUP BY s.student_id;

-- C) Maryam — 6th Semester
-- Expected: 16 completed results + 3 active, CGPA ≈ 3.42
SELECT '── Profile C: 6th Semester ──' AS scenario;
SELECT s.student_code, u.full_name, s.batch_year,
  SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed_courses,
  SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS active_courses,
  ROUND(SUM(CASE WHEN r.grade_code IS NOT NULL THEN g.grade_point * c.credit ELSE 0 END)
    / NULLIF(SUM(CASE WHEN r.grade_code IS NOT NULL THEN c.credit ELSE 0 END), 0), 2) AS cgpa
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
WHERE s.student_id = 19
GROUP BY s.student_id;

-- D) Tanvir — Final Year
-- Expected: 32 completed results + 2 active, CGPA ≈ 3.64
SELECT '── Profile D: Final Year ──' AS scenario;
SELECT s.student_code, u.full_name, s.batch_year,
  SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed_courses,
  SUM(CASE WHEN e.status='active' THEN 1 ELSE 0 END) AS active_courses,
  ROUND(SUM(CASE WHEN r.grade_code IS NOT NULL THEN g.grade_point * c.credit ELSE 0 END)
    / NULLIF(SUM(CASE WHEN r.grade_code IS NOT NULL THEN c.credit ELSE 0 END), 0), 2) AS cgpa,
  SUM(CASE WHEN r.grade_code IS NOT NULL THEN c.credit ELSE 0 END) AS credits_earned
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
WHERE s.student_id = 20
GROUP BY s.student_id;

-- All 4 profiles side by side
SELECT '── All Profiles Summary ──' AS scenario;
SELECT s.student_code, u.full_name, s.batch_year,
  CASE
    WHEN s.student_id = 17 THEN 'Newly Admitted'
    WHEN s.student_id = 18 THEN '1st Semester'
    WHEN s.student_id = 19 THEN '6th Semester'
    WHEN s.student_id = 20 THEN 'Final Year (12th)'
  END AS stage,
  COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.enrollment_id END) AS completed,
  COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.enrollment_id END) AS active,
  ROUND(SUM(CASE WHEN r.grade_code IS NOT NULL THEN g.grade_point * c.credit ELSE 0 END)
    / NULLIF(SUM(CASE WHEN r.grade_code IS NOT NULL THEN c.credit ELSE 0 END), 0), 2) AS cgpa
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN course_offerings co ON e.offering_id = co.offering_id
LEFT JOIN courses c ON co.course_id = c.course_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
WHERE s.student_id IN (17, 18, 19, 20)
GROUP BY s.student_id
ORDER BY s.student_id;
