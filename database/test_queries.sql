-- =====================================================================
-- Student Portal DBMS — Comprehensive Test Queries
-- Covers ALL required SQL types per Guidelines.pdf:
--   SELECT / WHERE / GROUP BY / HAVING
--   JOINs (INNER, LEFT, RIGHT)
--   Nested Queries / Subqueries
--   Views
--   Triggers
--   Transactions
--   Stored Procedures
-- =====================================================================

USE student_portal;

-- ==========================================================
-- Q1: INNER JOIN + WHERE + ORDER BY
-- Students with their program, department, and batch info
-- ==========================================================
SELECT s.student_code, u.full_name, u.email,
       p.name AS program, d.name AS department,
       s.batch_year, s.section
FROM students s
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN programs p ON s.program_id = p.program_id
INNER JOIN departments d ON p.dept_id = d.dept_id
WHERE s.status = 'active'
ORDER BY d.name, s.student_code;

-- ==========================================================
-- Q2: LEFT JOIN + GROUP BY + HAVING + Aggregate
-- Programs with enrolled student count; show only programs
-- with more than 2 students
-- ==========================================================
SELECT p.name AS program_name, d.name AS department,
       COUNT(s.student_id) AS student_count
FROM programs p
LEFT JOIN students s ON p.program_id = s.program_id
LEFT JOIN departments d ON p.dept_id = d.dept_id
GROUP BY p.program_id, p.name, d.name
HAVING COUNT(s.student_id) >= 2
ORDER BY student_count DESC;

-- ==========================================================
-- Q3: RIGHT JOIN
-- All semesters and their course offerings (including
-- semesters that have no offerings yet)
-- ==========================================================
SELECT sem.name AS semester, sem.start_date, sem.end_date,
       COUNT(co.offering_id) AS offerings
FROM course_offerings co
RIGHT JOIN semesters sem ON co.semester_id = sem.semester_id
GROUP BY sem.semester_id, sem.name, sem.start_date, sem.end_date
ORDER BY sem.start_date;

-- ==========================================================
-- Q4: Nested Subquery (WHERE ... IN)
-- Students who have at least one result with grade 'A' or 'A+'
-- ==========================================================
SELECT s.student_code, u.full_name
FROM students s
JOIN users u ON s.user_id = u.user_id
WHERE s.student_id IN (
  SELECT e.student_id
  FROM enrollments e
  JOIN results r ON e.enrollment_id = r.enrollment_id
  WHERE r.grade_code IN ('A+', 'A')
);

-- ==========================================================
-- Q5: Correlated Subquery
-- Each student's latest enrollment status
-- ==========================================================
SELECT s.student_code, u.full_name,
  (SELECT e2.status FROM enrollments e2
   WHERE e2.student_id = s.student_id
   ORDER BY e2.enrollment_id DESC LIMIT 1) AS latest_enrollment_status,
  (SELECT COUNT(*) FROM enrollments e3
   WHERE e3.student_id = s.student_id) AS total_enrollments
FROM students s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.student_code;

-- ==========================================================
-- Q6: GROUP BY + HAVING + Multiple Aggregates
-- Course-wise exam performance: average, min, max marks
-- showing only courses where avg marks > 60
-- ==========================================================
SELECT c.course_code, c.title,
       ROUND(AVG(em.obtained_marks), 2) AS avg_marks,
       MIN(em.obtained_marks) AS min_marks,
       MAX(em.obtained_marks) AS max_marks,
       COUNT(*) AS total_students
FROM exam_marks em
JOIN exams ex ON em.exam_id = ex.exam_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
GROUP BY c.course_code, c.title
HAVING AVG(em.obtained_marks) > 60
ORDER BY avg_marks DESC;

-- ==========================================================
-- Q7: INNER JOIN on 5+ tables
-- Complete student result sheet: student → enrollment →
-- offering → course → result → grade
-- ==========================================================
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

-- ==========================================================
-- Q8: LEFT JOIN + IS NULL (find gaps)
-- Students who have NOT submitted any evaluation form yet
-- ==========================================================
SELECT s.student_code, u.full_name
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN evaluation_responses er ON s.user_id = er.student_id
WHERE er.response_id IS NULL
ORDER BY s.student_code;

-- ==========================================================
-- Q9: Subquery in FROM (Derived Table) + JOIN
-- CGPA calculation per student from results
-- ==========================================================
SELECT sub.student_code, sub.full_name,
       ROUND(SUM(sub.quality_points) / SUM(sub.credit), 2) AS cgpa,
       SUM(sub.credit) AS total_credits
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

-- ==========================================================
-- Q10: EXISTS subquery
-- Departments that have at least one active faculty profile
-- ==========================================================
SELECT d.dept_id, d.name AS department_name
FROM departments d
WHERE EXISTS (
  SELECT 1 FROM faculty_profiles fp
  WHERE fp.dept_id = d.dept_id
);

-- ==========================================================
-- Q11: UNION (combine results from different queries)
-- All upcoming events: unpaid invoices + pending leave requests
-- ==========================================================
SELECT 'Unpaid Invoice' AS event_type,
       si.invoice_no AS reference,
       u.full_name AS person,
       si.due_date AS event_date
FROM student_invoices si
JOIN students s ON si.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
WHERE si.status = 'unpaid'
UNION
SELECT 'Leave Request' AS event_type,
       CONCAT('LEAVE-', flr.leave_id) AS reference,
       u.full_name AS person,
       flr.start_date AS event_date
FROM faculty_leave_requests flr
JOIN users u ON flr.faculty_user_id = u.user_id
WHERE flr.status = 'pending'
ORDER BY event_date;

-- ==========================================================
-- Q12: VIEW — query existing views
-- ==========================================================
-- Notice list view
SELECT * FROM vw_notice_list ORDER BY created_at DESC LIMIT 20;

-- Evaluation summary view
SELECT * FROM vw_evaluation_summary;

-- Faculty leave balance view
SELECT * FROM vw_faculty_leave_balance;

-- Attendance summary view
SELECT * FROM vw_attendance_summary LIMIT 20;

-- ==========================================================
-- Q13: TRIGGER verification
-- Insert a result row and check that audit_logs captured it
-- ==========================================================
-- Step 1: Check current audit log count for results table
SELECT COUNT(*) AS before_count FROM audit_logs WHERE table_name = 'results';

-- Step 2: Insert a test result (trigger `trg_result_audit` fires)
INSERT INTO results (enrollment_id, total_mark, grade_code)
VALUES (1, 88, 'A');

-- Step 3: Verify trigger created an audit log entry
SELECT * FROM audit_logs WHERE table_name = 'results' ORDER BY created_at DESC LIMIT 1;

-- Cleanup
DELETE FROM results WHERE enrollment_id = 1 AND total_mark = 88 AND grade_code = 'A'
ORDER BY result_id DESC LIMIT 1;

-- ==========================================================
-- Q14: TRANSACTION — Manual transaction demo
-- Transfer a student to a different section atomically
-- ==========================================================
START TRANSACTION;

-- Save current state
SELECT student_id, section FROM students WHERE student_id = 1;

-- Update section
UPDATE students SET section = 'D' WHERE student_id = 1;

-- Verify change
SELECT student_id, section FROM students WHERE student_id = 1;

-- Rollback to restore original state (change ROLLBACK to COMMIT to keep)
ROLLBACK;

-- Confirm rollback
SELECT student_id, section FROM students WHERE student_id = 1;

-- ==========================================================
-- Q15: STORED PROCEDURE — Call sp_approve_registration
-- Approves a registration and atomically enrolls the student
-- ==========================================================
-- Check pending registrations first
SELECT rr.request_id, s.student_code, u.full_name, rr.status, rr.total_credits
FROM registration_requests rr
JOIN students s ON rr.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
WHERE rr.status = 'submitted'
LIMIT 5;

-- Call the stored procedure (approve request_id=1 by admin user_id=1)
-- CALL sp_approve_registration(1, 1);

-- Verify the registration status changed
-- SELECT * FROM registration_requests WHERE request_id = 1;
-- SELECT * FROM enrollments ORDER BY enrollment_id DESC LIMIT 5;

-- ==========================================================
-- BONUS QUERIES
-- ==========================================================

-- B1: Finance summary per student with subquery
SELECT s.student_code, u.full_name,
  (SELECT COALESCE(SUM(ii.amount), 0) FROM student_invoices si
   JOIN invoice_items ii ON si.invoice_id = ii.invoice_id
   WHERE si.student_id = s.student_id) AS total_billed,
  (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
   JOIN student_invoices si ON p.invoice_id = si.invoice_id
   WHERE si.student_id = s.student_id) AS total_paid
FROM students s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.student_code;

-- B2: Hostel occupancy by hostel name
SELECT hr.hostel_name,
       COUNT(DISTINCT hr.room_id) AS total_rooms,
       COUNT(DISTINCT CASE WHEN ra.status = 'active' THEN ra.allocation_id END) AS occupied,
       COUNT(DISTINCT hr.room_id) - COUNT(DISTINCT CASE WHEN ra.status = 'active' THEN ra.room_id END) AS available
FROM hostel_rooms hr
LEFT JOIN room_allocations ra ON hr.room_id = ra.room_id AND ra.status = 'active'
GROUP BY hr.hostel_name;

-- B3: Transport route utilization
SELECT tr.route_name, tr.start_point, tr.end_point,
       tr.vehicle_capacity,
       COUNT(ts.subscription_id) AS active_subscribers,
       tr.vehicle_capacity - COUNT(ts.subscription_id) AS seats_available
FROM transport_routes tr
LEFT JOIN transport_subscriptions ts ON tr.route_id = ts.route_id AND ts.status = 'active'
GROUP BY tr.route_id, tr.route_name, tr.start_point, tr.end_point, tr.vehicle_capacity
ORDER BY active_subscribers DESC;

-- B4: Clearance status overview
SELECT cr.type AS clearance_type,
       COUNT(*) AS total_requests,
       SUM(CASE WHEN cr.status = 'cleared' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN cr.status = 'pending' THEN 1 ELSE 0 END) AS pending
FROM clearance_requests cr
GROUP BY cr.type;

-- B5: STORED PROCEDURE — Admit a new student in one call
-- Uncomment to run (creates a real user + student + invoice + hostel)
-- CALL sp_admit_student(
--   'Test Student',               -- full_name
--   'test.student@diu.edu.bd',    -- email
--   '+8801700000099',             -- phone
--   1,                            -- program_id (1=BSc CSE)
--   2026,                         -- batch_year
--   'A',                          -- section
--   7,                            -- semester_id
--   TRUE,                         -- needs_hostel
--   NULL                          -- advisor_id
-- );

-- B6: Table row counts (system overview)
SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'student_portal' AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_ROWS DESC;
