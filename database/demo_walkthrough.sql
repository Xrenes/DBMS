-- ============================================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM — SEQUENTIAL DEMONSTRATION
-- ============================================================================
-- Course  : Database Management Systems Lab
-- Group   : 1 — University Academic Management System (Education ERP)
-- Domain  : Daffodil International University, Department of CSE
-- Marks   : 40
-- ============================================================================
-- HOW TO USE:
--   Run each section ONE BY ONE in MySQL Workbench.
--   Take screenshots of each output for the report.
--   Sections are labeled STEP 1, STEP 2, ... matching the Guidelines.
-- ============================================================================

USE student_portal;

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 1 — VERIFY DATABASE SETUP (Component B: System Design - EP1)       ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 1a. Show total tables (should be 30+)
SELECT 'STEP 1a: Total Tables' AS demo_step;
SELECT COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'student_portal' AND table_type = 'BASE TABLE';

-- 1b. Show total views
SELECT 'STEP 1b: Total Views' AS demo_step;
SELECT COUNT(*) AS total_views
FROM information_schema.views
WHERE table_schema = 'student_portal';

-- 1c. Show total triggers
SELECT 'STEP 1c: Total Triggers' AS demo_step;
SELECT COUNT(*) AS total_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'student_portal';

-- 1d. Show total stored procedures
SELECT 'STEP 1d: Total Stored Procedures' AS demo_step;
SELECT COUNT(*) AS total_procedures
FROM information_schema.routines
WHERE routine_schema = 'student_portal' AND routine_type = 'PROCEDURE';

-- 1e. List all tables by module
SELECT 'STEP 1e: All Tables by Module' AS demo_step;
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
FROM information_schema.tables
WHERE table_schema = 'student_portal' AND table_type = 'BASE TABLE'
ORDER BY TABLE_NAME;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 2 — 3NF NORMALIZATION PROOF (Component B: System Design - EP1)     ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 2a. Show table structures with PRIMARY KEY, FOREIGN KEY, CHECK constraints
SELECT 'STEP 2a: Constraints per Table' AS demo_step;
SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'student_portal'
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

-- 2b. Show FOREIGN KEY relationships (referential integrity)
SELECT 'STEP 2b: Foreign Key Relationships' AS demo_step;
SELECT
    CONCAT(kcu.TABLE_NAME, '.', kcu.COLUMN_NAME) AS `child_column`,
    CONCAT(kcu.REFERENCED_TABLE_NAME, '.', kcu.REFERENCED_COLUMN_NAME) AS `parent_column`,
    rc.UPDATE_RULE,
    rc.DELETE_RULE
FROM information_schema.KEY_COLUMN_USAGE kcu
JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
    AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
WHERE kcu.TABLE_SCHEMA = 'student_portal'
    AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY kcu.TABLE_NAME;

-- 2c. Show CHECK constraints (data validation)
SELECT 'STEP 2c: CHECK Constraints' AS demo_step;
SELECT TABLE_NAME, CONSTRAINT_NAME, CHECK_CLAUSE
FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'student_portal'
ORDER BY TABLE_NAME;

-- 2d. Show indexes (performance optimization)
SELECT 'STEP 2d: Unique & Composite Indexes' AS demo_step;
SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns, NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'student_portal'
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 3 — DATA VERIFICATION: 20+ rows per table (Component C - EP1,EP2) ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

SELECT 'STEP 3: Row Counts per Table' AS demo_step;
SELECT TABLE_NAME, TABLE_ROWS AS approximate_row_count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'student_portal' AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_ROWS DESC;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 4 — RBAC: Role-Based Access Control (Component D - EP3)            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 4a. Roles defined in the system
SELECT 'STEP 4a: System Roles' AS demo_step;
SELECT * FROM roles;

-- 4b. Permissions per role
SELECT 'STEP 4b: Role-Permission Matrix' AS demo_step;
SELECT r.role_name, GROUP_CONCAT(p.perm_code ORDER BY p.module SEPARATOR ', ') AS permissions
FROM roles r
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.perm_id = p.perm_id
GROUP BY r.role_name;

-- 4c. Users and their assigned roles
SELECT 'STEP 4c: User-Role Assignments' AS demo_step;
SELECT u.user_id, u.full_name, u.email, r.role_name, u.status
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
ORDER BY r.role_name, u.full_name;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 5 — BASIC SELECT + WHERE + ORDER BY (Component C - EP1)            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Q1: Active students with their program and department
SELECT 'QUERY 1: INNER JOIN + WHERE + ORDER BY' AS query_type;
SELECT s.student_code, u.full_name, u.email,
       p.name AS program, d.name AS department,
       s.batch_year, s.section
FROM students s
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN programs p ON s.program_id = p.program_id
INNER JOIN departments d ON p.dept_id = d.dept_id
WHERE s.status = 'active'
ORDER BY d.name, s.student_code;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 6 — GROUP BY + HAVING + Aggregates (Component C - EP1)             ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Q2: Programs with student count (HAVING filters)
SELECT 'QUERY 2: LEFT JOIN + GROUP BY + HAVING' AS query_type;
SELECT p.name AS program_name, d.name AS department,
       COUNT(s.student_id) AS student_count
FROM programs p
LEFT JOIN students s ON p.program_id = s.program_id
LEFT JOIN departments d ON p.dept_id = d.dept_id
GROUP BY p.program_id, p.name, d.name
HAVING COUNT(s.student_id) >= 1
ORDER BY student_count DESC;

-- Q3: Course-wise exam average marks
SELECT 'QUERY 3: GROUP BY + HAVING + AVG/MIN/MAX' AS query_type;
SELECT c.course_code, c.title,
       ROUND(AVG(em.obtained_marks), 2) AS avg_marks,
       MIN(em.obtained_marks) AS min_marks,
       MAX(em.obtained_marks) AS max_marks,
       COUNT(em.exam_id) AS total_entries
FROM exam_marks em
JOIN exams ex ON em.exam_id = ex.exam_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
GROUP BY c.course_code, c.title
ORDER BY avg_marks DESC;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 7 — JOINS: INNER, LEFT, RIGHT (Component C - EP1, EP2)            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Q4: INNER JOIN on 5+ tables — Complete result sheet
SELECT 'QUERY 4: INNER JOIN on 5+ tables (Result Sheet)' AS query_type;
SELECT s.student_code, u.full_name,
       sem.name AS semester, c.course_code, c.title, c.credit,
       r.total_mark, r.grade_code, g.grade_point,
       ROUND(c.credit * g.grade_point, 2) AS quality_points
FROM results r
INNER JOIN enrollments e ON r.enrollment_id = e.enrollment_id
INNER JOIN students s ON e.student_id = s.student_id
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN course_offerings co ON e.offering_id = co.offering_id
INNER JOIN courses c ON co.course_id = c.course_id
INNER JOIN semesters sem ON co.semester_id = sem.semester_id
INNER JOIN grade_scale g ON r.grade_code = g.grade_code
ORDER BY s.student_code, sem.name;

-- Q5: LEFT JOIN — Students with no evaluation yet
SELECT 'QUERY 5: LEFT JOIN + IS NULL (gap detection)' AS query_type;
SELECT s.student_code, u.full_name, 'No evaluation submitted' AS status
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN evaluation_responses er ON s.user_id = er.student_id
WHERE er.response_id IS NULL
ORDER BY s.student_code;

-- Q6: RIGHT JOIN — All semesters including empty ones
SELECT 'QUERY 6: RIGHT JOIN (all semesters)' AS query_type;
SELECT sem.name AS semester, sem.status,
       COUNT(co.offering_id) AS course_offerings
FROM course_offerings co
RIGHT JOIN semesters sem ON co.semester_id = sem.semester_id
GROUP BY sem.semester_id, sem.name, sem.status
ORDER BY sem.start_date;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 8 — NESTED QUERIES & SUBQUERIES (Component C - EP1, EP2)          ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Q7: WHERE ... IN subquery — Students with grade A/A+
SELECT 'QUERY 7: Nested Subquery (WHERE ... IN)' AS query_type;
SELECT s.student_code, u.full_name
FROM students s
JOIN users u ON s.user_id = u.user_id
WHERE s.student_id IN (
    SELECT e.student_id
    FROM enrollments e
    JOIN results r ON e.enrollment_id = r.enrollment_id
    WHERE r.grade_code IN ('A+', 'A')
);

-- Q8: Correlated subquery — Each student's enrollment count
SELECT 'QUERY 8: Correlated Subquery' AS query_type;
SELECT s.student_code, u.full_name,
    (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.student_id) AS total_enrollments,
    (SELECT e2.status FROM enrollments e2
     WHERE e2.student_id = s.student_id ORDER BY e2.enrollment_id DESC LIMIT 1) AS latest_status
FROM students s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.student_code;

-- Q9: Derived table (subquery in FROM) — CGPA calculation
SELECT 'QUERY 9: Derived Table + CGPA Calculation' AS query_type;
SELECT sub.student_code, sub.full_name,
       ROUND(SUM(sub.quality_points) / SUM(sub.credit), 2) AS cgpa,
       SUM(sub.credit) AS total_credits_earned
FROM (
    SELECT s.student_code, u.full_name,
           c.credit,
           c.credit * g.grade_point AS quality_points
    FROM results r
    JOIN enrollments e ON r.enrollment_id = e.enrollment_id
    JOIN students s ON e.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN grade_scale g ON r.grade_code = g.grade_code
) sub
GROUP BY sub.student_code, sub.full_name
ORDER BY cgpa DESC;

-- Q10: EXISTS subquery — Departments with active faculty
SELECT 'QUERY 10: EXISTS Subquery' AS query_type;
SELECT d.dept_id, d.name AS department_name
FROM departments d
WHERE EXISTS (
    SELECT 1 FROM faculty_profiles fp
    WHERE fp.dept_id = d.dept_id
);

-- Q11: Scalar subquery in SELECT — Student finance summary
SELECT 'QUERY 11: Scalar Subquery (Finance Summary)' AS query_type;
SELECT s.student_code, u.full_name,
    (SELECT COALESCE(SUM(ii.amount), 0) FROM student_invoices si
     JOIN invoice_items ii ON si.invoice_id = ii.invoice_id
     WHERE si.student_id = s.student_id) AS total_billed,
    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
     JOIN student_invoices si ON p.invoice_id = si.invoice_id
     WHERE si.student_id = s.student_id) AS total_paid,
    (SELECT COALESCE(SUM(ii.amount), 0) FROM student_invoices si
     JOIN invoice_items ii ON si.invoice_id = ii.invoice_id
     WHERE si.student_id = s.student_id) -
    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
     JOIN student_invoices si ON p.invoice_id = si.invoice_id
     WHERE si.student_id = s.student_id) AS outstanding_balance
FROM students s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.student_code;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 9 — VIEWS (Component C - EP1)                                     ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 9a. List all views
SELECT 'STEP 9a: All Views in Database' AS demo_step;
SELECT TABLE_NAME AS view_name
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'student_portal'
ORDER BY TABLE_NAME;

-- 9b. Query: Student CGPA view
SELECT 'VIEW 1: vw_student_cgpa' AS view_name;
SELECT * FROM vw_student_cgpa;

-- 9c. Query: Semester SGPA view
SELECT 'VIEW 2: vw_semester_sgpa' AS view_name;
SELECT * FROM vw_semester_sgpa;

-- 9d. Query: Attendance summary view
SELECT 'VIEW 3: vw_attendance_summary' AS view_name;
SELECT * FROM vw_attendance_summary;

-- 9e. Query: Student dues view
SELECT 'VIEW 4: vw_student_dues' AS view_name;
SELECT * FROM vw_student_dues;

-- 9f. Query: Live marks view
SELECT 'VIEW 5: vw_live_marks' AS view_name;
SELECT * FROM vw_live_marks;

-- 9g. Query: Course roster view
SELECT 'VIEW 6: vw_course_roster' AS view_name;
SELECT * FROM vw_course_roster LIMIT 20;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 10 — TRIGGERS (Component D: Complex Functions - EP3)               ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 10a. List all triggers
SELECT 'STEP 10a: All Triggers' AS demo_step;
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'student_portal'
ORDER BY EVENT_OBJECT_TABLE;

-- 10b. DEMO: Result audit trigger
-- Before: check audit count
SELECT 'TRIGGER DEMO: Before Insert' AS demo_step;
SELECT COUNT(*) AS audit_count_before FROM audit_logs WHERE table_name = 'results';

-- Insert a test result (triggers fire)
INSERT INTO results (enrollment_id, total_mark, grade_code)
VALUES (1, 85, 'A+');

-- After: new audit log appears
SELECT 'TRIGGER DEMO: After Insert — Audit Log Created' AS demo_step;
SELECT * FROM audit_logs WHERE table_name = 'results' ORDER BY created_at DESC LIMIT 1;

-- Cleanup
DELETE FROM results WHERE enrollment_id = 1 AND total_mark = 85 AND grade_code = 'A+' LIMIT 1;

-- 10c. DEMO: Locked result protection trigger
SELECT 'TRIGGER DEMO: Locked Result Protection' AS demo_step;
-- If a result is locked=TRUE, the trigger prevents grade modification
-- (This would give error: "Cannot modify locked result")

-- 10d. DEMO: Exam marks validation trigger
SELECT 'TRIGGER DEMO: Exam Marks Validation' AS demo_step;
-- Attempting to insert marks > total_marks triggers error:
-- INSERT INTO exam_marks (exam_id, student_id, obtained_marks) VALUES (1, 1, 999);
-- ERROR: "Obtained marks cannot exceed total marks for this exam"

-- 10e. DEMO: Payment auto-updates invoice status
SELECT 'TRIGGER DEMO: Payment → Invoice Status Update' AS demo_step;
SELECT invoice_id, status AS status_before FROM student_invoices WHERE invoice_id = 1;

-- Make a payment that covers remaining balance
INSERT INTO payments (invoice_id, amount, method, reference_no, receipt_no, recorded_by)
VALUES (1, 25000, 'bKash', 'BKP2026002', 'RCP2026DEMO01', 7);

SELECT invoice_id, status AS status_after FROM student_invoices WHERE invoice_id = 1;

-- Cleanup
DELETE FROM payments WHERE receipt_no = 'RCP2026DEMO01';
UPDATE student_invoices SET status = 'partial' WHERE invoice_id = 1;

-- 10f. DEMO: Immutable ledger (cannot update/delete)
SELECT 'TRIGGER DEMO: Immutable Ledger' AS demo_step;
SELECT event_id, event_type, entity_type, LEFT(curr_hash, 16) AS hash_prefix
FROM ledger_events ORDER BY event_id LIMIT 5;
-- UPDATE ledger_events SET event_type = 'HACK' WHERE event_id = 1;
-- ERROR: "Ledger events are immutable and cannot be updated"


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 11 — TRANSACTIONS (Component D - EP3)                             ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- DEMO: Atomic section transfer with ROLLBACK
SELECT 'TRANSACTION DEMO: Atomic Operation + ROLLBACK' AS demo_step;

-- Before state
SELECT student_id, student_code, section AS section_before FROM students WHERE student_id = 1;

START TRANSACTION;
    UPDATE students SET section = 'D' WHERE student_id = 1;
    -- Verify change WITHIN transaction
    SELECT student_id, section AS section_during_txn FROM students WHERE student_id = 1;
ROLLBACK;

-- After ROLLBACK — original state restored
SELECT student_id, section AS section_after_rollback FROM students WHERE student_id = 1;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 12 — STORED PROCEDURES (Component D - EP3)                        ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- 12a. List stored procedures
SELECT 'STEP 12a: Stored Procedures' AS demo_step;
SELECT ROUTINE_NAME, ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'student_portal' AND ROUTINE_TYPE = 'PROCEDURE';

-- 12b. DEMO: sp_generate_invoice (creates invoice with items in one ACID transaction)
SELECT 'STORED PROCEDURE DEMO: sp_generate_invoice' AS demo_step;
-- CALL sp_generate_invoice(1, 7, 55000, 8000, 3000, 5000, 7000, 7000, 30);
-- This atomically: creates invoice header + all line items + sets due date

-- 12c. DEMO: sp_publish_results (publishes grades + logs to ledger)
SELECT 'STORED PROCEDURE DEMO: sp_publish_results' AS demo_step;
-- Shows how results are published via procedure:
-- Updates grade_code from total_mark
-- Creates immutable ledger entry
-- Marks enrollments as completed

-- 12d. DEMO: sp_record_payment (records payment + auto-receipt)
SELECT 'STORED PROCEDURE DEMO: sp_record_payment' AS demo_step;
-- CALL sp_record_payment(1, 5000, 'bKash', 'TEST_REF', 7);
-- Atomically: inserts payment + generates receipt + logs to ledger


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 13 — UNION (Component C - bonus SQL types)                        ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

SELECT 'QUERY 12: UNION — Combined Events' AS query_type;
SELECT 'Unpaid Invoice' AS event_type,
       si.invoice_no AS reference,
       u.full_name AS person,
       si.due_date AS event_date
FROM student_invoices si
JOIN students s ON si.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
WHERE si.status IN ('pending', 'partial', 'overdue')
UNION
SELECT 'Leave Request' AS event_type,
       CONCAT('LEAVE-', flr.leave_id) AS reference,
       u.full_name AS person,
       flr.start_date AS event_date
FROM faculty_leave_requests flr
JOIN users u ON flr.faculty_user_id = u.user_id
WHERE flr.status = 'pending'
ORDER BY event_date;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 14 — INVESTIGATION & ANALYSIS (Component D - EP4)                 ║
-- ╚════════════════════════════════════════════════════════════════════════════╝
-- These queries answer investigative questions using GROUP BY, HAVING,
-- AVG, COUNT to explore patterns, frequencies, and trends.

-- Investigation 1: Which courses have the highest exam performance?
SELECT 'INVESTIGATION 1: Course Performance Ranking' AS analysis;
SELECT c.course_code, c.title,
       COUNT(DISTINCT em.student_id) AS students_evaluated,
       ROUND(AVG(em.obtained_marks), 2) AS avg_marks,
       ROUND(AVG(em.obtained_marks) * 100.0 / ex.total_marks, 2) AS avg_percentage,
       CASE
           WHEN AVG(em.obtained_marks) * 100.0 / ex.total_marks >= 80 THEN 'Excellent'
           WHEN AVG(em.obtained_marks) * 100.0 / ex.total_marks >= 60 THEN 'Good'
           ELSE 'Needs Improvement'
       END AS performance_category
FROM exam_marks em
JOIN exams ex ON em.exam_id = ex.exam_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
GROUP BY c.course_code, c.title, ex.total_marks
HAVING COUNT(DISTINCT em.student_id) >= 1
ORDER BY avg_percentage DESC;

-- Investigation 2: Attendance pattern analysis — which days have lowest attendance?
SELECT 'INVESTIGATION 2: Attendance by Day of Week' AS analysis;
SELECT cs.day_of_week,
       COUNT(ar.session_id) AS total_records,
       SUM(CASE WHEN ar.status = 'P' THEN 1 ELSE 0 END) AS present,
       SUM(CASE WHEN ar.status = 'A' THEN 1 ELSE 0 END) AS absent,
       ROUND(SUM(CASE WHEN ar.status = 'P' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS attendance_rate
FROM class_sessions cs
JOIN attendance_records ar ON cs.session_id = ar.session_id
GROUP BY cs.day_of_week
ORDER BY attendance_rate DESC;

-- Investigation 3: Financial analysis — revenue vs. outstanding by semester
SELECT 'INVESTIGATION 3: Financial Summary per Semester' AS analysis;
SELECT sem.name AS semester,
       COUNT(DISTINCT si.student_id) AS students_billed,
       ROUND(SUM(ii.amount), 2) AS total_billed,
       ROUND(COALESCE(SUM(pay_agg.paid), 0), 2) AS total_collected,
       ROUND(SUM(ii.amount) - COALESCE(SUM(pay_agg.paid), 0), 2) AS outstanding
FROM student_invoices si
JOIN semesters sem ON si.semester_id = sem.semester_id
JOIN invoice_items ii ON si.invoice_id = ii.invoice_id
LEFT JOIN (
    SELECT p.invoice_id, SUM(p.amount) AS paid
    FROM payments p GROUP BY p.invoice_id
) pay_agg ON si.invoice_id = pay_agg.invoice_id
GROUP BY sem.semester_id, sem.name
ORDER BY sem.name;

-- Investigation 4: Which exam components contribute most to final grades?
SELECT 'INVESTIGATION 4: Exam Component Weight vs Performance' AS analysis;
SELECT ex.exam_type,
       COUNT(*) AS total_entries,
       ROUND(AVG(ex.weight_percent), 2) AS avg_weight_pct,
       ROUND(AVG(em.obtained_marks), 2) AS avg_marks_obtained,
       ROUND(AVG(ex.total_marks), 2) AS avg_total_marks,
       ROUND(AVG(em.obtained_marks / ex.total_marks) * 100, 2) AS avg_score_pct
FROM exam_marks em
JOIN exams ex ON em.exam_id = ex.exam_id
WHERE em.is_published = TRUE
GROUP BY ex.exam_type
ORDER BY avg_weight_pct DESC;

-- Investigation 5: Hostel occupancy rate analysis
SELECT 'INVESTIGATION 5: Hostel Occupancy Analysis' AS analysis;
SELECT hr.hostel_name, hr.hostel_type,
       COUNT(DISTINCT hr.room_id) AS total_rooms,
       SUM(hr.capacity) AS total_capacity,
       COUNT(DISTINCT CASE WHEN ra.status = 'active' THEN ra.allocation_id END) AS occupied_beds,
       ROUND(COUNT(DISTINCT CASE WHEN ra.status = 'active' THEN ra.allocation_id END) * 100.0
             / SUM(hr.capacity), 2) AS occupancy_rate_pct
FROM hostel_rooms hr
LEFT JOIN room_allocations ra ON hr.room_id = ra.room_id AND ra.status = 'active'
GROUP BY hr.hostel_name, hr.hostel_type;

-- Investigation 6: Transport route utilization
SELECT 'INVESTIGATION 6: Transport Route Utilization' AS analysis;
SELECT tr.route_name,
       tr.vehicle_capacity AS total_seats,
       COUNT(ts.subscription_id) AS active_subscribers,
       tr.vehicle_capacity - COUNT(ts.subscription_id) AS available_seats,
       ROUND(COUNT(ts.subscription_id) * 100.0 / tr.vehicle_capacity, 2) AS utilization_pct
FROM transport_routes tr
LEFT JOIN transport_subscriptions ts ON tr.route_id = ts.route_id AND ts.status = 'active'
GROUP BY tr.route_id, tr.route_name, tr.vehicle_capacity
ORDER BY utilization_pct DESC;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 15 — AUDIT TRAIL & DATA INTEGRITY (Component D - EP3)             ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- Audit log history
SELECT 'STEP 15a: Audit Trail' AS demo_step;
SELECT log_id, action, table_name, record_pk,
       JSON_EXTRACT(new_row, '$.grade_code') AS new_grade,
       created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- Immutable ledger chain
SELECT 'STEP 15b: Blockchain-style Ledger' AS demo_step;
SELECT event_id, event_type, entity_type, entity_id,
       LEFT(prev_hash, 12) AS prev_hash_prefix,
       LEFT(curr_hash, 12) AS curr_hash_prefix,
       event_time
FROM ledger_events
ORDER BY event_id;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ STEP 16 — SYSTEM CONFIG & METADATA (Bonus: Distributed DB concepts)    ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

SELECT 'STEP 16: System Configuration & Metadata' AS demo_step;
SELECT config_type, config_key,
       JSON_UNQUOTE(config_value) AS value, status
FROM system_config
ORDER BY config_type;


-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║ SUMMARY: GUIDELINE COVERAGE CHECKLIST                                   ║
-- ╚════════════════════════════════════════════════════════════════════════════╝
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ GUIDELINES REQUIREMENT                  │ WHERE DEMONSTRATED                │
├──────────────────────────────────────────────────────────────────────────────┤
│ A. Problem Identification (EP2) - 5 Mk  │ Report: Section 1 & 2            │
│ B. System Design (EP1) - 5 Mk           │ STEP 1-2: Tables, FK, Indexes    │
│    - ER Diagram                          │ Report: ER Diagram (MySQL WB)    │
│    - 3NF Normalization                   │ STEP 2: Constraints proof        │
│    - CREATE TABLE with constraints       │ student_portal.sql               │
│ C. SQL Implementation (EP1,EP2) - 10 Mk │ STEP 5-9,13: 12+ queries         │
│    - SELECT / WHERE / GROUP BY / HAVING  │ Q1, Q2, Q3                       │
│    - INNER JOIN                          │ Q1, Q4                           │
│    - LEFT JOIN                           │ Q2, Q5                           │
│    - RIGHT JOIN                          │ Q6                               │
│    - Nested / Subqueries                 │ Q7, Q8, Q9, Q10, Q11            │
│    - VIEWS                               │ STEP 9: 6 views queried          │
│    - TRIGGERS                            │ STEP 10: 11 triggers demo        │
│    - TRANSACTIONS                        │ STEP 11: ROLLBACK demo           │
│    - STORED PROCEDURES                   │ STEP 12: 3 procedures            │
│ D. Investigation & Analysis (EP4) - 5 Mk│ STEP 14: 6 analytical queries    │
│ E. Report (All EPs) - 5 Mk              │ PDF Report (max 6 pages)         │
│ F. Viva - 10 Mk                         │ This demo walkthrough            │
└──────────────────────────────────────────────────────────────────────────────┘
*/

SELECT 'DEMO COMPLETE — All guideline components covered!' AS status;
