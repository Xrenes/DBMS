-- ============================================================================
-- STUDENT PORTAL DATABASE - Complete MySQL Schema
-- Version: 1.0
-- Database: MySQL 8.x
-- Description: 3NF Normalized University Student Management System
-- Features: RBAC, Academic, Results, Attendance, Exams, Finance, Hostel, Transport
--           Audit Logging, Immutable Ledger, OLAP Warehouse, Distributed/Cloud Metadata
-- ============================================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS student_portal;
CREATE DATABASE student_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_portal;

-- ============================================================================
-- MODULE 1: IDENTITY & RBAC (Role-Based Access Control)
-- ============================================================================

-- Table 1: users - All system users (students, faculty, admin, staff)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Table 2: roles - System roles
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    UNIQUE INDEX idx_roles_name (role_name)
) ENGINE=InnoDB;

-- Table 3: user_roles - Junction table (M:N users-roles)
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    INDEX idx_user_roles_role (role_id)
) ENGINE=InnoDB;

-- Table 4: permissions - System permissions
CREATE TABLE permissions (
    perm_id INT PRIMARY KEY AUTO_INCREMENT,
    perm_code VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    UNIQUE INDEX idx_perms_code (perm_code)
) ENGINE=InnoDB;

-- Table 5: role_permissions - Junction table (M:N roles-permissions)
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    perm_id INT NOT NULL,
    PRIMARY KEY (role_id, perm_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (perm_id) REFERENCES permissions(perm_id) ON DELETE CASCADE,
    INDEX idx_role_perms_perm (perm_id)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 2: ACADEMIC STRUCTURE
-- ============================================================================

-- Table 6: departments
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    faculty VARCHAR(100),
    UNIQUE INDEX idx_dept_code (code),
    UNIQUE INDEX idx_dept_name (name)
) ENGINE=InnoDB;

-- Table 7: programs
CREATE TABLE programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_credits INT NOT NULL,
    duration_years INT NOT NULL,
    UNIQUE INDEX idx_program_code (code),
    UNIQUE INDEX idx_program_dept_name (dept_id, name),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE RESTRICT,
    INDEX idx_program_dept (dept_id)
) ENGINE=InnoDB;

-- Table 8: students
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_code VARCHAR(20) NOT NULL,
    program_id INT NOT NULL,
    batch_year YEAR NOT NULL,
    section CHAR(1) DEFAULT 'A',
    enrollment_date DATE NOT NULL,
    advisor_id INT,
    photo_url VARCHAR(500),
    UNIQUE INDEX idx_student_user (user_id),
    UNIQUE INDEX idx_student_code (student_code),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE RESTRICT,
    FOREIGN KEY (advisor_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_student_program (program_id),
    INDEX idx_student_batch (batch_year)
) ENGINE=InnoDB;

-- Table 9: semesters
CREATE TABLE semesters (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    UNIQUE INDEX idx_semester_name (name),
    CHECK (end_date > start_date)
) ENGINE=InnoDB;

-- Table 10: courses
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    credit DECIMAL(3,1) NOT NULL,
    category ENUM('Major', 'Minor', 'Elective') NOT NULL DEFAULT 'Major',
    UNIQUE INDEX idx_course_code (course_code),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE RESTRICT,
    INDEX idx_course_dept (dept_id),
    CHECK (credit > 0 AND credit <= 6)
) ENGINE=InnoDB;

-- Table 11: course_offerings
CREATE TABLE course_offerings (
    offering_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    teacher_id INT,
    section CHAR(1) NOT NULL DEFAULT 'A',
    max_students INT DEFAULT 60,
    UNIQUE INDEX idx_offering_unique (course_id, semester_id, section),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_offering_semester (semester_id),
    INDEX idx_offering_teacher (teacher_id)
) ENGINE=InnoDB;

-- Table 12: enrollments
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    offering_id INT NOT NULL,
    status ENUM('active', 'dropped', 'completed') DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_enrollment_unique (student_id, offering_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE RESTRICT,
    INDEX idx_enrollment_student (student_id),
    INDEX idx_enrollment_offering (offering_id)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 3: RESULTS
-- ============================================================================

-- Table 13: grade_scale - Bangladesh 4.0 GPA Scale
CREATE TABLE grade_scale (
    grade_code CHAR(2) PRIMARY KEY,
    grade_point DECIMAL(3,2) NOT NULL,
    min_mark INT NOT NULL,
    max_mark INT NOT NULL,
    remark VARCHAR(50),
    is_pass BOOLEAN DEFAULT TRUE,
    CHECK (min_mark >= 0 AND max_mark <= 100),
    CHECK (min_mark < max_mark)
) ENGINE=InnoDB;

-- Table 14: results
CREATE TABLE results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    grade_code CHAR(2),
    total_mark DECIMAL(5,2),
    published_at TIMESTAMP NULL,
    locked BOOLEAN DEFAULT FALSE,
    UNIQUE INDEX idx_result_enrollment (enrollment_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (grade_code) REFERENCES grade_scale(grade_code) ON DELETE RESTRICT,
    CHECK (total_mark >= 0 AND total_mark <= 100)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 4: TIMETABLE & ATTENDANCE
-- ============================================================================

-- Table 15: class_sessions (merged timetable + sessions)
CREATE TABLE class_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    offering_id INT NOT NULL,
    session_date DATE NOT NULL,
    day_of_week ENUM('Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    session_type ENUM('lecture', 'lab', 'tutorial', 'project') DEFAULT 'lecture',
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    is_recurring BOOLEAN DEFAULT FALSE,
    UNIQUE INDEX idx_session_unique (offering_id, session_date, start_time),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    INDEX idx_session_date (session_date),
    INDEX idx_session_offering (offering_id),
    CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- Table 16: attendance_records
CREATE TABLE attendance_records (
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('P', 'A', 'L') NOT NULL DEFAULT 'P',
    marked_by INT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES class_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_marked (marked_at)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 5: EXAMS
-- ============================================================================

-- Table 17: exams
CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    offering_id INT NOT NULL,
    exam_type ENUM('Quiz', 'Assignment', 'Midterm', 'Final', 'Lab', 'Presentation', 'Project') NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL,
    exam_date DATE,
    start_time TIME,
    duration_mins INT,
    venue VARCHAR(100),
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    INDEX idx_exam_offering (offering_id),
    CHECK (total_marks > 0),
    CHECK (weight_percent > 0 AND weight_percent <= 100)
) ENGINE=InnoDB;

-- Table 18: exam_marks
CREATE TABLE exam_marks (
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    obtained_marks DECIMAL(5,2),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_exam_marks_student (student_id),
    CHECK (obtained_marks >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 6: FINANCE (Header-Detail Pattern)
-- ============================================================================

-- Table 19: fee_heads
CREATE TABLE fee_heads (
    fee_head_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    UNIQUE INDEX idx_fee_head_name (name)
) ENGINE=InnoDB;

-- Table 20: student_invoices (Header)
CREATE TABLE student_invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    invoice_no VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_invoice_no (invoice_no),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE RESTRICT,
    INDEX idx_invoice_student (student_id),
    INDEX idx_invoice_semester (semester_id),
    INDEX idx_invoice_status (status),
    CHECK (due_date >= issue_date)
) ENGINE=InnoDB;

-- Table 21: invoice_items (Detail)
CREATE TABLE invoice_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    fee_head_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    UNIQUE INDEX idx_invoice_item_unique (invoice_id, fee_head_id),
    FOREIGN KEY (invoice_id) REFERENCES student_invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (fee_head_id) REFERENCES fee_heads(fee_head_id) ON DELETE RESTRICT,
    INDEX idx_invoice_items_invoice (invoice_id),
    CHECK (amount > 0)
) ENGINE=InnoDB;

-- Table 22: payments
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('bKash', 'Nagad', 'Bank', 'Cash', 'Card') NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_no VARCHAR(50),
    receipt_no VARCHAR(20),
    recorded_by INT,
    UNIQUE INDEX idx_payment_receipt (receipt_no),
    FOREIGN KEY (invoice_id) REFERENCES student_invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_date (paid_at),
    CHECK (amount > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 7: HOSTEL
-- ============================================================================

-- Table 23: hostel_rooms (merged hostels + rooms)
CREATE TABLE hostel_rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type ENUM('Boys', 'Girls') NOT NULL,
    room_no VARCHAR(20) NOT NULL,
    floor INT,
    room_type ENUM('Single', 'Double', 'Triple') NOT NULL,
    capacity INT NOT NULL,
    warden_name VARCHAR(100),
    warden_phone VARCHAR(20),
    warden_email VARCHAR(255),
    UNIQUE INDEX idx_hostel_room (hostel_name, room_no),
    INDEX idx_hostel_name (hostel_name)
) ENGINE=InnoDB;

-- Table 24: room_allocations
CREATE TABLE room_allocations (
    allocation_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    bed_no INT,
    start_date DATE NOT NULL,
    end_date DATE,
    annual_fee DECIMAL(10,2),
    fee_paid BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(room_id) ON DELETE CASCADE,
    INDEX idx_allocation_student (student_id),
    INDEX idx_allocation_room (room_id)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 8: TRANSPORT
-- ============================================================================

-- Table 25: transport_routes (merged routes + vehicles)
CREATE TABLE transport_routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    start_point VARCHAR(100) NOT NULL,
    end_point VARCHAR(100) NOT NULL,
    vehicle_no VARCHAR(20),
    vehicle_capacity INT,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    stops_json JSON,
    UNIQUE INDEX idx_route_name (route_name)
) ENGINE=InnoDB;

-- Table 26: transport_subscriptions
CREATE TABLE transport_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    route_id INT NOT NULL,
    pickup_point VARCHAR(100),
    pickup_time TIME,
    semester_id INT NOT NULL,
    fee_amount DECIMAL(10,2),
    fee_paid BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(route_id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE RESTRICT,
    INDEX idx_transport_student (student_id),
    INDEX idx_transport_route (route_id)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 9: AUDIT & IMMUTABLE LEDGER
-- ============================================================================

-- Table 27: audit_logs
CREATE TABLE audit_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_user_id INT,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    table_name VARCHAR(64) NOT NULL,
    record_pk VARCHAR(100) NOT NULL,
    old_row JSON,
    new_row JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_table (table_name, record_pk),
    INDEX idx_audit_actor (actor_user_id),
    INDEX idx_audit_time (created_at)
) ENGINE=InnoDB;

-- Table 28: ledger_events (Immutable blockchain-style log)
CREATE TABLE ledger_events (
    event_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor_user_id INT,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(64),
    entity_id VARCHAR(100),
    payload JSON NOT NULL,
    prev_hash CHAR(64),
    curr_hash CHAR(64) NOT NULL,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_ledger_entity (entity_type, entity_id),
    INDEX idx_ledger_time (event_time),
    INDEX idx_ledger_hash (curr_hash)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 10: SYSTEM CONFIGURATION (Unified Admin Metadata)
-- ============================================================================

-- Table 29: system_config (backup, metrics, distributed DB, cloud)
CREATE TABLE system_config (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    config_type ENUM('backup', 'metric', 'site', 'fragment', 'replication', 'cloud', 'external', 'setting') NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSON NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_config_type_key (config_type, config_key),
    INDEX idx_config_type (config_type)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE 11: DATA WAREHOUSE (OLAP Star Schema)
-- ============================================================================

-- Table 30: fact_academic (Consolidated fact table)
CREATE TABLE fact_academic (
    fact_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fact_type ENUM('result', 'attendance', 'payment') NOT NULL,
    fact_date DATE NOT NULL,
    -- Student dimension (denormalized for OLAP)
    student_id INT NOT NULL,
    student_code VARCHAR(20),
    student_name VARCHAR(100),
    program_code VARCHAR(20),
    dept_code VARCHAR(10),
    batch_year YEAR,
    -- Semester dimension
    semester_id INT,
    semester_name VARCHAR(50),
    -- Course dimension
    course_code VARCHAR(20),
    course_title VARCHAR(100),
    credit DECIMAL(3,1),
    -- Result metrics
    grade_code CHAR(2),
    grade_point DECIMAL(3,2),
    total_mark DECIMAL(5,2),
    credit_points DECIMAL(5,2),
    -- Attendance metrics
    sessions_held INT,
    sessions_present INT,
    attendance_pct DECIMAL(5,2),
    -- Payment metrics
    invoice_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    outstanding DECIMAL(10,2),
    payment_method VARCHAR(20),
    -- ETL metadata
    etl_loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fact_type (fact_type),
    INDEX idx_fact_student (student_id),
    INDEX idx_fact_semester (semester_id),
    INDEX idx_fact_date (fact_date),
    INDEX idx_fact_dept (dept_code),
    INDEX idx_fact_batch (batch_year)
) ENGINE=InnoDB;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Delimiter change for triggers
DELIMITER //

-- Trigger 1: Audit log for results UPDATE
CREATE TRIGGER trg_results_after_update
AFTER UPDATE ON results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (actor_user_id, action, table_name, record_pk, old_row, new_row)
    VALUES (
        @current_user_id,
        'UPDATE',
        'results',
        OLD.result_id,
        JSON_OBJECT('enrollment_id', OLD.enrollment_id, 'grade_code', OLD.grade_code, 
                    'total_mark', OLD.total_mark, 'locked', OLD.locked),
        JSON_OBJECT('enrollment_id', NEW.enrollment_id, 'grade_code', NEW.grade_code, 
                    'total_mark', NEW.total_mark, 'locked', NEW.locked)
    );
END //

-- Trigger 2: Audit log for results INSERT
CREATE TRIGGER trg_results_after_insert
AFTER INSERT ON results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (actor_user_id, action, table_name, record_pk, old_row, new_row)
    VALUES (
        @current_user_id,
        'INSERT',
        'results',
        NEW.result_id,
        NULL,
        JSON_OBJECT('enrollment_id', NEW.enrollment_id, 'grade_code', NEW.grade_code, 
                    'total_mark', NEW.total_mark, 'locked', NEW.locked)
    );
END //

-- Trigger 3: Prevent locked result modification
CREATE TRIGGER trg_results_before_update
BEFORE UPDATE ON results
FOR EACH ROW
BEGIN
    IF OLD.locked = TRUE AND NEW.grade_code != OLD.grade_code THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify locked result';
    END IF;
END //

-- Trigger 4: Audit log for attendance
CREATE TRIGGER trg_attendance_after_insert
AFTER INSERT ON attendance_records
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (actor_user_id, action, table_name, record_pk, old_row, new_row)
    VALUES (
        NEW.marked_by,
        'INSERT',
        'attendance_records',
        CONCAT(NEW.session_id, '-', NEW.student_id),
        NULL,
        JSON_OBJECT('session_id', NEW.session_id, 'student_id', NEW.student_id, 'status', NEW.status)
    );
END //

-- Trigger 5: Audit log for payments
CREATE TRIGGER trg_payments_after_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (actor_user_id, action, table_name, record_pk, old_row, new_row)
    VALUES (
        NEW.recorded_by,
        'INSERT',
        'payments',
        NEW.payment_id,
        NULL,
        JSON_OBJECT('invoice_id', NEW.invoice_id, 'amount', NEW.amount, 'method', NEW.method)
    );
END //

-- Trigger 6: Auto-update invoice status after payment
CREATE TRIGGER trg_payments_after_insert_status
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE total_invoice DECIMAL(10,2);
    DECLARE total_paid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(ii.amount), 0) INTO total_invoice
    FROM invoice_items ii WHERE ii.invoice_id = NEW.invoice_id;
    
    SELECT COALESCE(SUM(p.amount), 0) INTO total_paid
    FROM payments p WHERE p.invoice_id = NEW.invoice_id;
    
    IF total_paid >= total_invoice THEN
        UPDATE student_invoices SET status = 'paid' WHERE invoice_id = NEW.invoice_id;
    ELSEIF total_paid > 0 THEN
        UPDATE student_invoices SET status = 'partial' WHERE invoice_id = NEW.invoice_id;
    END IF;
END //

-- Trigger 7: Ledger hash chain for immutable events
CREATE TRIGGER trg_ledger_before_insert
BEFORE INSERT ON ledger_events
FOR EACH ROW
BEGIN
    DECLARE last_hash CHAR(64);
    
    SELECT curr_hash INTO last_hash 
    FROM ledger_events ORDER BY event_id DESC LIMIT 1;
    
    SET NEW.prev_hash = IFNULL(last_hash, '0000000000000000000000000000000000000000000000000000000000000000');
    SET NEW.curr_hash = SHA2(
        CONCAT(NEW.event_time, IFNULL(NEW.actor_user_id, 0), NEW.event_type, 
               CAST(NEW.payload AS CHAR), NEW.prev_hash),
        256
    );
END //

-- Trigger 8: Prevent ledger updates (immutability)
CREATE TRIGGER trg_ledger_prevent_update
BEFORE UPDATE ON ledger_events
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger events are immutable and cannot be updated';
END //

-- Trigger 9: Prevent ledger deletes (immutability)
CREATE TRIGGER trg_ledger_prevent_delete
BEFORE DELETE ON ledger_events
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger events are immutable and cannot be deleted';
END //

-- Trigger 10: Validate exam marks don't exceed total
CREATE TRIGGER trg_exam_marks_before_insert
BEFORE INSERT ON exam_marks
FOR EACH ROW
BEGIN
    DECLARE exam_total DECIMAL(5,2);
    
    SELECT total_marks INTO exam_total 
    FROM exams WHERE exam_id = NEW.exam_id;
    
    IF NEW.obtained_marks > exam_total THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Obtained marks cannot exceed total marks for this exam';
    END IF;
END //

CREATE TRIGGER trg_exam_marks_before_update
BEFORE UPDATE ON exam_marks
FOR EACH ROW
BEGIN
    DECLARE exam_total DECIMAL(5,2);
    
    SELECT total_marks INTO exam_total 
    FROM exams WHERE exam_id = NEW.exam_id;
    
    IF NEW.obtained_marks > exam_total THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Obtained marks cannot exceed total marks for this exam';
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- VIEWS (Computed Metrics - No Redundant Storage)
-- ============================================================================

-- View 1: Student CGPA
CREATE VIEW vw_student_cgpa AS
SELECT 
    s.student_id,
    s.student_code,
    u.full_name,
    p.code AS program_code,
    d.code AS dept_code,
    s.batch_year,
    ROUND(SUM(c.credit * g.grade_point) / NULLIF(SUM(c.credit), 0), 2) AS cgpa,
    SUM(c.credit) AS total_credits,
    COUNT(DISTINCT r.result_id) AS courses_completed
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN programs p ON s.program_id = p.program_id
JOIN departments d ON p.dept_id = d.dept_id
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id AND r.published_at IS NOT NULL
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
GROUP BY s.student_id, s.student_code, u.full_name, p.code, d.code, s.batch_year;

-- View 2: Semester SGPA
CREATE VIEW vw_semester_sgpa AS
SELECT 
    s.student_id,
    s.student_code,
    sem.semester_id,
    sem.name AS semester_name,
    ROUND(SUM(c.credit * g.grade_point) / NULLIF(SUM(c.credit), 0), 2) AS sgpa,
    SUM(c.credit) AS semester_credits,
    COUNT(r.result_id) AS courses_taken
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN semesters sem ON co.semester_id = sem.semester_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id AND r.published_at IS NOT NULL
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
GROUP BY s.student_id, s.student_code, sem.semester_id, sem.name;

-- View 3: Attendance Summary
CREATE VIEW vw_attendance_summary AS
SELECT 
    s.student_id,
    s.student_code,
    co.offering_id,
    c.course_code,
    c.title AS course_title,
    sem.name AS semester_name,
    COUNT(cs.session_id) AS total_sessions,
    SUM(CASE WHEN ar.status = 'P' THEN 1 ELSE 0 END) AS present,
    SUM(CASE WHEN ar.status = 'A' THEN 1 ELSE 0 END) AS absent,
    SUM(CASE WHEN ar.status = 'L' THEN 1 ELSE 0 END) AS late,
    ROUND(SUM(CASE WHEN ar.status IN ('P', 'L') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(cs.session_id), 0), 2) AS attendance_pct,
    CASE 
        WHEN SUM(CASE WHEN ar.status IN ('P', 'L') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(cs.session_id), 0) >= 90 THEN 'safe'
        WHEN SUM(CASE WHEN ar.status IN ('P', 'L') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(cs.session_id), 0) >= 75 THEN 'warning'
        ELSE 'danger'
    END AS status
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN semesters sem ON co.semester_id = sem.semester_id
JOIN class_sessions cs ON co.offering_id = cs.offering_id AND cs.status = 'completed'
LEFT JOIN attendance_records ar ON cs.session_id = ar.session_id AND s.student_id = ar.student_id
GROUP BY s.student_id, s.student_code, co.offering_id, c.course_code, c.title, sem.name;

-- View 4: Student Dues
CREATE VIEW vw_student_dues AS
SELECT 
    s.student_id,
    s.student_code,
    u.full_name,
    u.email,
    u.phone,
    COALESCE(SUM(ii.amount), 0) AS total_invoiced,
    COALESCE((SELECT SUM(p.amount) FROM payments p 
              JOIN student_invoices si2 ON p.invoice_id = si2.invoice_id 
              WHERE si2.student_id = s.student_id), 0) AS total_paid,
    COALESCE(SUM(ii.amount), 0) - COALESCE((SELECT SUM(p.amount) FROM payments p 
              JOIN student_invoices si2 ON p.invoice_id = si2.invoice_id 
              WHERE si2.student_id = s.student_id), 0) AS outstanding,
    (SELECT MIN(si3.due_date) FROM student_invoices si3 
     WHERE si3.student_id = s.student_id AND si3.status IN ('pending', 'partial', 'overdue')) AS next_due_date
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN student_invoices si ON s.student_id = si.student_id
LEFT JOIN invoice_items ii ON si.invoice_id = ii.invoice_id
GROUP BY s.student_id, s.student_code, u.full_name, u.email, u.phone;

-- View 5: Live Marks (Component-wise progress)
CREATE VIEW vw_live_marks AS
SELECT 
    s.student_id,
    s.student_code,
    co.offering_id,
    c.course_code,
    c.title AS course_title,
    SUM(CASE WHEN em.is_published THEN em.obtained_marks / ex.total_marks * ex.weight_percent ELSE 0 END) AS weighted_score,
    SUM(CASE WHEN em.is_published THEN ex.weight_percent ELSE 0 END) AS published_weight,
    100 - SUM(CASE WHEN em.is_published THEN ex.weight_percent ELSE 0 END) AS pending_weight,
    COUNT(CASE WHEN em.is_published THEN 1 END) AS components_published,
    COUNT(ex.exam_id) AS total_components
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
LEFT JOIN exam_marks em ON ex.exam_id = em.exam_id AND s.student_id = em.student_id
GROUP BY s.student_id, s.student_code, co.offering_id, c.course_code, c.title;

-- View 6: Course Roster (Students in each offering)
CREATE VIEW vw_course_roster AS
SELECT 
    co.offering_id,
    c.course_code,
    c.title AS course_title,
    sem.name AS semester_name,
    co.section,
    t.full_name AS teacher_name,
    s.student_id,
    s.student_code,
    u.full_name AS student_name,
    e.status AS enrollment_status,
    e.enrolled_at
FROM course_offerings co
JOIN courses c ON co.course_id = c.course_id
JOIN semesters sem ON co.semester_id = sem.semester_id
LEFT JOIN users t ON co.teacher_id = t.user_id
JOIN enrollments e ON co.offering_id = e.offering_id
JOIN students s ON e.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure 1: Generate Invoice (ACID Transaction)
CREATE PROCEDURE sp_generate_invoice(
    IN p_student_id INT,
    IN p_semester_id INT,
    IN p_tuition DECIMAL(10,2),
    IN p_lab DECIMAL(10,2),
    IN p_library DECIMAL(10,2),
    IN p_development DECIMAL(10,2),
    IN p_exam DECIMAL(10,2),
    IN p_misc DECIMAL(10,2),
    IN p_due_days INT
)
BEGIN
    DECLARE v_invoice_id INT;
    DECLARE v_invoice_no VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Generate invoice number
    SET v_invoice_no = CONCAT('INV', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_student_id, 4, '0'));
    
    -- Create invoice header
    INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status)
    VALUES (p_student_id, p_semester_id, v_invoice_no, CURDATE(), DATE_ADD(CURDATE(), INTERVAL p_due_days DAY), 'pending');
    
    SET v_invoice_id = LAST_INSERT_ID();
    
    -- Add invoice items
    IF p_tuition > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_tuition FROM fee_heads WHERE name = 'Tuition Fee';
    END IF;
    
    IF p_lab > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_lab FROM fee_heads WHERE name = 'Lab Fee';
    END IF;
    
    IF p_library > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_library FROM fee_heads WHERE name = 'Library Fee';
    END IF;
    
    IF p_development > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_development FROM fee_heads WHERE name = 'Development Fee';
    END IF;
    
    IF p_exam > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_exam FROM fee_heads WHERE name = 'Exam Fee';
    END IF;
    
    IF p_misc > 0 THEN
        INSERT INTO invoice_items (invoice_id, fee_head_id, amount)
        SELECT v_invoice_id, fee_head_id, p_misc FROM fee_heads WHERE name = 'Miscellaneous';
    END IF;
    
    COMMIT;
    
    SELECT v_invoice_id AS invoice_id, v_invoice_no AS invoice_no;
END //

-- Procedure 2: Publish Results (ACID Transaction)
CREATE PROCEDURE sp_publish_results(
    IN p_offering_id INT,
    IN p_published_by INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update results with calculated grades
    UPDATE results r
    JOIN enrollments e ON r.enrollment_id = e.enrollment_id
    SET r.grade_code = (
        SELECT gs.grade_code FROM grade_scale gs 
        WHERE r.total_mark >= gs.min_mark AND r.total_mark <= gs.max_mark
        LIMIT 1
    ),
    r.published_at = NOW()
    WHERE e.offering_id = p_offering_id
    AND r.published_at IS NULL;
    
    -- Log to ledger
    INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
    VALUES (
        p_published_by,
        'RESULT_PUBLISHED',
        'course_offering',
        p_offering_id,
        JSON_OBJECT('offering_id', p_offering_id, 'published_at', NOW())
    );
    
    -- Update enrollment status
    UPDATE enrollments 
    SET status = 'completed' 
    WHERE offering_id = p_offering_id;
    
    COMMIT;
    
    SELECT 'Results published successfully' AS message;
END //

-- Procedure 3: Record Payment
CREATE PROCEDURE sp_record_payment(
    IN p_invoice_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_method VARCHAR(20),
    IN p_reference_no VARCHAR(50),
    IN p_recorded_by INT
)
BEGIN
    DECLARE v_receipt_no VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Generate receipt number
    SET v_receipt_no = CONCAT('RCP', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
    
    -- Record payment
    INSERT INTO payments (invoice_id, amount, method, reference_no, receipt_no, recorded_by)
    VALUES (p_invoice_id, p_amount, p_method, p_reference_no, v_receipt_no, p_recorded_by);
    
    -- Log to ledger
    INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
    VALUES (
        p_recorded_by,
        'PAYMENT_RECEIVED',
        'invoice',
        p_invoice_id,
        JSON_OBJECT('invoice_id', p_invoice_id, 'amount', p_amount, 'method', p_method, 'receipt', v_receipt_no)
    );
    
    COMMIT;
    
    SELECT v_receipt_no AS receipt_no, 'Payment recorded successfully' AS message;
END //

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'System Administrator'),
('student', 'Student User'),
('faculty', 'Faculty/Teacher'),
('accountant', 'Finance/Accounts'),
('hostel_manager', 'Hostel Administration'),
('transport_manager', 'Transport Administration');

-- Permissions
INSERT INTO permissions (perm_code, module, description) VALUES
('dashboard.view', 'dashboard', 'View dashboard'),
('students.view', 'students', 'View students'),
('students.create', 'students', 'Create students'),
('students.edit', 'students', 'Edit students'),
('students.delete', 'students', 'Delete students'),
('courses.view', 'courses', 'View courses'),
('courses.manage', 'courses', 'Manage courses'),
('results.view', 'results', 'View results'),
('results.edit', 'results', 'Edit results'),
('results.publish', 'results', 'Publish results'),
('attendance.view', 'attendance', 'View attendance'),
('attendance.mark', 'attendance', 'Mark attendance'),
('finance.view', 'finance', 'View finance'),
('finance.invoice', 'finance', 'Create invoices'),
('finance.payment', 'finance', 'Record payments'),
('hostel.view', 'hostel', 'View hostel'),
('hostel.manage', 'hostel', 'Manage hostel'),
('transport.view', 'transport', 'View transport'),
('transport.manage', 'transport', 'Manage transport'),
('reports.view', 'reports', 'View reports'),
('audit.view', 'audit', 'View audit logs'),
('users.manage', 'users', 'Manage users');

-- Role-Permissions (Admin gets all)
INSERT INTO role_permissions (role_id, perm_id)
SELECT 1, perm_id FROM permissions;

-- Student permissions
INSERT INTO role_permissions (role_id, perm_id)
SELECT 2, perm_id FROM permissions WHERE perm_code IN 
('dashboard.view', 'results.view', 'attendance.view', 'finance.view', 'hostel.view', 'transport.view');

-- Faculty permissions
INSERT INTO role_permissions (role_id, perm_id)
SELECT 3, perm_id FROM permissions WHERE perm_code IN 
('dashboard.view', 'students.view', 'courses.view', 'results.view', 'results.edit', 'attendance.view', 'attendance.mark');

-- Accountant permissions
INSERT INTO role_permissions (role_id, perm_id)
SELECT 4, perm_id FROM permissions WHERE perm_code IN 
('dashboard.view', 'students.view', 'finance.view', 'finance.invoice', 'finance.payment', 'reports.view');

-- Grade Scale (Bangladesh 4.0)
INSERT INTO grade_scale (grade_code, grade_point, min_mark, max_mark, remark, is_pass) VALUES
('A+', 4.00, 80, 100, 'Outstanding', TRUE),
('A', 3.75, 75, 79, 'Excellent', TRUE),
('A-', 3.50, 70, 74, 'Very Good', TRUE),
('B+', 3.25, 65, 69, 'Good', TRUE),
('B', 3.00, 60, 64, 'Satisfactory', TRUE),
('B-', 2.75, 55, 59, 'Above Average', TRUE),
('C+', 2.50, 50, 54, 'Average', TRUE),
('C', 2.25, 45, 49, 'Below Average', TRUE),
('D', 2.00, 40, 44, 'Pass', TRUE),
('F', 0.00, 0, 39, 'Fail', FALSE);

-- Fee Heads
INSERT INTO fee_heads (name, description) VALUES
('Tuition Fee', 'Semester tuition charges'),
('Lab Fee', 'Laboratory usage charges'),
('Library Fee', 'Library and digital resources'),
('Development Fee', 'Campus development fund'),
('Exam Fee', 'Examination charges'),
('Miscellaneous', 'Other charges');

-- Departments
INSERT INTO departments (code, name, faculty) VALUES
('CSE', 'Computer Science & Engineering', 'Faculty of Science & Information Technology'),
('EEE', 'Electrical & Electronic Engineering', 'Faculty of Engineering'),
('BBA', 'Business Administration', 'Faculty of Business & Economics'),
('ENG', 'English', 'Faculty of Humanities'),
('MAT', 'Mathematics', 'Faculty of Science & Information Technology'),
('PHY', 'Physics', 'Faculty of Science & Information Technology');

-- Programs
INSERT INTO programs (dept_id, code, name, total_credits, duration_years) VALUES
(1, 'BSC-CSE', 'B.Sc. in Computer Science & Engineering', 148, 4),
(1, 'MSC-CSE', 'M.Sc. in Computer Science & Engineering', 36, 2),
(2, 'BSC-EEE', 'B.Sc. in Electrical & Electronic Engineering', 160, 4),
(3, 'BBA', 'Bachelor of Business Administration', 130, 4),
(3, 'MBA', 'Master of Business Administration', 60, 2);

-- Semesters
INSERT INTO semesters (name, start_date, end_date, status) VALUES
('Spring 2021', '2021-01-15', '2021-05-15', 'completed'),
('Summer 2021', '2021-05-20', '2021-09-20', 'completed'),
('Fall 2021', '2021-09-25', '2022-01-25', 'completed'),
('Spring 2022', '2022-01-30', '2022-05-30', 'completed'),
('Summer 2022', '2022-06-01', '2022-10-01', 'completed'),
('Fall 2022', '2022-10-05', '2023-02-05', 'completed'),
('Spring 2026', '2026-01-15', '2026-05-15', 'active');

-- Sample Users (Admin and Faculty)
INSERT INTO users (email, password_hash, full_name, phone, status) VALUES
('admin@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'System Administrator', '+8801700000001', 'active'),
('dr.akter@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Syed Akter Hossain', '+8801711111111', 'active'),
('dr.rahman@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Md. Mahfuzur Rahman', '+8801722222222', 'active'),
('prof.bhuiyan@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Prof. Touhid Bhuiyan', '+8801733333333', 'active'),
('dr.noori@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Sheak Rashed Haider Noori', '+8801744444444', 'active'),
('dr.mahmud@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Imran Mahmud', '+8801755555555', 'active'),
('accountant@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Finance Officer', '+8801766666666', 'active');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin
(2, 3), -- Faculty
(3, 3), -- Faculty
(4, 3), -- Faculty
(5, 3), -- Faculty
(6, 3), -- Faculty
(7, 4); -- Accountant

-- Sample Student User
INSERT INTO users (email, password_hash, full_name, phone, status) VALUES
('iftekhar.hossain@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Md. Iftekhar Hossain', '+880 1712-345678', 'active');

-- Assign student role
INSERT INTO user_roles (user_id, role_id) VALUES (8, 2);

-- Create student record
INSERT INTO students (user_id, student_code, program_id, batch_year, section, enrollment_date, advisor_id) VALUES
(8, 'CSE2021001', 1, 2021, 'A', '2021-01-15', 2);

-- Courses
INSERT INTO courses (dept_id, course_code, title, credit, category) VALUES
-- Semester 1
(1, 'CSE101', 'Introduction to Computer Science', 3, 'Major'),
(1, 'CSE102', 'Structured Programming', 3, 'Major'),
(5, 'MAT101', 'Differential Calculus', 3, 'Major'),
(6, 'PHY101', 'Physics I', 3, 'Major'),
(2, 'EEE101', 'Basic Electrical Engineering', 3, 'Major'),
(4, 'ENG101', 'English I', 3, 'Major'),
(4, 'BAN101', 'Bangla', 3, 'Minor'),
(4, 'GED101', 'Bangladesh Studies', 3, 'Minor'),
-- Semester 2
(1, 'CSE201', 'Data Structures', 3, 'Major'),
(1, 'CSE202', 'Object Oriented Programming', 3, 'Major'),
(5, 'MAT201', 'Integral Calculus', 3, 'Major'),
(6, 'PHY201', 'Physics II', 3, 'Major'),
(2, 'EEE201', 'Electronic Devices', 3, 'Major'),
(4, 'ENG201', 'English II', 3, 'Major'),
-- Semester 3
(1, 'CSE301', 'Database Management Systems', 3, 'Major'),
(1, 'CSE302', 'Algorithms', 3, 'Major'),
(1, 'CSE303', 'Computer Architecture', 3, 'Major'),
(1, 'CSE304', 'Discrete Mathematics', 3, 'Major'),
(1, 'CSE305', 'Software Engineering', 3, 'Major'),
(5, 'MAT301', 'Linear Algebra', 3, 'Major'),
-- Semester 4
(1, 'CSE401', 'Operating Systems', 3, 'Major'),
(1, 'CSE402', 'Computer Networks', 3, 'Major'),
(1, 'CSE403', 'Theory of Computation', 3, 'Major'),
(1, 'CSE404', 'Numerical Methods', 3, 'Major'),
(1, 'CSE405', 'Web Technologies', 3, 'Major'),
-- Current Semester
(1, 'CSE701', 'Artificial Intelligence', 3, 'Major'),
(1, 'CSE702', 'Software Architecture', 3, 'Major'),
(1, 'CSE703', 'Internet of Things', 3, 'Major'),
(1, 'CSE704', 'Blockchain Technology', 3, 'Major'),
(1, 'CSE705', 'Project II', 3, 'Major'),
(3, 'MGT701', 'Business Communication', 3, 'Minor');

-- Course Offerings for current semester (Spring 2026 = semester_id 7)
INSERT INTO course_offerings (course_id, semester_id, teacher_id, section) VALUES
(26, 7, 3, 'A'), -- CSE701 - AI - Dr. Rahman
(27, 7, 4, 'A'), -- CSE702 - Software Architecture - Prof. Bhuiyan
(28, 7, 5, 'A'), -- CSE703 - IoT - Dr. Noori
(29, 7, 6, 'A'), -- CSE704 - Blockchain - Dr. Mahmud
(30, 7, 2, 'A'), -- CSE705 - Project II - Dr. Akter
(31, 7, 4, 'A'); -- MGT701 - Business Comm

-- Enrollments for current semester
INSERT INTO enrollments (student_id, offering_id, status) VALUES
(1, 1, 'active'),
(1, 2, 'active'),
(1, 3, 'active'),
(1, 4, 'active'),
(1, 5, 'active'),
(1, 6, 'active');

-- Exams for current semester
INSERT INTO exams (offering_id, exam_type, name, total_marks, weight_percent, exam_date) VALUES
-- CSE701
(1, 'Quiz', 'Quiz 1', 10, 5, '2026-02-01'),
(1, 'Quiz', 'Quiz 2', 10, 5, '2026-02-15'),
(1, 'Quiz', 'Quiz 3', 10, 5, NULL),
(1, 'Assignment', 'Assignment 1', 20, 10, '2026-02-10'),
(1, 'Assignment', 'Assignment 2', 20, 10, NULL),
(1, 'Midterm', 'Midterm Exam', 40, 25, '2026-02-20'),
(1, 'Presentation', 'Presentation', 10, 10, NULL),
(1, 'Lab', 'Attendance', 10, 5, '2026-02-25'),
(1, 'Final', 'Final Exam', 50, 25, '2026-04-15'),
-- CSE702
(2, 'Quiz', 'Quiz 1', 10, 5, '2026-02-03'),
(2, 'Quiz', 'Quiz 2', 10, 5, '2026-02-17'),
(2, 'Assignment', 'Assignment 1', 20, 10, '2026-02-08'),
(2, 'Midterm', 'Midterm Exam', 40, 25, '2026-02-22'),
(2, 'Lab', 'Attendance', 10, 5, '2026-02-25'),
(2, 'Final', 'Final Exam', 50, 25, '2026-04-17');

-- Exam Marks (some published)
INSERT INTO exam_marks (exam_id, student_id, obtained_marks, is_published, published_at) VALUES
(1, 1, 8, TRUE, '2026-02-01'),
(2, 1, 9, TRUE, '2026-02-15'),
(4, 1, 18, TRUE, '2026-02-10'),
(6, 1, 35, TRUE, '2026-02-20'),
(8, 1, 9, TRUE, '2026-02-25'),
(10, 1, 7, TRUE, '2026-02-03'),
(11, 1, 8, TRUE, '2026-02-17'),
(12, 1, 17, TRUE, '2026-02-08'),
(13, 1, 32, TRUE, '2026-02-22'),
(14, 1, 8, TRUE, '2026-02-25');

-- Class Sessions for current semester
INSERT INTO class_sessions (offering_id, session_date, day_of_week, start_time, end_time, room, session_type, status) VALUES
-- CSE701 sessions
(1, '2026-01-18', 'Sat', '09:00:00', '10:30:00', 'PC Lab-5', 'lecture', 'completed'),
(1, '2026-01-21', 'Tue', '09:00:00', '10:30:00', 'Room 501', 'lecture', 'completed'),
(1, '2026-01-19', 'Sun', '15:00:00', '17:00:00', 'AI Lab', 'lab', 'completed'),
(1, '2026-01-25', 'Sat', '09:00:00', '10:30:00', 'PC Lab-5', 'lecture', 'completed'),
(1, '2026-01-28', 'Tue', '09:00:00', '10:30:00', 'Room 501', 'lecture', 'completed'),
(1, '2026-02-01', 'Sat', '09:00:00', '10:30:00', 'PC Lab-5', 'lecture', 'completed'),
-- CSE702 sessions
(2, '2026-01-18', 'Sat', '11:00:00', '12:30:00', 'Room 401', 'lecture', 'completed'),
(2, '2026-01-20', 'Mon', '09:00:00', '10:30:00', 'Room 401', 'lecture', 'completed'),
(2, '2026-01-22', 'Wed', '11:00:00', '12:30:00', 'Room 401', 'lecture', 'completed');

-- Attendance Records
INSERT INTO attendance_records (session_id, student_id, status, marked_by) VALUES
(1, 1, 'P', 3),
(2, 1, 'P', 3),
(3, 1, 'P', 3),
(4, 1, 'A', 3),
(5, 1, 'P', 3),
(6, 1, 'P', 3),
(7, 1, 'P', 4),
(8, 1, 'P', 4),
(9, 1, 'A', 4);

-- Sample Invoice
INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status) VALUES
(1, 7, 'INV202601150001', '2026-01-01', '2026-04-01', 'partial');

-- Invoice Items
INSERT INTO invoice_items (invoice_id, fee_head_id, amount) VALUES
(1, 1, 55000),  -- Tuition
(1, 2, 8000),   -- Lab
(1, 3, 3000),   -- Library
(1, 4, 5000),   -- Development
(1, 5, 7000),   -- Exam
(1, 6, 7000);   -- Misc

-- Payments
INSERT INTO payments (invoice_id, amount, method, reference_no, receipt_no, recorded_by) VALUES
(1, 60000, 'bKash', 'BKP2026001', 'RCP2026010115', 7);

-- Hostel Room
INSERT INTO hostel_rooms (hostel_name, hostel_type, room_no, floor, room_type, capacity, warden_name, warden_phone, warden_email) VALUES
('Daffodil Tower - Block A', 'Boys', 'A-304', 3, 'Triple', 3, 'Mr. Abdul Karim', '+880 1812-345678', 'warden.blocka@diu.edu.bd');

-- Room Allocation
INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status) VALUES
(1, 1, 2, '2026-01-15', '2026-12-31', 48000, TRUE, 'active');

-- Transport Route
INSERT INTO transport_routes (route_name, start_point, end_point, vehicle_no, vehicle_capacity, driver_name, driver_phone, stops_json) VALUES
('Route 12 - Dhanmondi Express', 'Dhanmondi 27', 'DIU Campus', 'Dhaka Metro BA-11-1234', 50, 'Mohammad Rahim', '+880 1912-345678',
 '[{"name": "Dhanmondi 27", "time": "07:30"}, {"name": "Science Lab", "time": "07:45"}, {"name": "Farmgate", "time": "08:00"}, {"name": "Bijoy Sarani", "time": "08:15"}, {"name": "DIU Campus", "time": "08:45"}]');

-- Transport Subscription
INSERT INTO transport_subscriptions (student_id, route_id, pickup_point, pickup_time, semester_id, fee_amount, fee_paid, status) VALUES
(1, 1, 'Dhanmondi 27', '07:30:00', 7, 6000, TRUE, 'active');

-- System Configuration samples
INSERT INTO system_config (config_type, config_key, config_value, status) VALUES
('setting', 'university_name', '"Daffodil International University"', 'active'),
('setting', 'currency', '{"code": "BDT", "symbol": "৳"}', 'active'),
('setting', 'grading_scale', '"Bangladesh 4.0 Scale"', 'active'),
('backup', 'last_full_backup', '{"type": "full", "date": "2026-03-03", "file": "/backup/full_20260303.sql", "size_mb": 250, "status": "completed"}', 'active'),
('metric', 'active_students', '{"value": 1, "captured_at": "2026-03-03"}', 'active'),
('site', 'primary_dhaka', '{"host": "db1.diu.edu.bd", "port": 3306, "role": "primary", "location": "Dhaka"}', 'active'),
('fragment', 'students_horizontal', '{"table": "students", "type": "horizontal", "rule": "batch_year >= 2024", "site": "primary_dhaka"}', 'active'),
('cloud', 'aws_backup', '{"provider": "AWS_S3", "bucket": "diu-db-backups", "region": "ap-south-1"}', 'active'),
('external', 'student_api', '{"source_type": "API", "url": "https://api.diu.edu.bd/students", "sync_schedule": "0 0 * * *"}', 'active');

-- Initial ledger event (genesis block)
INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
VALUES (1, 'SYSTEM_INIT', 'system', 'genesis', '{"message": "Student Portal Database Initialized", "version": "1.0"}');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check table count
SELECT COUNT(*) AS total_tables FROM information_schema.tables 
WHERE table_schema = 'student_portal' AND table_type = 'BASE TABLE';

-- Check view count
SELECT COUNT(*) AS total_views FROM information_schema.views 
WHERE table_schema = 'student_portal';

-- Check trigger count
SELECT COUNT(*) AS total_triggers FROM information_schema.triggers 
WHERE trigger_schema = 'student_portal';

-- Test CGPA view
-- SELECT * FROM vw_student_cgpa;

-- Test Attendance view
-- SELECT * FROM vw_attendance_summary;

-- Test Dues view
-- SELECT * FROM vw_student_dues;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
