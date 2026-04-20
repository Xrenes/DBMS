-- ============================================================================
-- STUDENT PORTAL DATABASE — MAJOR UPGRADE v2
-- Adds: Missing tables, Stored Functions, Advanced Stored Procedures (cursors),
--        Additional Triggers, Sample Data for all empty tables
-- ============================================================================

USE student_portal;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- PART 1: MISSING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notices (
    notice_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category ENUM('academic','exam','event','holiday','emergency','general') DEFAULT 'general',
    priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
    posted_by INT NOT NULL,
    target_audience ENUM('all','students','faculty','staff') DEFAULT 'all',
    is_pinned BOOLEAN DEFAULT FALSE,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(user_id),
    INDEX idx_notices_cat (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notice_reads (
    notice_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notice_id, user_id),
    FOREIGN KEY (notice_id) REFERENCES notices(notice_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_forms (
    form_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    semester_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_responses (
    response_id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,
    offering_id INT NOT NULL,
    student_id INT NOT NULL,
    teaching_rating TINYINT,
    content_rating TINYINT,
    assessment_rating TINYINT,
    overall_rating TINYINT,
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES evaluation_forms(form_id),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE INDEX idx_eval_unique (form_id, offering_id, student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faculty_profiles (
    faculty_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    dept_id INT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    specialization VARCHAR(255),
    office_room VARCHAR(50),
    joining_date DATE,
    employment_type ENUM('full-time','part-time','adjunct','visiting') DEFAULT 'full-time',
    max_credit_hours INT DEFAULT 12,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faculty_leave_requests (
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,
    leave_type ENUM('casual','sick','earned','maternity','study','unpaid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registration_requests (
    reg_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    status ENUM('draft','submitted','advisor_approved','dean_approved','registered','rejected') DEFAULT 'draft',
    total_credits DECIMAL(4,1) DEFAULT 0,
    advisor_id INT,
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    FOREIGN KEY (advisor_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registration_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    reg_id INT NOT NULL,
    offering_id INT NOT NULL,
    status ENUM('pending','approved','rejected','dropped') DEFAULT 'pending',
    FOREIGN KEY (reg_id) REFERENCES registration_requests(reg_id) ON DELETE CASCADE,
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clearance_requests (
    clearance_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    clearance_type ENUM('semester','graduation','transfer','withdrawal') NOT NULL,
    status ENUM('pending','in_progress','completed','rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clearance_steps (
    step_id INT PRIMARY KEY AUTO_INCREMENT,
    clearance_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status ENUM('pending','cleared','issue_found') DEFAULT 'pending',
    remarks TEXT,
    cleared_by INT,
    cleared_at TIMESTAMP NULL,
    FOREIGN KEY (clearance_id) REFERENCES clearance_requests(clearance_id) ON DELETE CASCADE,
    FOREIGN KEY (cleared_by) REFERENCES users(user_id)
) ENGINE=InnoDB;


-- ============================================================================
-- PART 2: ADD MORE STUDENTS & SEED ALL EMPTY TABLES
-- ============================================================================

-- Add 2 more student users  (user 8 = Iftekhar already exists as student_id 1)
INSERT INTO users (user_id, email, password_hash, full_name, phone, status) VALUES
    (9,  'rahima.khan@diu.edu.bd',   '$2a$10$3DY3JAwztGS.4uxrq1vDNuZIiSeJQ139xvXN6qyUWdUjRNNreaGCu', 'Rahima Khan',        '+8801812345678', 'active'),
    (10, 'tanvir.ahmed@diu.edu.bd',  '$2a$10$3DY3JAwztGS.4uxrq1vDNuZIiSeJQ139xvXN6qyUWdUjRNNreaGCu', 'Tanvir Ahmed',       '+8801912345678', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (9, 2), (10, 2);

INSERT INTO students (student_id, user_id, student_code, program_id, batch_year, section, enrollment_date) VALUES
    (2, 9,  '221-15-5340', 1, 2022, 'B', '2022-01-15'),
    (3, 10, '221-15-5820', 1, 2022, 'A', '2022-01-15')
ON DUPLICATE KEY UPDATE student_code=VALUES(student_code);

-- Update student 1 code to DIU format
UPDATE students SET student_code = '221-15-5765' WHERE student_id = 1;

-- Add enrollments for new students (same semester 7 offerings)
INSERT INTO enrollments (student_id, offering_id, status) VALUES
    (2, 1, 'active'), (2, 2, 'active'), (2, 3, 'active'),
    (3, 1, 'active'), (3, 4, 'active'), (3, 5, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Results (grade_code + total_mark, referencing enrollments)
INSERT INTO results (enrollment_id, grade_code, total_mark, published_at, locked) VALUES
    (1, 'A+', 85.5, NOW(), 1),
    (2, 'A',  78.0, NOW(), 1),
    (3, 'B+', 67.5, NOW(), 1),
    (4, 'A',  76.0, NOW(), 1),
    (5, 'B',  62.0, NOW(), 1),
    (6, 'A-', 72.0, NOW(), 1),
    (7, 'A-', 71.0, NOW(), 1),
    (8, 'B+', 68.0, NOW(), 1),
    (9, 'A',  77.0, NOW(), 1),
    (10, 'A+', 82.0, NOW(), 1),
    (11, 'B',  63.0, NOW(), 1),
    (12, 'A-', 73.5, NOW(), 1)
ON DUPLICATE KEY UPDATE grade_code=VALUES(grade_code);

-- Hostel rooms (hostel_name, hostel_type, room_no, floor, room_type, capacity, warden_*)
INSERT INTO hostel_rooms (hostel_name, hostel_type, room_no, floor, room_type, capacity, warden_name, warden_phone, warden_email) VALUES
    ('Bangabandhu Hall',  'Boys',  'A-101', 1, 'Double', 2, 'Md. Kamal Hossain', '01811111111', 'kamal.warden@diu.edu.bd'),
    ('Bangabandhu Hall',  'Boys',  'A-102', 1, 'Double', 2, 'Md. Kamal Hossain', '01811111111', 'kamal.warden@diu.edu.bd'),
    ('Bangabandhu Hall',  'Boys',  'A-201', 2, 'Single', 1, 'Md. Kamal Hossain', '01811111111', 'kamal.warden@diu.edu.bd'),
    ('Bangabandhu Hall',  'Boys',  'A-202', 2, 'Triple', 3, 'Md. Kamal Hossain', '01811111111', 'kamal.warden@diu.edu.bd'),
    ('Rokeya Hall',       'Girls', 'B-101', 1, 'Double', 2, 'Ms. Nasima Begum',  '01822222222', 'nasima.warden@diu.edu.bd'),
    ('Rokeya Hall',       'Girls', 'B-102', 1, 'Single', 1, 'Ms. Nasima Begum',  '01822222222', 'nasima.warden@diu.edu.bd'),
    ('Rokeya Hall',       'Girls', 'B-201', 2, 'Double', 2, 'Ms. Nasima Begum',  '01822222222', 'nasima.warden@diu.edu.bd'),
    ('Shaheed Minar Hall','Boys',  'C-101', 1, 'Triple', 3, 'Md. Alam',          '01833333333', 'alam.warden@diu.edu.bd')
ON DUPLICATE KEY UPDATE hostel_name=VALUES(hostel_name);

-- Room allocations (student_id FK to students.student_id)
INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status) VALUES
    (1, 1, 1, '2026-01-20', '2026-12-31', 60000.00, 1, 'active'),
    (2, 5, 1, '2026-01-20', '2026-12-31', 60000.00, 0, 'active'),
    (3, 2, 2, '2026-01-20', '2026-12-31', 60000.00, 1, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Transport routes
INSERT INTO transport_routes (route_name, start_point, end_point, vehicle_no, vehicle_capacity, driver_name, driver_phone, stops_json) VALUES
    ('Route 1 - Dhanmondi',  'Dhanmondi 27',       'DIU Permanent Campus', 'DHK-B-11-5501', 52, 'Rahim Mia',      '01811111111', '["Jigatola","Newmarket","Farmgate","Mohakhali"]'),
    ('Route 2 - Mirpur',     'Mirpur 10',           'DIU Permanent Campus', 'DHK-B-22-6602', 52, 'Karim Sheikh',    '01822222222', '["Mirpur-2","Pallabi","Farmgate"]'),
    ('Route 3 - Uttara',     'Uttara Sector 3',     'DIU Permanent Campus', 'DHK-B-33-7703', 48, 'Jamal Hossain',   '01833333333', '["Airport","Mohakhali","Banani","Gulshan"]'),
    ('Route 4 - Motijheel',  'Motijheel',           'DIU Permanent Campus', 'DHK-B-44-8804', 52, 'Sumon Das',       '01844444444', '["Gulistan","Shahbagh","Farmgate"]'),
    ('Route 5 - Gazipur',    'Gazipur Chowrasta',   'DIU Permanent Campus', 'DHK-B-55-9905', 48, 'Liton Ali',       '01855555555', '["Board Bazar","Tongi","Joydevpur"]')
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- Transport subscriptions (student_id FK)
INSERT INTO transport_subscriptions (student_id, route_id, pickup_point, pickup_time, semester_id, fee_amount, fee_paid, status) VALUES
    (1, 1, 'Jigatola',   '07:30:00', 7, 1500.00, 1, 'active'),
    (2, 3, 'Airport',    '07:15:00', 7, 2000.00, 0, 'active'),
    (3, 2, 'Mirpur-2',   '07:20:00', 7, 1500.00, 1, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Student invoices for students 2 & 3 (student 1 already has one)
INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status) VALUES
    (2, 7, 'INV202601150002', '2026-01-01', '2026-04-01', 'pending'),
    (3, 7, 'INV202601150003', '2026-01-01', '2026-04-01', 'paid')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Invoice items for new invoices
INSERT INTO invoice_items (invoice_id, fee_head_id, amount) VALUES
    (2, 1, 55000.00), (2, 2, 8000.00), (2, 3, 3000.00), (2, 4, 5000.00), (2, 5, 7000.00),
    (3, 1, 55000.00), (3, 2, 8000.00), (3, 3, 3000.00), (3, 4, 5000.00), (3, 5, 7000.00)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- Payments
INSERT INTO payments (invoice_id, amount, method, paid_at, reference_no, receipt_no, recorded_by) VALUES
    (1, 40000.00, 'Bank',  '2026-01-25 10:30:00', 'TXN-2026-00101', 'RCP-001', 7),
    (1, 20000.00, 'bKash', '2026-02-15 14:20:00', 'TXN-2026-00102', 'RCP-002', 7),
    (3, 55000.00, 'Bank',  '2026-01-20 09:00:00', 'TXN-2026-00301', 'RCP-003', 7),
    (3, 23000.00, 'Nagad', '2026-02-10 11:30:00', 'TXN-2026-00302', 'RCP-004', 7)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- Notices
INSERT INTO notices (title, body, category, priority, posted_by, target_audience, is_pinned, expires_at) VALUES
    ('Spring 2026 Semester Registration Open', 'Online course registration for Spring 2026 semester is now open. Complete registration before Jan 30.', 'academic', 'high', 1, 'students', TRUE, '2026-01-30'),
    ('Mid-Term Exam Schedule Published', 'The mid-term examination schedule for Spring 2026 has been published. Check the exam schedule page.', 'exam', 'urgent', 1, 'all', TRUE, '2026-03-15'),
    ('Annual Sports Day 2026', 'DIU Annual Sports Day on March 20, 2026 at the main campus ground. All students encouraged to participate.', 'event', 'normal', 1, 'all', FALSE, '2026-03-20'),
    ('Pohela Boishakh Holiday', 'University closed on April 14, 2026 for Pohela Boishakh. Classes resume April 15.', 'holiday', 'normal', 1, 'all', FALSE, '2026-04-15'),
    ('Library Fine Clearance Deadline', 'All overdue library books must be returned by Feb 28. Fines doubled after deadline.', 'general', 'high', 1, 'students', FALSE, '2026-02-28'),
    ('Emergency: Water Supply Disruption', 'Block B hostel water disrupted 10AM-4PM Feb 5 for maintenance.', 'emergency', 'urgent', 1, 'all', TRUE, '2026-02-05'),
    ('Faculty Development Workshop', 'Workshop on AI in Education on Feb 20th in Seminar Hall. All faculty requested to attend.', 'event', 'normal', 1, 'faculty', FALSE, '2026-02-20'),
    ('Summer 2026 Internship Program', 'Apply through Career Services portal by March 1 for Summer 2026 internship.', 'academic', 'normal', 1, 'students', FALSE, '2026-03-01');

INSERT IGNORE INTO notice_reads (notice_id, user_id) VALUES
    (1, 8), (1, 9), (1, 10),
    (2, 8), (2, 9),
    (3, 8),
    (5, 9), (5, 10);

-- Evaluation forms
INSERT INTO evaluation_forms (title, semester_id, is_active, start_date, end_date) VALUES
    ('Spring 2026 Course Evaluation', 7, TRUE, '2026-05-01', '2026-05-15'),
    ('Summer 2022 Course Evaluation', 5, FALSE, '2022-12-01', '2022-12-15');

-- Evaluation responses (student_id FK to students.student_id)
INSERT INTO evaluation_responses (form_id, offering_id, student_id, teaching_rating, content_rating, assessment_rating, overall_rating, comments) VALUES
    (1, 1, 1, 5, 4, 4, 5, 'Excellent AI course. Very engaging lectures by Dr. Rahman.'),
    (1, 1, 2, 4, 4, 3, 4, 'Good content but assignments were too heavy.'),
    (1, 2, 1, 4, 5, 4, 4, 'Great software architecture labs. Could improve slides.'),
    (1, 2, 3, 5, 5, 5, 5, 'Best course this semester. Prof. Bhuiyan is amazing.'),
    (1, 3, 2, 3, 3, 4, 3, 'IoT course needs more real-world examples.');

-- Faculty profiles (users 2-6 are faculty)
INSERT INTO faculty_profiles (user_id, dept_id, designation, specialization, office_room, joining_date, employment_type, max_credit_hours) VALUES
    (2, 1, 'Professor & Head',         'Computer Vision, Deep Learning',       'AB1-401', '2008-06-01', 'full-time', 9),
    (3, 1, 'Associate Professor',      'Data Mining, Machine Learning',        'AB1-501', '2012-01-15', 'full-time', 12),
    (4, 1, 'Professor',                'Software Engineering, Architecture',   'AB1-402', '2010-03-01', 'full-time', 9),
    (5, 1, 'Associate Professor',      'IoT, Embedded Systems',               'AB1-502', '2015-08-01', 'full-time', 12),
    (6, 1, 'Lecturer',                 'Blockchain, Network Security',         'AB1-503', '2019-07-01', 'full-time', 15)
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

-- Faculty leave requests
INSERT INTO faculty_leave_requests (faculty_user_id, leave_type, start_date, end_date, reason, status, approved_by, approved_at) VALUES
    (3, 'casual', '2026-03-10', '2026-03-12', 'Family event', 'approved', 1, '2026-03-05 10:00:00'),
    (5, 'sick',   '2026-02-20', '2026-02-22', 'Fever and flu', 'approved', 1, '2026-02-20 08:00:00'),
    (4, 'study',  '2026-04-01', '2026-04-15', 'Conference presentation at ICSE 2026', 'pending', NULL, NULL),
    (2, 'earned', '2026-06-01', '2026-06-10', 'Annual vacation', 'pending', NULL, NULL);

-- Registration requests (student_id FK)
INSERT INTO registration_requests (student_id, semester_id, status, total_credits, advisor_id, submitted_at, approved_at) VALUES
    (1, 7, 'registered',       18.0, 3, '2026-01-10 10:00:00', '2026-01-12 14:00:00'),
    (2, 7, 'registered',        9.0, 5, '2026-01-11 09:00:00', '2026-01-13 11:00:00'),
    (3, 7, 'advisor_approved', 9.0, 3, '2026-01-12 08:00:00', NULL);

INSERT INTO registration_items (reg_id, offering_id, status) VALUES
    (1, 1, 'approved'), (1, 2, 'approved'), (1, 3, 'approved'), (1, 4, 'approved'), (1, 5, 'approved'), (1, 6, 'approved'),
    (2, 1, 'approved'), (2, 2, 'approved'), (2, 3, 'approved'),
    (3, 1, 'pending'),  (3, 4, 'pending'),  (3, 5, 'pending');

-- Clearance requests (student_id FK)
INSERT INTO clearance_requests (student_id, clearance_type, status) VALUES
    (2, 'semester',    'completed'),
    (3, 'semester',    'in_progress'),
    (1, 'graduation',  'pending');

INSERT INTO clearance_steps (clearance_id, department, step_name, status, remarks, cleared_by, cleared_at) VALUES
    (1, 'Library',    'Library Book Return',       'cleared',     'All books returned',     1, '2026-05-10 10:00:00'),
    (1, 'Finance',    'Tuition Fee Clearance',     'cleared',     'No dues',                1, '2026-05-10 11:00:00'),
    (1, 'IT',         'Lab Equipment Return',      'cleared',     'All cleared',            1, '2026-05-10 12:00:00'),
    (1, 'Department', 'Departmental Clearance',    'cleared',     'Approved',               1, '2026-05-11 09:00:00'),
    (2, 'Library',    'Library Book Return',       'cleared',     'Books returned',         1, '2026-05-12 10:00:00'),
    (2, 'Finance',    'Tuition Fee Clearance',     'issue_found', 'Outstanding: 78,000 BDT', NULL, NULL),
    (2, 'IT',         'Lab Equipment Return',      'pending',      NULL, NULL, NULL),
    (2, 'Department', 'Departmental Clearance',    'pending',      NULL, NULL, NULL),
    (3, 'Library',    'Library Book Return',       'pending',      NULL, NULL, NULL),
    (3, 'Finance',    'Tuition Fee Clearance',     'pending',      NULL, NULL, NULL),
    (3, 'Hostel',     'Hostel Room Clearance',     'pending',      NULL, NULL, NULL),
    (3, 'IT',         'Lab Equipment Return',      'pending',      NULL, NULL, NULL),
    (3, 'Department', 'Departmental Clearance',    'pending',      NULL, NULL, NULL),
    (3, 'Registrar',  'Final Transcript Verify',   'pending',      NULL, NULL, NULL);

-- Populate fact_academic OLAP warehouse
INSERT INTO fact_academic (fact_type, fact_date, student_id, student_code, student_name, program_code, dept_code, batch_year, semester_id, semester_name, course_code, course_title, credit, grade_code, grade_point, total_mark, credit_points)
SELECT 'result', CURDATE(), s.student_id, s.student_code, u.full_name, p.code, d.code, s.batch_year,
       co.semester_id, sem.name, c.course_code, c.title, c.credit, r.grade_code,
       gs.grade_point, r.total_mark, gs.grade_point * c.credit
FROM results r
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN semesters sem ON co.semester_id = sem.semester_id
JOIN programs p ON s.program_id = p.program_id
JOIN departments d ON p.dept_id = d.dept_id
JOIN grade_scale gs ON r.grade_code = gs.grade_code
ON DUPLICATE KEY UPDATE grade_code=VALUES(grade_code);


-- ============================================================================
-- PART 3: STORED FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calculate_sgpa;
DELIMITER //
CREATE FUNCTION fn_calculate_sgpa(p_student_id INT, p_semester_id INT)
RETURNS DECIMAL(4,2) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_sgpa DECIMAL(4,2) DEFAULT 0.00;
    DECLARE v_total_credits DECIMAL(6,1) DEFAULT 0;
    DECLARE v_total_points DECIMAL(10,2) DEFAULT 0;

    SELECT COALESCE(SUM(c.credit), 0), COALESCE(SUM(gs.grade_point * c.credit), 0)
    INTO v_total_credits, v_total_points
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN results r ON e.enrollment_id = r.enrollment_id
    JOIN grade_scale gs ON r.grade_code = gs.grade_code
    WHERE e.student_id = p_student_id AND co.semester_id = p_semester_id;

    IF v_total_credits > 0 THEN SET v_sgpa = v_total_points / v_total_credits; END IF;
    RETURN v_sgpa;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_calculate_cgpa;
DELIMITER //
CREATE FUNCTION fn_calculate_cgpa(p_student_id INT)
RETURNS DECIMAL(4,2) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cgpa DECIMAL(4,2) DEFAULT 0.00;
    DECLARE v_total_credits DECIMAL(6,1) DEFAULT 0;
    DECLARE v_total_points DECIMAL(10,2) DEFAULT 0;

    SELECT COALESCE(SUM(c.credit), 0), COALESCE(SUM(gs.grade_point * c.credit), 0)
    INTO v_total_credits, v_total_points
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN results r ON e.enrollment_id = r.enrollment_id
    JOIN grade_scale gs ON r.grade_code = gs.grade_code
    WHERE e.student_id = p_student_id;

    IF v_total_credits > 0 THEN SET v_cgpa = v_total_points / v_total_credits; END IF;
    RETURN v_cgpa;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_academic_standing;
DELIMITER //
CREATE FUNCTION fn_academic_standing(p_cgpa DECIMAL(4,2))
RETURNS VARCHAR(30) DETERMINISTIC
NO SQL
BEGIN
    IF p_cgpa >= 3.90 THEN RETURN 'Summa Cum Laude';
    ELSEIF p_cgpa >= 3.70 THEN RETURN 'Magna Cum Laude';
    ELSEIF p_cgpa >= 3.50 THEN RETURN 'Cum Laude';
    ELSEIF p_cgpa >= 3.00 THEN RETURN 'Deans List';
    ELSEIF p_cgpa >= 2.00 THEN RETURN 'Good Standing';
    ELSEIF p_cgpa >= 1.00 THEN RETURN 'Probation';
    ELSE RETURN 'Academic Warning';
    END IF;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_payment_percentage;
DELIMITER //
CREATE FUNCTION fn_payment_percentage(p_invoice_id INT)
RETURNS DECIMAL(5,2) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(12,2) DEFAULT 0;
    DECLARE v_paid DECIMAL(12,2) DEFAULT 0;

    SELECT COALESCE(SUM(ii.amount), 0) INTO v_total FROM invoice_items ii WHERE ii.invoice_id = p_invoice_id;
    SELECT COALESCE(SUM(p.amount), 0)  INTO v_paid  FROM payments p       WHERE p.invoice_id = p_invoice_id;

    IF v_total > 0 THEN RETURN ROUND((v_paid / v_total) * 100, 2); END IF;
    RETURN 0.00;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_attendance_pct;
DELIMITER //
CREATE FUNCTION fn_attendance_pct(p_student_id INT, p_offering_id INT)
RETURNS DECIMAL(5,2) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_present INT DEFAULT 0;

    SELECT COUNT(*), SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END)
    INTO v_total, v_present
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.session_id = cs.session_id
    WHERE ar.student_user_id = (SELECT user_id FROM students WHERE student_id = p_student_id)
      AND cs.offering_id = p_offering_id;

    IF v_total > 0 THEN RETURN ROUND((v_present / v_total) * 100, 2); END IF;
    RETURN 0.00;
END //
DELIMITER ;


-- ============================================================================
-- PART 4: STORED PROCEDURES WITH CURSORS
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_semester_report_card;
DELIMITER //
CREATE PROCEDURE sp_semester_report_card(IN p_semester_id INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_sid INT;
    DECLARE v_name VARCHAR(100);
    DECLARE v_code VARCHAR(20);
    DECLARE v_sgpa DECIMAL(4,2);
    DECLARE v_cgpa DECIMAL(4,2);

    DECLARE cur CURSOR FOR
        SELECT DISTINCT e.student_id, u.full_name, s.student_code
        FROM enrollments e
        JOIN students s ON e.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN course_offerings co ON e.offering_id = co.offering_id
        WHERE co.semester_id = p_semester_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DROP TEMPORARY TABLE IF EXISTS tmp_report;
    CREATE TEMPORARY TABLE tmp_report (
        student_code VARCHAR(20), student_name VARCHAR(100),
        sgpa DECIMAL(4,2), cgpa DECIMAL(4,2), standing VARCHAR(30),
        courses INT, credits DECIMAL(4,1)
    );

    OPEN cur;
    rloop: LOOP
        FETCH cur INTO v_sid, v_name, v_code;
        IF v_done THEN LEAVE rloop; END IF;
        SET v_sgpa = fn_calculate_sgpa(v_sid, p_semester_id);
        SET v_cgpa = fn_calculate_cgpa(v_sid);
        INSERT INTO tmp_report VALUES (
            v_code, v_name, v_sgpa, v_cgpa, fn_academic_standing(v_cgpa),
            (SELECT COUNT(*) FROM enrollments e2 JOIN course_offerings co2 ON e2.offering_id=co2.offering_id WHERE e2.student_id=v_sid AND co2.semester_id=p_semester_id),
            (SELECT COALESCE(SUM(c2.credit),0) FROM enrollments e2 JOIN course_offerings co2 ON e2.offering_id=co2.offering_id JOIN courses c2 ON co2.course_id=c2.course_id WHERE e2.student_id=v_sid AND co2.semester_id=p_semester_id)
        );
    END LOOP;
    CLOSE cur;

    SELECT * FROM tmp_report ORDER BY cgpa DESC;
    DROP TEMPORARY TABLE IF EXISTS tmp_report;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_attendance_summary;
DELIMITER //
CREATE PROCEDURE sp_attendance_summary(IN p_offering_id INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_sid INT;
    DECLARE v_name VARCHAR(100);
    DECLARE v_code VARCHAR(20);
    DECLARE v_pct DECIMAL(5,2);

    DECLARE cur CURSOR FOR
        SELECT DISTINCT s.student_id, u.full_name, s.student_code
        FROM attendance_records ar
        JOIN students s ON s.user_id = ar.student_user_id
        JOIN users u ON s.user_id = u.user_id
        JOIN class_sessions cs ON ar.session_id = cs.session_id
        WHERE cs.offering_id = p_offering_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DROP TEMPORARY TABLE IF EXISTS tmp_att;
    CREATE TEMPORARY TABLE tmp_att (
        student_code VARCHAR(20), student_name VARCHAR(100),
        attendance_pct DECIMAL(5,2), eligibility VARCHAR(20)
    );

    OPEN cur;
    aloop: LOOP
        FETCH cur INTO v_sid, v_name, v_code;
        IF v_done THEN LEAVE aloop; END IF;
        SET v_pct = fn_attendance_pct(v_sid, p_offering_id);
        INSERT INTO tmp_att VALUES (v_code, v_name, v_pct,
            CASE WHEN v_pct >= 75 THEN 'Eligible' WHEN v_pct >= 60 THEN 'Warning' ELSE 'Barred' END);
    END LOOP;
    CLOSE cur;

    SELECT * FROM tmp_att ORDER BY attendance_pct DESC;
    DROP TEMPORARY TABLE IF EXISTS tmp_att;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_admit_student;
DELIMITER //
CREATE PROCEDURE sp_admit_student(
    IN p_email VARCHAR(255), IN p_full_name VARCHAR(100), IN p_phone VARCHAR(20),
    IN p_password VARCHAR(255), IN p_student_code VARCHAR(20),
    IN p_program_id INT, IN p_batch_year INT, IN p_section VARCHAR(5)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admission failed. Rolled back.'; END;

    START TRANSACTION;
    -- p_password is pre-hashed by the application server (bcrypt) before reaching here
    INSERT INTO users (email, password_hash, full_name, phone, status) VALUES (p_email, p_password, p_full_name, p_phone, 'active');
    SET v_user_id = LAST_INSERT_ID();
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, 2);
    INSERT INTO students (user_id, student_code, program_id, batch_year, section, enrollment_date) VALUES (v_user_id, p_student_code, p_program_id, p_batch_year, p_section, CURDATE());
    INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload) VALUES (1, 'STUDENT_ADMITTED', 'student', v_user_id, JSON_OBJECT('code', p_student_code, 'name', p_full_name));
    COMMIT;
    SELECT v_user_id AS new_user_id, p_student_code AS student_code, 'Admission successful' AS message;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_fee_summary;
DELIMITER //
CREATE PROCEDURE sp_fee_summary(IN p_semester_id INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_inv_id INT;
    DECLARE v_sname VARCHAR(100);
    DECLARE v_total DECIMAL(12,2);
    DECLARE v_paid DECIMAL(12,2);
    DECLARE v_grand_total DECIMAL(14,2) DEFAULT 0;
    DECLARE v_grand_paid DECIMAL(14,2) DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT si.invoice_id, u.full_name,
               (SELECT COALESCE(SUM(amount),0) FROM invoice_items WHERE invoice_id=si.invoice_id),
               (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id=si.invoice_id)
        FROM student_invoices si
        JOIN students s ON si.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE si.semester_id = p_semester_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DROP TEMPORARY TABLE IF EXISTS tmp_fees;
    CREATE TEMPORARY TABLE tmp_fees (student_name VARCHAR(100), total_amount DECIMAL(12,2), paid_amount DECIMAL(12,2), due_amount DECIMAL(12,2), payment_pct DECIMAL(5,2), status VARCHAR(20));

    OPEN cur;
    floop: LOOP
        FETCH cur INTO v_inv_id, v_sname, v_total, v_paid;
        IF v_done THEN LEAVE floop; END IF;
        SET v_grand_total = v_grand_total + v_total;
        SET v_grand_paid = v_grand_paid + v_paid;
        INSERT INTO tmp_fees VALUES (v_sname, v_total, v_paid, v_total - v_paid,
            CASE WHEN v_total > 0 THEN ROUND((v_paid/v_total)*100,2) ELSE 0 END,
            CASE WHEN v_paid >= v_total THEN 'Paid' WHEN v_paid > 0 THEN 'Partial' ELSE 'Unpaid' END);
    END LOOP;
    CLOSE cur;

    SELECT * FROM tmp_fees ORDER BY due_amount DESC;
    SELECT v_grand_total AS total_billed, v_grand_paid AS total_collected,
           v_grand_total - v_grand_paid AS total_outstanding,
           CASE WHEN v_grand_total > 0 THEN ROUND((v_grand_paid/v_grand_total)*100,2) ELSE 0 END AS collection_rate;
    DROP TEMPORARY TABLE IF EXISTS tmp_fees;
END //
DELIMITER ;


-- ============================================================================
-- PART 5: ADDITIONAL TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_notice_after_insert;
DELIMITER //
CREATE TRIGGER trg_notice_after_insert AFTER INSERT ON notices FOR EACH ROW
BEGIN
    INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
    VALUES (NEW.posted_by, 'NOTICE_POSTED', 'notice', NEW.notice_id,
            JSON_OBJECT('title', NEW.title, 'category', NEW.category, 'priority', NEW.priority));
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_clearance_step_update;
DELIMITER //
CREATE TRIGGER trg_clearance_step_update AFTER UPDATE ON clearance_steps FOR EACH ROW
BEGIN
    DECLARE v_total INT;
    DECLARE v_cleared INT;
    SELECT COUNT(*), SUM(status = 'cleared') INTO v_total, v_cleared FROM clearance_steps WHERE clearance_id = NEW.clearance_id;
    IF v_cleared = v_total THEN
        UPDATE clearance_requests SET status = 'completed', completed_at = NOW() WHERE clearance_id = NEW.clearance_id;
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_reg_item_after_insert;
DELIMITER //
CREATE TRIGGER trg_reg_item_after_insert AFTER INSERT ON registration_items FOR EACH ROW
BEGIN
    UPDATE registration_requests SET total_credits = (
        SELECT COALESCE(SUM(c.credit), 0)
        FROM registration_items ri
        JOIN course_offerings co ON ri.offering_id = co.offering_id
        JOIN courses c ON co.course_id = c.course_id
        WHERE ri.reg_id = NEW.reg_id AND ri.status != 'rejected'
    ) WHERE reg_id = NEW.reg_id;
END //
DELIMITER ;


-- ============================================================================
-- PART 6: ADDITIONAL VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW vw_faculty_course_load AS
SELECT fp.faculty_id, u.full_name AS faculty_name, fp.designation, d.name AS department,
       COUNT(co.offering_id) AS courses_teaching, COALESCE(SUM(c.credit), 0) AS total_credits,
       fp.max_credit_hours,
       CASE WHEN COALESCE(SUM(c.credit), 0) > fp.max_credit_hours THEN 'Overloaded'
            WHEN COALESCE(SUM(c.credit), 0) = fp.max_credit_hours THEN 'Full' ELSE 'Available' END AS load_status
FROM faculty_profiles fp
JOIN users u ON fp.user_id = u.user_id
JOIN departments d ON fp.dept_id = d.dept_id
LEFT JOIN course_offerings co ON co.teacher_id = fp.user_id
LEFT JOIN courses c ON co.course_id = c.course_id
GROUP BY fp.faculty_id, u.full_name, fp.designation, d.name, fp.max_credit_hours;

CREATE OR REPLACE VIEW vw_notice_board AS
SELECT n.notice_id, n.title, n.category, n.priority, n.target_audience, n.is_pinned, n.created_at, n.expires_at,
       u.full_name AS posted_by_name,
       (SELECT COUNT(*) FROM notice_reads nr WHERE nr.notice_id = n.notice_id) AS read_count,
       CASE WHEN n.expires_at < CURDATE() THEN 'expired' ELSE 'active' END AS notice_status
FROM notices n JOIN users u ON n.posted_by = u.user_id
ORDER BY n.is_pinned DESC, n.created_at DESC;

CREATE OR REPLACE VIEW vw_registration_overview AS
SELECT rr.reg_id, u.full_name AS student_name, s.student_code, sem.name AS semester,
       rr.status, rr.total_credits, adv.full_name AS advisor_name,
       COUNT(ri.item_id) AS course_count,
       SUM(ri.status = 'approved') AS approved_courses, SUM(ri.status = 'pending') AS pending_courses,
       rr.submitted_at, rr.approved_at
FROM registration_requests rr
JOIN students s ON rr.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN semesters sem ON rr.semester_id = sem.semester_id
LEFT JOIN users adv ON rr.advisor_id = adv.user_id
LEFT JOIN registration_items ri ON rr.reg_id = ri.reg_id
GROUP BY rr.reg_id;

CREATE OR REPLACE VIEW vw_clearance_tracking AS
SELECT cr.clearance_id, u.full_name AS student_name, s.student_code,
       cr.clearance_type, cr.status AS overall_status,
       COUNT(cs.step_id) AS total_steps, SUM(cs.status = 'cleared') AS cleared_steps,
       SUM(cs.status = 'issue_found') AS issues,
       ROUND(SUM(cs.status = 'cleared') / COUNT(cs.step_id) * 100, 1) AS progress_pct,
       cr.requested_at
FROM clearance_requests cr
JOIN students s ON cr.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
LEFT JOIN clearance_steps cs ON cr.clearance_id = cs.clearance_id
GROUP BY cr.clearance_id;

CREATE OR REPLACE VIEW vw_evaluation_summary AS
SELECT co.offering_id, c.course_code, c.title AS course_title, u.full_name AS instructor_name,
       COUNT(er.response_id) AS response_count,
       ROUND(AVG(er.teaching_rating), 2) AS avg_teaching,
       ROUND(AVG(er.content_rating), 2) AS avg_content,
       ROUND(AVG(er.assessment_rating), 2) AS avg_assessment,
       ROUND(AVG(er.overall_rating), 2) AS avg_overall
FROM evaluation_responses er
JOIN evaluation_forms ef ON er.form_id = ef.form_id
JOIN course_offerings co ON er.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN users u ON co.teacher_id = u.user_id
GROUP BY co.offering_id, c.course_code, c.title, u.full_name;

SET FOREIGN_KEY_CHECKS = 1;

-- Final status
SELECT 'UPGRADE COMPLETE' AS status,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='student_portal' AND TABLE_TYPE='BASE TABLE') AS total_tables,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA='student_portal') AS total_views,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA='student_portal' AND ROUTINE_TYPE='PROCEDURE') AS procedures,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA='student_portal' AND ROUTINE_TYPE='FUNCTION') AS functions,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA='student_portal') AS triggers;
