-- ============================================
-- Student Portal - Essential Test Queries
-- ============================================

USE student_portal;

-- ============================================
-- 1. CHECK ALL TABLES
-- ============================================
SHOW TABLES;

-- ============================================
-- 2. VIEW STUDENT DATA
-- ============================================

-- All students
SELECT s.student_code, u.full_name, u.email, p.program_name, s.batch, s.status
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN programs p ON s.program_id = p.program_id;

-- Specific student (Iftekhar)
SELECT * FROM students WHERE student_code = 'STU2024001';

-- ============================================
-- 3. ACADEMIC DATA
-- ============================================

-- All courses
SELECT c.course_code, c.course_name, d.dept_name, c.credits, c.course_type
FROM courses c
JOIN departments d ON c.dept_id = d.dept_id
ORDER BY c.course_code;

-- Grade scale
SELECT * FROM grade_scale ORDER BY min_marks DESC;

-- Current semester
SELECT * FROM semesters WHERE is_current = TRUE;

-- ============================================
-- 4. RESULTS & CGPA
-- ============================================

-- Student CGPA (using view)
SELECT * FROM vw_student_cgpa;

-- Student SGPA per semester (using view)
SELECT * FROM vw_semester_sgpa ORDER BY semester_id;

-- Detailed results
SELECT r.*, c.course_code, c.course_name, gs.letter_grade
FROM results r
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN grade_scale gs ON r.grade_point = gs.grade_point;

-- ============================================
-- 5. ATTENDANCE
-- ============================================

-- Attendance summary (using view)
SELECT * FROM vw_attendance_summary;

-- Recent attendance records
SELECT ar.*, cs.session_date, cs.session_type, c.course_name
FROM attendance_records ar
JOIN class_sessions cs ON ar.session_id = cs.session_id
JOIN course_offerings co ON cs.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
ORDER BY cs.session_date DESC
LIMIT 20;

-- ============================================
-- 6. FINANCE
-- ============================================

-- Student dues (using view)
SELECT * FROM vw_student_dues;

-- All invoices
SELECT si.invoice_no, si.invoice_date, si.due_date, si.total_amount, si.status,
       s.student_code, u.full_name
FROM student_invoices si
JOIN students s ON si.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
ORDER BY si.invoice_date DESC;

-- Payment history
SELECT p.*, si.invoice_no, s.student_code
FROM payments p
JOIN student_invoices si ON p.invoice_id = si.invoice_id
JOIN students s ON si.student_id = s.student_id
ORDER BY p.payment_date DESC;

-- ============================================
-- 7. HOSTEL & TRANSPORT
-- ============================================

-- Hostel allocations
SELECT ra.*, hr.hostel_name, hr.room_no, hr.floor, s.student_code, u.full_name
FROM room_allocations ra
JOIN hostel_rooms hr ON ra.room_id = hr.room_id
JOIN students s ON ra.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
WHERE ra.status = 'active';

-- Transport subscriptions
SELECT ts.*, tr.route_name, tr.origin, tr.destination, s.student_code, u.full_name
FROM transport_subscriptions ts
JOIN transport_routes tr ON ts.route_id = tr.route_id
JOIN students s ON ts.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
WHERE ts.status = 'active';

-- ============================================
-- 8. AUDIT LOGS (Track All Changes)
-- ============================================

-- Recent audit logs
SELECT al.*, u.username, u.full_name
FROM audit_logs al
JOIN users u ON al.user_id = u.user_id
ORDER BY al.created_at DESC
LIMIT 50;

-- Audit logs for specific table
SELECT * FROM audit_logs 
WHERE table_name = 'students'
ORDER BY created_at DESC;

-- ============================================
-- 9. BLOCKCHAIN LEDGER
-- ============================================

-- View ledger events
SELECT * FROM ledger_events ORDER BY event_id DESC LIMIT 20;

-- Verify ledger integrity (manual check)
SELECT 
    event_id,
    event_type,
    LEFT(prev_hash, 16) as prev_hash_preview,
    LEFT(curr_hash, 16) as curr_hash_preview,
    created_at
FROM ledger_events 
ORDER BY event_id;

-- ============================================
-- 10. SYSTEM STATISTICS
-- ============================================

-- Total counts
SELECT 
    (SELECT COUNT(*) FROM students WHERE status = 'active') as active_students,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM enrollments) as total_enrollments;

-- Students per program
SELECT p.program_name, COUNT(s.student_id) as student_count
FROM programs p
LEFT JOIN students s ON p.program_id = s.program_id
GROUP BY p.program_id, p.program_name;

-- ============================================
-- 11. TEST DATA MODIFICATIONS
-- ============================================

-- Example: Add new student
-- INSERT INTO users (username, email, password_hash, full_name, phone, status)
-- VALUES ('test001', 'test@example.com', 'hashed_password', 'Test Student', '01700000000', 'active');

-- Example: Update grade
-- UPDATE results SET marks = 85 WHERE result_id = 1;

-- Example: Check trigger fired
-- SELECT * FROM audit_logs WHERE table_name = 'results' ORDER BY created_at DESC LIMIT 1;

-- ============================================
-- 12. PERFORMANCE MONITORING
-- ============================================

-- Check table sizes
SELECT 
    table_name,
    table_rows,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'student_portal'
ORDER BY (data_length + index_length) DESC;

-- Active sessions
SHOW PROCESSLIST;
