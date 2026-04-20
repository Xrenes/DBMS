USE student_portal;

DROP FUNCTION IF EXISTS fn_calculate_sgpa;
DROP FUNCTION IF EXISTS fn_calculate_cgpa;
DROP FUNCTION IF EXISTS fn_academic_standing;
DROP FUNCTION IF EXISTS fn_payment_percentage;
DROP FUNCTION IF EXISTS fn_attendance_pct;
DROP PROCEDURE IF EXISTS sp_semester_report_card;
DROP PROCEDURE IF EXISTS sp_attendance_summary;
DROP PROCEDURE IF EXISTS sp_admit_student;
DROP PROCEDURE IF EXISTS sp_fee_summary;
DROP TRIGGER IF EXISTS trg_notice_after_insert;
DROP TRIGGER IF EXISTS trg_clearance_step_update;
DROP TRIGGER IF EXISTS trg_reg_item_after_insert;

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

CREATE TRIGGER trg_notice_after_insert AFTER INSERT ON notices FOR EACH ROW
BEGIN
    INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
    VALUES (NEW.posted_by, 'NOTICE_POSTED', 'notice', NEW.notice_id,
            JSON_OBJECT('title', NEW.title, 'category', NEW.category, 'priority', NEW.priority));
END //

CREATE TRIGGER trg_clearance_step_update AFTER UPDATE ON clearance_steps FOR EACH ROW
BEGIN
    DECLARE v_total INT;
    DECLARE v_cleared INT;
    SELECT COUNT(*), SUM(status = 'cleared') INTO v_total, v_cleared FROM clearance_steps WHERE clearance_id = NEW.clearance_id;
    IF v_cleared = v_total THEN
        UPDATE clearance_requests SET status = 'completed', completed_at = NOW() WHERE clearance_id = NEW.clearance_id;
    END IF;
END //

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

-- Views
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
JOIN students s ON rr.student_user_id = s.user_id
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
JOIN students s ON cr.student_user_id = s.user_id
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

SELECT 'ROUTINES CREATED' AS status;
