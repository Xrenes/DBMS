-- ============================================================================
-- STUDENT PORTAL — SCHEMA UPDATE & EXPANDED SEED DATA
-- Adds missing tables, views, triggers, stored procedures
-- Expands seed data to 20+ records per table (Guidelines requirement)
-- ============================================================================

USE student_portal;

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- 1. Notices & Announcements
CREATE TABLE IF NOT EXISTS notices (
  notice_id    INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  body         TEXT NOT NULL,
  audience     ENUM('all','student','faculty','department') DEFAULT 'all',
  dept_id      INT NULL,
  posted_by    INT NOT NULL,
  priority     ENUM('normal','important','urgent') DEFAULT 'normal',
  pinned       BOOLEAN DEFAULT FALSE,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NULL,
  FOREIGN KEY (dept_id)    REFERENCES departments(dept_id),
  FOREIGN KEY (posted_by)  REFERENCES users(user_id),
  INDEX idx_notice_audience (audience),
  INDEX idx_notice_date (published_at),
  INDEX idx_notice_priority (priority)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notice_reads (
  notice_id INT NOT NULL,
  user_id   INT NOT NULL,
  read_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notice_id, user_id),
  FOREIGN KEY (notice_id) REFERENCES notices(notice_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 2. Course Evaluation (anonymous)
CREATE TABLE IF NOT EXISTS evaluation_forms (
  form_id     INT AUTO_INCREMENT PRIMARY KEY,
  offering_id INT NOT NULL,
  semester_id INT NOT NULL,
  open_date   DATE NOT NULL,
  close_date  DATE NOT NULL,
  status      ENUM('draft','open','closed') DEFAULT 'draft',
  FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  INDEX idx_eval_semester (semester_id),
  INDEX idx_eval_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evaluation_responses (
  response_id   INT AUTO_INCREMENT PRIMARY KEY,
  form_id       INT NOT NULL,
  student_id    INT NOT NULL,
  q_teaching    TINYINT NOT NULL CHECK (q_teaching BETWEEN 1 AND 5),
  q_content     TINYINT NOT NULL CHECK (q_content BETWEEN 1 AND 5),
  q_assessment  TINYINT NOT NULL CHECK (q_assessment BETWEEN 1 AND 5),
  q_environment TINYINT NOT NULL CHECK (q_environment BETWEEN 1 AND 5),
  q_overall     TINYINT NOT NULL CHECK (q_overall BETWEEN 1 AND 5),
  comments      TEXT,
  submitted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id)    REFERENCES evaluation_forms(form_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE KEY uq_eval_response (form_id, student_id),
  INDEX idx_eval_form (form_id)
) ENGINE=InnoDB;

-- 3. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
  profile_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL UNIQUE,
  dept_id            INT NOT NULL,
  designation        VARCHAR(100) NOT NULL,
  qualification      TEXT,
  specialization     VARCHAR(255),
  office_room        VARCHAR(50),
  office_hours       VARCHAR(100),
  join_date          DATE,
  research_interests JSON,
  publications_count INT DEFAULT 0,
  photo_url          VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
) ENGINE=InnoDB;

-- 4. Faculty Leave Requests
CREATE TABLE IF NOT EXISTS faculty_leave_requests (
  leave_id        INT AUTO_INCREMENT PRIMARY KEY,
  faculty_user_id INT NOT NULL,
  leave_type      ENUM('casual','sick','annual','study','maternity') NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT NOT NULL,
  status          ENUM('pending','approved','rejected') DEFAULT 'pending',
  approved_by     INT NULL,
  comments        TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_user_id) REFERENCES users(user_id),
  FOREIGN KEY (approved_by)     REFERENCES users(user_id),
  INDEX idx_leave_faculty (faculty_user_id),
  INDEX idx_leave_status (status),
  INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB;

-- 5. Course Registration Workflow
CREATE TABLE IF NOT EXISTS registration_requests (
  request_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  semester_id  INT NOT NULL,
  status       ENUM('draft','submitted','approved','rejected') DEFAULT 'draft',
  submitted_at DATETIME NULL,
  approved_by  INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)  REFERENCES students(student_id),
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id),
  INDEX idx_reg_student (student_id),
  INDEX idx_reg_semester (semester_id),
  INDEX idx_reg_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registration_items (
  item_id      INT AUTO_INCREMENT PRIMARY KEY,
  request_id   INT NOT NULL,
  offering_id  INT NOT NULL,
  action       ENUM('add','drop') DEFAULT 'add',
  FOREIGN KEY (request_id)  REFERENCES registration_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
  UNIQUE KEY uq_reg_item (request_id, offering_id)
) ENGINE=InnoDB;

-- 6. Academic Clearance
CREATE TABLE IF NOT EXISTS clearance_requests (
  clearance_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  semester_id  INT NOT NULL,
  type         ENUM('semester','final') DEFAULT 'semester',
  status       ENUM('pending','in_progress','cleared','rejected') DEFAULT 'pending',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)  REFERENCES students(student_id),
  FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
  INDEX idx_clear_student (student_id),
  INDEX idx_clear_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clearance_steps (
  step_id       INT AUTO_INCREMENT PRIMARY KEY,
  clearance_id  INT NOT NULL,
  department    VARCHAR(100) NOT NULL,
  status        ENUM('pending','cleared','issue') DEFAULT 'pending',
  verified_by   INT NULL,
  verified_at   DATETIME NULL,
  remarks       TEXT,
  FOREIGN KEY (clearance_id) REFERENCES clearance_requests(clearance_id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by)  REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ============================================================================
-- NEW VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW vw_notice_list AS
SELECT n.*, u.full_name AS posted_by_name,
       (SELECT COUNT(*) FROM notice_reads nr WHERE nr.notice_id = n.notice_id) AS read_count
FROM notices n
JOIN users u ON u.user_id = n.posted_by
WHERE n.expires_at IS NULL OR n.expires_at > NOW()
ORDER BY n.pinned DESC, n.published_at DESC;

CREATE OR REPLACE VIEW vw_evaluation_summary AS
SELECT ef.form_id, ef.offering_id, ef.semester_id,
       c.course_code, c.title AS course_title,
       u.full_name AS teacher_name,
       COUNT(er.response_id) AS response_count,
       ROUND(AVG(er.q_teaching), 2) AS avg_teaching,
       ROUND(AVG(er.q_content), 2) AS avg_content,
       ROUND(AVG(er.q_assessment), 2) AS avg_assessment,
       ROUND(AVG(er.q_environment), 2) AS avg_environment,
       ROUND(AVG(er.q_overall), 2) AS avg_overall
FROM evaluation_forms ef
JOIN course_offerings co ON co.offering_id = ef.offering_id
JOIN courses c ON c.course_id = co.course_id
JOIN users u ON u.user_id = co.teacher_id
LEFT JOIN evaluation_responses er ON er.form_id = ef.form_id
GROUP BY ef.form_id;

CREATE OR REPLACE VIEW vw_faculty_leave_balance AS
SELECT flr.faculty_user_id, u.full_name,
       flr.leave_type,
       COUNT(*) AS total_requests,
       SUM(CASE WHEN flr.status = 'approved' THEN DATEDIFF(flr.end_date, flr.start_date) + 1 ELSE 0 END) AS days_used,
       SUM(CASE WHEN flr.status = 'pending' THEN 1 ELSE 0 END) AS pending_requests
FROM faculty_leave_requests flr
JOIN users u ON u.user_id = flr.faculty_user_id
GROUP BY flr.faculty_user_id, flr.leave_type;

-- ============================================================================
-- NEW TRIGGERS
-- ============================================================================

DELIMITER //

-- Validate evaluation form is open before allowing response
CREATE TRIGGER trg_eval_response_validate
BEFORE INSERT ON evaluation_responses
FOR EACH ROW
BEGIN
  DECLARE form_status VARCHAR(10);
  SELECT status INTO form_status FROM evaluation_forms WHERE form_id = NEW.form_id;
  IF form_status != 'open' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Evaluation form is not open for responses';
  END IF;
END//

-- Auto-update clearance request status when all steps are cleared
CREATE TRIGGER trg_clearance_step_update
AFTER UPDATE ON clearance_steps
FOR EACH ROW
BEGIN
  DECLARE total_steps INT;
  DECLARE cleared_steps INT;
  DECLARE issue_steps INT;
  
  SELECT COUNT(*), SUM(CASE WHEN status='cleared' THEN 1 ELSE 0 END),
         SUM(CASE WHEN status='issue' THEN 1 ELSE 0 END)
  INTO total_steps, cleared_steps, issue_steps
  FROM clearance_steps WHERE clearance_id = NEW.clearance_id;
  
  IF cleared_steps = total_steps THEN
    UPDATE clearance_requests SET status='cleared' WHERE clearance_id = NEW.clearance_id;
  ELSEIF issue_steps > 0 THEN
    UPDATE clearance_requests SET status='rejected' WHERE clearance_id = NEW.clearance_id;
  ELSE
    UPDATE clearance_requests SET status='in_progress' WHERE clearance_id = NEW.clearance_id;
  END IF;
END//

-- Audit log for leave requests
CREATE TRIGGER trg_leave_after_insert
AFTER INSERT ON faculty_leave_requests
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (actor_user_id, action, table_name, record_pk, new_row)
  VALUES (NEW.faculty_user_id, 'INSERT', 'faculty_leave_requests', NEW.leave_id,
    JSON_OBJECT('leave_type', NEW.leave_type, 'start_date', NEW.start_date, 'end_date', NEW.end_date, 'status', NEW.status));
END//

-- Stored procedure: Approve course registration
CREATE PROCEDURE sp_approve_registration(IN p_request_id INT, IN p_admin_id INT)
BEGIN
  DECLARE v_student_id INT;
  DECLARE v_semester_id INT;
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_offering_id INT;
  DECLARE v_action VARCHAR(10);
  DECLARE cur CURSOR FOR
    SELECT offering_id, action FROM registration_items WHERE request_id = p_request_id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  START TRANSACTION;
  
  SELECT student_id, semester_id INTO v_student_id, v_semester_id
  FROM registration_requests WHERE request_id = p_request_id AND status = 'submitted';
  
  IF v_student_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registration request not found or not submitted';
  END IF;
  
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_offering_id, v_action;
    IF done THEN LEAVE read_loop; END IF;
    IF v_action = 'add' THEN
      INSERT IGNORE INTO enrollments (student_id, offering_id, status)
      VALUES (v_student_id, v_offering_id, 'active');
    ELSEIF v_action = 'drop' THEN
      UPDATE enrollments SET status='dropped'
      WHERE student_id = v_student_id AND offering_id = v_offering_id;
    END IF;
  END LOOP;
  CLOSE cur;
  
  UPDATE registration_requests SET status='approved', approved_by=p_admin_id WHERE request_id = p_request_id;
  
  INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
  VALUES (p_admin_id, 'REGISTRATION_APPROVED', 'registration_request', p_request_id,
    JSON_OBJECT('student_id', v_student_id, 'semester_id', v_semester_id));
  
  COMMIT;
END//

DELIMITER ;

-- ============================================================================
-- STORED PROCEDURE: sp_admit_student
-- Single call to fully admit a new student into the system.
-- Auto-generates: user_id, student_id, student_code, invoice, room allocation
-- Admin provides: name, email, phone, program_id, batch_year, section,
--                 semester_id (for invoice), hostel flag
-- ============================================================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS sp_admit_student(
  -- Required student info
  IN p_full_name      VARCHAR(100),
  IN p_email          VARCHAR(255),
  IN p_phone          VARCHAR(20),
  IN p_program_id     INT,
  IN p_batch_year     YEAR,
  IN p_section        CHAR(1),
  -- Semester for invoice generation
  IN p_semester_id    INT,
  -- Optional: set to TRUE to auto-assign hostel room
  IN p_needs_hostel   BOOLEAN,
  -- Optional: advisor faculty user_id (NULL = no advisor)
  IN p_advisor_id     INT
)
BEGIN
  -- Auto-generated variables
  DECLARE v_user_id       INT;
  DECLARE v_student_id    INT;
  DECLARE v_student_code  VARCHAR(20);
  DECLARE v_dept_code     VARCHAR(10);
  DECLARE v_seq           INT;
  DECLARE v_invoice_id    INT;
  DECLARE v_invoice_no    VARCHAR(20);
  DECLARE v_room_id       INT DEFAULT NULL;
  DECLARE v_bed_no        INT DEFAULT NULL;
  -- Default password hash for 'password123'
  DECLARE v_default_hash  VARCHAR(255) DEFAULT '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu';

  -- Validate program exists
  SELECT d.code INTO v_dept_code
  FROM programs p JOIN departments d ON p.dept_id = d.dept_id
  WHERE p.program_id = p_program_id;

  IF v_dept_code IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid program_id: program not found';
  END IF;

  -- Validate semester exists
  IF NOT EXISTS (SELECT 1 FROM semesters WHERE semester_id = p_semester_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid semester_id: semester not found';
  END IF;

  START TRANSACTION;

  -- ─── STEP 1: Create user account ───
  INSERT INTO users (email, password_hash, full_name, phone, status)
  VALUES (p_email, v_default_hash, p_full_name, p_phone, 'active');
  SET v_user_id = LAST_INSERT_ID();

  -- ─── STEP 2: Assign 'student' role (role_id = 2) ───
  INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, 2);

  -- ─── STEP 3: Generate student_code ───
  -- Pattern: {DeptCode}{BatchYear}{3-digit-seq}  e.g. CSE2026001
  SELECT COALESCE(MAX(
    CAST(RIGHT(s.student_code, 3) AS UNSIGNED)
  ), 0) + 1 INTO v_seq
  FROM students s
  JOIN programs pr ON s.program_id = pr.program_id
  JOIN departments d ON pr.dept_id = d.dept_id
  WHERE d.code = v_dept_code AND s.batch_year = p_batch_year;

  SET v_student_code = CONCAT(v_dept_code, p_batch_year, LPAD(v_seq, 3, '0'));

  -- ─── STEP 4: Create student record ───
  INSERT INTO students (user_id, student_code, program_id, batch_year, section, enrollment_date, advisor_id)
  VALUES (v_user_id, v_student_code, p_program_id, p_batch_year, p_section, CURDATE(), p_advisor_id);
  SET v_student_id = LAST_INSERT_ID();

  -- ─── STEP 5: Generate semester invoice ───
  SET v_invoice_no = CONCAT('INV', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(v_student_id, 4, '0'));

  INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status)
  VALUES (v_student_id, p_semester_id, v_invoice_no, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'pending');
  SET v_invoice_id = LAST_INSERT_ID();

  -- Standard fee items (6 heads)
  INSERT INTO invoice_items (invoice_id, fee_head_id, amount) VALUES
    (v_invoice_id, 1, 55000.00),   -- Tuition Fee
    (v_invoice_id, 2, 8000.00),    -- Lab Fee
    (v_invoice_id, 3, 3000.00),    -- Library Fee
    (v_invoice_id, 4, 5000.00),    -- Development Fee
    (v_invoice_id, 5, 7000.00),    -- Exam Fee
    (v_invoice_id, 6, 7000.00);    -- Miscellaneous

  -- ─── STEP 6: Auto-assign hostel room (if requested) ───
  IF p_needs_hostel THEN
    -- Find a room with available capacity (occupied < capacity)
    SELECT hr.room_id INTO v_room_id
    FROM hostel_rooms hr
    LEFT JOIN (
      SELECT room_id, COUNT(*) AS occupied
      FROM room_allocations WHERE status = 'active'
      GROUP BY room_id
    ) occ ON hr.room_id = occ.room_id
    WHERE COALESCE(occ.occupied, 0) < hr.capacity
    ORDER BY hr.room_id
    LIMIT 1;

    IF v_room_id IS NOT NULL THEN
      -- Next bed number in this room
      SELECT COALESCE(MAX(bed_no), 0) + 1 INTO v_bed_no
      FROM room_allocations WHERE room_id = v_room_id AND status = 'active';

      INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status)
      VALUES (v_student_id, v_room_id, v_bed_no, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 48000.00, FALSE, 'active');
    END IF;
  END IF;

  -- ─── STEP 7: Audit log ───
  INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
  VALUES (1, 'INSERT', 'students', v_student_id,
    JSON_OBJECT(
      'student_code', v_student_code,
      'full_name', p_full_name,
      'email', p_email,
      'program_id', p_program_id,
      'batch_year', p_batch_year,
      'invoice_no', v_invoice_no,
      'hostel_room_id', v_room_id
    ));

  COMMIT;

  -- Return the created record summary
  SELECT v_user_id       AS user_id,
         v_student_id    AS student_id,
         v_student_code  AS student_code,
         p_full_name     AS full_name,
         p_email         AS email,
         v_invoice_no    AS invoice_no,
         v_room_id       AS hostel_room_id,
         v_bed_no        AS bed_no,
         'Student admitted successfully' AS message;
END//

DELIMITER ;

-- ============================================================================
-- ADD PERMISSIONS FOR NEW MODULES
-- ============================================================================

INSERT IGNORE INTO permissions (perm_code, module, description) VALUES
('notices.create', 'notices', 'Create notices'),
('notices.read', 'notices', 'View notices'),
('notices.update', 'notices', 'Update notices'),
('notices.delete', 'notices', 'Delete notices'),
('evaluation.submit', 'evaluation', 'Submit course evaluation'),
('evaluation.view', 'evaluation', 'View evaluation results'),
('leave.apply', 'leave', 'Apply for leave'),
('leave.approve', 'leave', 'Approve leave requests'),
('registration.submit', 'registration', 'Submit course registration'),
('registration.approve', 'registration', 'Approve registrations'),
('clearance.request', 'clearance', 'Request clearance'),
('clearance.verify', 'clearance', 'Verify clearance steps');

-- Assign new permissions to roles (using subqueries for IDs)
INSERT IGNORE INTO role_permissions (role_id, perm_id)
SELECT r.role_id, p.perm_id FROM roles r, permissions p
WHERE r.role_name = 'admin' AND p.perm_code IN
('notices.create','notices.read','notices.update','notices.delete',
 'evaluation.view','leave.approve','registration.approve','clearance.verify');

INSERT IGNORE INTO role_permissions (role_id, perm_id)
SELECT r.role_id, p.perm_id FROM roles r, permissions p
WHERE r.role_name = 'student' AND p.perm_code IN
('notices.read','evaluation.submit','registration.submit','clearance.request');

INSERT IGNORE INTO role_permissions (role_id, perm_id)
SELECT r.role_id, p.perm_id FROM roles r, permissions p
WHERE r.role_name = 'faculty' AND p.perm_code IN
('notices.read','notices.create','evaluation.view','leave.apply');

-- ============================================================================
-- EXPANDED SEED DATA — 20+ RECORDS PER TABLE
-- ============================================================================

-- ---------- MORE USERS (15 new students + 3 more faculty) ----------
INSERT INTO users (email, password_hash, full_name, phone, status) VALUES
-- New faculty (IDs 9-11)
('dr.karim@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Abdul Karim', '+8801756666666', 'active'),
('prof.sultana@diu.edu.bd','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Prof. Fatema Sultana', '+8801757777777', 'active'),
('dr.hasan@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Dr. Md. Hasanuzzaman', '+8801758888888', 'active'),
-- New students (IDs 12-26)
('rafiq.islam@diu.edu.bd',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Md. Rafiqul Islam', '+8801812345001', 'active'),
('nusrat.jahan@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Nusrat Jahan', '+8801812345002', 'active'),
('kamal.hossain@diu.edu.bd',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Kamal Hossain', '+8801812345003', 'active'),
('tasnim.akter@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Tasnim Akter', '+8801812345004', 'active'),
('shafiq.ahmed@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Shafiq Ahmed', '+8801812345005', 'active'),
('maliha.rahman@diu.edu.bd',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Maliha Rahman', '+8801812345006', 'active'),
('arif.khan@diu.edu.bd',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Arif Khan', '+8801812345007', 'active'),
('farzana.alam@diu.edu.bd',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Farzana Alam', '+8801812345008', 'active'),
('tanvir.hassan@diu.edu.bd',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Tanvir Hassan', '+8801812345009', 'active'),
('sabrina.sultana@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Sabrina Sultana', '+8801812345010', 'active'),
('imran.chowdhury@diu.edu.bd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Imran Chowdhury', '+8801812345011', 'active'),
('priya.das@diu.edu.bd',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Priya Das', '+8801812345012', 'active'),
('jubayer.haque@diu.edu.bd',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Jubayer Haque', '+8801812345013', 'active'),
('lamia.begum@diu.edu.bd',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Lamia Begum', '+8801812345014', 'active'),
('rakib.mia@diu.edu.bd',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu', 'Rakib Mia', '+8801812345015', 'active');

-- Assign roles: 3 new faculty
INSERT INTO user_roles (user_id, role_id) VALUES
(9, 3), (10, 3), (11, 3);
-- 15 new students
INSERT INTO user_roles (user_id, role_id) VALUES
(12, 2), (13, 2), (14, 2), (15, 2), (16, 2),
(17, 2), (18, 2), (19, 2), (20, 2), (21, 2),
(22, 2), (23, 2), (24, 2), (25, 2), (26, 2);

-- ---------- MORE STUDENTS ----------
INSERT INTO students (user_id, student_code, program_id, batch_year, section, enrollment_date, advisor_id) VALUES
(12, 'CSE2021002', 1, 2021, 'A', '2021-01-15', 2),
(13, 'CSE2021003', 1, 2021, 'A', '2021-01-15', 3),
(14, 'CSE2021004', 1, 2021, 'B', '2021-01-15', 2),
(15, 'CSE2021005', 1, 2021, 'B', '2021-01-15', 4),
(16, 'CSE2022001', 1, 2022, 'A', '2022-01-15', 5),
(17, 'CSE2022002', 1, 2022, 'A', '2022-01-15', 3),
(18, 'EEE2021001', 3, 2021, 'A', '2021-01-15', 9),
(19, 'EEE2021002', 3, 2021, 'A', '2021-01-15', 10),
(20, 'BBA2021001', 4, 2021, 'A', '2021-01-15', 11),
(21, 'BBA2021002', 4, 2021, 'B', '2021-01-15', 11),
(22, 'CSE2022003', 1, 2022, 'B', '2022-01-15', 2),
(23, 'CSE2023001', 1, 2023, 'A', '2023-01-15', 3),
(24, 'CSE2023002', 1, 2023, 'A', '2023-01-15', 4),
(25, 'EEE2022001', 3, 2022, 'A', '2022-01-15', 9),
(26, 'BBA2022001', 4, 2022, 'A', '2022-01-15', 10);

-- ---------- FACULTY PROFILES ----------
INSERT INTO faculty_profiles (user_id, dept_id, designation, qualification, specialization, office_room, office_hours, join_date, research_interests, publications_count) VALUES
(2, 1, 'Professor', 'PhD in CSE, Jahangirnagar University', 'Software Engineering', 'AB5-701', 'Sun-Tue 10:00-12:00', '2005-03-15', '["Software Engineering","Data Mining","Machine Learning"]', 45),
(3, 1, 'Associate Professor', 'PhD in Computer Science, University of Dhaka', 'Database Systems', 'AB5-710', 'Sat-Mon 10:00-12:00', '2012-03-15', '["Database Systems","Machine Learning","Cloud Computing","Big Data"]', 24),
(4, 1, 'Professor', 'PhD in CSE, BUET', 'Computer Networks', 'AB5-703', 'Sun-Wed 11:00-13:00', '2008-06-01', '["Computer Networks","IoT","Cyber Security"]', 38),
(5, 1, 'Assistant Professor', 'PhD in AI, University of Malaya', 'Artificial Intelligence', 'AB5-705', 'Sat-Tue 14:00-16:00', '2015-01-10', '["AI","NLP","Deep Learning","Computer Vision"]', 18),
(6, 1, 'Associate Professor', 'PhD in Software Engineering, IIT Dhaka', 'Cloud Computing', 'AB5-708', 'Mon-Wed 09:00-11:00', '2010-07-20', '["Cloud Computing","Distributed Systems","DevOps"]', 22),
(9, 2, 'Associate Professor', 'PhD in EEE, BUET', 'Power Systems', 'AB4-401', 'Sun-Tue 10:00-12:00', '2011-09-01', '["Power Systems","Renewable Energy","Smart Grid"]', 20),
(10, 3, 'Professor', 'PhD in Business, University of Dhaka', 'Marketing', 'AB3-301', 'Sat-Mon 11:00-13:00', '2007-02-15', '["Marketing","Consumer Behavior","Digital Marketing"]', 30),
(11, 2, 'Assistant Professor', 'MSc in EEE, KUET', 'Signal Processing', 'AB4-405', 'Wed-Thu 10:00-12:00', '2018-03-10', '["Signal Processing","Image Processing","Embedded Systems"]', 8);

-- ---------- MORE COURSE OFFERINGS (for multiple sections & teachers) ----------
INSERT INTO course_offerings (course_id, semester_id, teacher_id, section) VALUES
-- Spring 2026 (semester 7) additional sections
(27, 7, 3, 'B'),   -- offering 7: CSE701 sec B
(28, 7, 5, 'B'),   -- offering 8: CSE702 sec B
(29, 7, 9, 'A'),   -- offering 9: CSE703 sec A with Dr. Karim
(30, 7, 10, 'A'),  -- offering 10: CSE704
(31, 7, 11, 'A'),  -- offering 11: CSE705
-- Past semester offerings (semester 6 = Fall 2025)
(1, 6, 2, 'A'),    -- offering 12: CSE101 in Fall 2025
(2, 6, 3, 'A'),    -- offering 13: CSE102
(3, 6, 4, 'A'),    -- offering 14: MAT101
(4, 6, 5, 'A'),    -- offering 15: ENG101
(5, 6, 6, 'A');    -- offering 16: PHY101

-- ---------- MORE ENROLLMENTS (20+ records) ----------
-- Other students in current semester offerings
INSERT INTO enrollments (student_id, offering_id, status) VALUES
-- Students 2-6 in offerings 1-3 (Spring 2026)
(2, 1, 'active'), (2, 2, 'active'), (2, 3, 'active'),
(3, 1, 'active'), (3, 2, 'active'), (3, 3, 'active'),
(4, 1, 'active'), (4, 2, 'active'), (4, 4, 'active'),
(5, 1, 'active'), (5, 2, 'active'), (5, 5, 'active'),
(6, 7, 'active'), (6, 8, 'active'),
(7, 7, 'active'), (7, 8, 'active'),
-- Past semester enrollments (completed)
(1, 12, 'completed'), (1, 13, 'completed'), (1, 14, 'completed'),
(2, 12, 'completed'), (2, 13, 'completed'), (2, 14, 'completed'),
(3, 12, 'completed'), (3, 13, 'completed'),
(8, 1, 'active'), (9, 1, 'active');

-- ---------- MORE RESULTS (20+ records) ----------
INSERT INTO results (enrollment_id, grade_code, total_mark, published_at, locked) VALUES
-- Past semester results for student 1 (enrollment IDs from above, starting at 23)
(23, 'A', 78, '2025-12-20 10:00:00', TRUE),
(24, 'A+', 85, '2025-12-20 10:00:00', TRUE),
(25, 'B+', 67, '2025-12-20 10:00:00', TRUE),
-- Past semester results for student 2
(26, 'A-', 72, '2025-12-20 10:00:00', TRUE),
(27, 'B+', 68, '2025-12-20 10:00:00', TRUE),
(28, 'A', 76, '2025-12-20 10:00:00', TRUE),
-- Past semester results for student 3
(29, 'B', 62, '2025-12-20 10:00:00', TRUE),
(30, 'A-', 71, '2025-12-20 10:00:00', TRUE);

-- ---------- MORE EXAM MARKS (20+ records) ----------
-- Other students' marks for existing exams (exams 1-15 exist)
INSERT INTO exam_marks (exam_id, student_id, obtained_marks, is_published, published_at) VALUES
-- Student 2 marks
(1, 2, 8, TRUE, '2026-02-15'), (2, 2, 7, TRUE, '2026-02-22'),
(3, 2, 18, TRUE, '2026-03-01'), (4, 2, 22, TRUE, '2026-03-15'),
(5, 2, 35, TRUE, '2026-03-20'), (6, 2, 9, TRUE, '2026-02-20'),
-- Student 3 marks
(1, 3, 9, TRUE, '2026-02-15'), (2, 3, 6, TRUE, '2026-02-22'),
(3, 3, 15, TRUE, '2026-03-01'), (4, 3, 24, TRUE, '2026-03-15'),
(5, 3, 38, TRUE, '2026-03-20'),
-- Student 4 marks
(1, 4, 7, TRUE, '2026-02-15'), (2, 4, 8, TRUE, '2026-02-22'),
(3, 4, 20, TRUE, '2026-03-01'), (4, 4, 19, TRUE, '2026-03-15'),
-- Student 5 marks
(1, 5, 10, TRUE, '2026-02-15'), (2, 5, 9, TRUE, '2026-02-22'),
(3, 5, 22, TRUE, '2026-03-01'), (4, 5, 25, TRUE, '2026-03-15'),
(5, 5, 42, TRUE, '2026-03-20');

-- ---------- MORE CLASS SESSIONS (20+ records) ----------
INSERT INTO class_sessions (offering_id, session_date, day_of_week, start_time, end_time, room, session_type, status) VALUES
-- More sessions for offering 1 (CSE701 Sec A)
(1, '2026-02-08', 'Saturday', '08:00:00', '09:30:00', 'AB4-304', 'lecture', 'completed'),
(1, '2026-02-10', 'Monday',   '08:00:00', '09:30:00', 'AB4-304', 'lecture', 'completed'),
(1, '2026-02-15', 'Saturday', '08:00:00', '09:30:00', 'AB4-304', 'lecture', 'completed'),
(1, '2026-02-17', 'Monday',   '08:00:00', '09:30:00', 'AB4-304', 'lecture', 'completed'),
(1, '2026-03-01', 'Saturday', '08:00:00', '09:30:00', 'AB4-304', 'lecture', 'completed'),
(1, '2026-03-03', 'Monday',   '08:00:00', '09:30:00', 'AB4-304', 'lab',     'completed'),
-- Sessions for offering 2 (CSE702)
(2, '2026-02-09', 'Sunday',   '10:00:00', '11:30:00', 'AB5-501', 'lecture', 'completed'),
(2, '2026-02-11', 'Tuesday',  '10:00:00', '11:30:00', 'AB5-501', 'lecture', 'completed'),
(2, '2026-02-16', 'Sunday',   '10:00:00', '11:30:00', 'AB5-501', 'lecture', 'completed'),
(2, '2026-02-18', 'Tuesday',  '10:00:00', '11:30:00', 'AB5-501', 'lab',     'completed'),
(2, '2026-03-02', 'Sunday',   '10:00:00', '11:30:00', 'AB5-501', 'lecture', 'completed'),
-- Offering 7 (CSE701 Sec B)
(7, '2026-02-08', 'Saturday', '10:00:00', '11:30:00', 'AB4-306', 'lecture', 'completed'),
(7, '2026-02-10', 'Monday',   '10:00:00', '11:30:00', 'AB4-306', 'lecture', 'completed'),
(7, '2026-02-15', 'Saturday', '10:00:00', '11:30:00', 'AB4-306', 'lecture', 'completed');

-- ---------- MORE ATTENDANCE RECORDS (20+ records) ----------
-- Student 2 attendance
INSERT INTO attendance_records (session_id, student_id, status, marked_by) VALUES
(10, 2, 'P', 2), (11, 2, 'P', 2), (12, 2, 'A', 2), (13, 2, 'P', 2), (14, 2, 'P', 2), (15, 2, 'L', 2),
-- Student 3 attendance
(10, 3, 'P', 2), (11, 3, 'P', 2), (12, 3, 'P', 2), (13, 3, 'A', 2), (14, 3, 'P', 2), (15, 3, 'P', 2),
-- Student 4 attendance
(10, 4, 'P', 2), (11, 4, 'A', 2), (12, 4, 'P', 2), (13, 4, 'P', 2),
-- Student 5 attendance
(10, 5, 'P', 2), (11, 5, 'P', 2), (12, 5, 'P', 2), (13, 5, 'P', 2), (14, 5, 'P', 2),
-- Students in offering 2 sessions
(16, 1, 'P', 3), (17, 1, 'P', 3), (18, 1, 'A', 3), (19, 1, 'P', 3), (20, 1, 'P', 3),
(16, 2, 'P', 3), (17, 2, 'A', 3), (18, 2, 'P', 3), (19, 2, 'P', 3);

-- ---------- MORE INVOICES & PAYMENTS (20+ records each) ----------
INSERT INTO student_invoices (student_id, semester_id, invoice_no, issue_date, due_date, status) VALUES
(2, 7, 'INV-2026-0002', '2026-01-01', '2026-02-15', 'paid'),
(3, 7, 'INV-2026-0003', '2026-01-01', '2026-02-15', 'partial'),
(4, 7, 'INV-2026-0004', '2026-01-01', '2026-02-15', 'pending'),
(5, 7, 'INV-2026-0005', '2026-01-01', '2026-02-15', 'paid'),
(6, 7, 'INV-2026-0006', '2026-01-01', '2026-02-15', 'overdue'),
(7, 7, 'INV-2026-0007', '2026-01-01', '2026-02-15', 'paid'),
(8, 7, 'INV-2026-0008', '2026-01-01', '2026-02-15', 'partial'),
(9, 7, 'INV-2026-0009', '2026-01-01', '2026-02-15', 'pending'),
(10, 7, 'INV-2026-0010', '2026-01-01', '2026-02-15', 'paid'),
(11, 7, 'INV-2026-0011', '2026-01-01', '2026-02-15', 'paid'),
-- Past semester invoices
(1, 6, 'INV-2025-0001', '2025-07-01', '2025-08-15', 'paid'),
(2, 6, 'INV-2025-0002', '2025-07-01', '2025-08-15', 'paid'),
(3, 6, 'INV-2025-0003', '2025-07-01', '2025-08-15', 'paid'),
(4, 6, 'INV-2025-0004', '2025-07-01', '2025-08-15', 'paid'),
(5, 6, 'INV-2025-0005', '2025-07-01', '2025-08-15', 'paid'),
(12, 7, 'INV-2026-0012', '2026-01-01', '2026-02-15', 'paid'),
(13, 7, 'INV-2026-0013', '2026-01-01', '2026-02-15', 'partial'),
(14, 7, 'INV-2026-0014', '2026-01-01', '2026-02-15', 'paid'),
(15, 7, 'INV-2026-0015', '2026-01-01', '2026-02-15', 'pending'),
(16, 7, 'INV-2026-0016', '2026-01-01', '2026-02-15', 'paid');

-- Invoice items for new invoices (invoices 2-21)
INSERT INTO invoice_items (invoice_id, fee_head_id, amount) VALUES
(2,1,55000),(2,2,8000),(2,3,3000),(2,4,5000),(2,5,10000),(2,6,4000),
(3,1,55000),(3,2,8000),(3,3,3000),(3,4,5000),(3,5,10000),(3,6,4000),
(4,1,55000),(4,2,8000),(4,3,3000),(4,4,5000),(4,5,10000),(4,6,4000),
(5,1,55000),(5,2,8000),(5,3,3000),(5,4,5000),(5,5,10000),(5,6,4000),
(6,1,55000),(6,2,8000),(6,3,3000),(6,4,5000),(6,5,10000),(6,6,4000),
(7,1,55000),(7,2,8000),(7,3,3000),(7,4,5000),(7,5,10000),(7,6,4000),
(8,1,55000),(8,2,8000),(8,3,3000),(8,4,5000),(8,5,10000),(8,6,4000),
(9,1,55000),(9,2,8000),(9,3,3000),(9,4,5000),(9,5,10000),(9,6,4000),
(10,1,55000),(10,2,8000),(10,3,3000),(10,4,5000),(10,5,10000),(10,6,4000),
(11,1,55000),(11,2,8000),(11,3,3000),(11,4,5000),(11,5,10000),(11,6,4000);

-- Payments for invoices
INSERT INTO payments (invoice_id, amount, method, reference_no, receipt_no, recorded_by) VALUES
(2, 85000, 'bKash',  'BK20260102', 'RCP-2026-0002', 7),
(3, 50000, 'Nagad',  'NG20260103', 'RCP-2026-0003', 7),
(5, 85000, 'Bank',   'BN20260105', 'RCP-2026-0005', 7),
(7, 85000, 'Card',   'CD20260107', 'RCP-2026-0007', 7),
(8, 40000, 'bKash',  'BK20260108', 'RCP-2026-0008', 7),
(10, 85000, 'Bank',  'BN20260110', 'RCP-2026-0010', 7),
(11, 85000, 'Nagad', 'NG20260111', 'RCP-2026-0011', 7),
-- Past semester payments
(12, 85000, 'bKash', 'BK20250801', 'RCP-2025-0001', 7),
(13, 85000, 'Bank',  'BN20250802', 'RCP-2025-0002', 7),
(14, 85000, 'Nagad', 'NG20250803', 'RCP-2025-0003', 7),
(15, 85000, 'Card',  'CD20250804', 'RCP-2025-0004', 7),
(16, 85000, 'Cash',  'CS20250805', 'RCP-2025-0005', 7),
(17, 85000, 'bKash', 'BK20260112', 'RCP-2026-0012', 7),
(18, 45000, 'Nagad', 'NG20260113', 'RCP-2026-0013', 7),
(19, 85000, 'Bank',  'BN20260114', 'RCP-2026-0014', 7),
(21, 85000, 'Card',  'CD20260116', 'RCP-2026-0016', 7);

-- ---------- MORE HOSTEL ROOMS & ALLOCATIONS (20+ records) ----------
INSERT INTO hostel_rooms (hostel_name, hostel_type, room_no, floor, room_type, capacity, warden_name, warden_phone, warden_email) VALUES
('Daffodil Tower', 'Boys', 'A-305', 3, 'Double', 2, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-306', 3, 'Triple', 3, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-401', 4, 'Single', 1, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-402', 4, 'Double', 2, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-403', 4, 'Triple', 3, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-501', 5, 'Double', 2, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Daffodil Tower', 'Boys', 'A-502', 5, 'Double', 2, 'Mr. Kamal Ahmed', '+8801799000001', 'kamal.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-101', 1, 'Double', 2, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-102', 1, 'Triple', 3, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-201', 2, 'Double', 2, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-202', 2, 'Single', 1, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-301', 3, 'Double', 2, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Rose Hall', 'Girls', 'B-302', 3, 'Triple', 3, 'Ms. Fatema Begum', '+8801799000002', 'fatema.warden@diu.edu.bd'),
('Lily Court', 'Girls', 'C-101', 1, 'Double', 2, 'Ms. Rahima Khatun', '+8801799000003', 'rahima.warden@diu.edu.bd'),
('Lily Court', 'Girls', 'C-102', 1, 'Single', 1, 'Ms. Rahima Khatun', '+8801799000003', 'rahima.warden@diu.edu.bd'),
('Lily Court', 'Girls', 'C-201', 2, 'Double', 2, 'Ms. Rahima Khatun', '+8801799000003', 'rahima.warden@diu.edu.bd'),
('Orchid Villa', 'Boys', 'D-101', 1, 'Triple', 3, 'Mr. Nasir Uddin', '+8801799000004', 'nasir.warden@diu.edu.bd'),
('Orchid Villa', 'Boys', 'D-102', 1, 'Double', 2, 'Mr. Nasir Uddin', '+8801799000004', 'nasir.warden@diu.edu.bd'),
('Orchid Villa', 'Boys', 'D-201', 2, 'Double', 2, 'Mr. Nasir Uddin', '+8801799000004', 'nasir.warden@diu.edu.bd'),
('Orchid Villa', 'Boys', 'D-202', 2, 'Single', 1, 'Mr. Nasir Uddin', '+8801799000004', 'nasir.warden@diu.edu.bd');

-- Room allocations (20+ records)
INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, end_date, annual_fee, fee_paid, status) VALUES
(2, 2, 'B1', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(3, 2, 'B2', '2026-01-15', '2026-12-31', 48000.00, 24000.00, 'active'),
(4, 3, 'B1', '2026-01-15', '2026-12-31', 42000.00, 42000.00, 'active'),
(5, 3, 'B2', '2026-01-15', '2026-12-31', 42000.00, 42000.00, 'active'),
(6, 4, 'B1', '2026-01-15', '2026-12-31', 60000.00, 30000.00, 'active'),
(7, 5, 'B1', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(8, 5, 'B2', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(9, 6, 'B1', '2026-01-15', '2026-12-31', 48000.00, 24000.00, 'active'),
(10, 6, 'B2', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(11, 8, 'B1', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(12, 8, 'B2', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(13, 9, 'B1', '2026-01-15', '2026-12-31', 42000.00, 42000.00, 'active'),
(14, 9, 'B2', '2026-01-15', '2026-12-31', 42000.00, 21000.00, 'active'),
(15, 10, 'B1', '2026-01-15', '2026-12-31', 48000.00, 48000.00, 'active'),
(16, 11, 'B1', '2026-01-15', '2026-12-31', 60000.00, 60000.00, 'active'),
-- Past allocations
(1, 2, 'B1', '2025-01-15', '2025-12-31', 45000.00, 45000.00, 'completed'),
(2, 3, 'B1', '2025-01-15', '2025-12-31', 40000.00, 40000.00, 'completed'),
(3, 4, 'B1', '2025-01-15', '2025-12-31', 55000.00, 55000.00, 'completed'),
(4, 5, 'B1', '2025-01-15', '2025-12-31', 45000.00, 45000.00, 'completed'),
(5, 6, 'B1', '2025-01-15', '2025-12-31', 45000.00, 45000.00, 'completed');

-- ---------- MORE TRANSPORT ROUTES & SUBSCRIPTIONS (20+ records) ----------
INSERT INTO transport_routes (route_name, start_point, end_point, vehicle_no, vehicle_capacity, driver_name, driver_phone, stops_json) VALUES
('Mirpur Express', 'Mirpur-10', 'DIU Campus', 'DHA-KA-11-2222', 52, 'Anwar Hossain', '+8801899000002',
 '[{"name":"Mirpur-10","time":"07:00"},{"name":"Mirpur-12","time":"07:10"},{"name":"Pallabi","time":"07:20"},{"name":"Ashulia","time":"07:40"},{"name":"DIU Campus","time":"08:00"}]'),
('Uttara Line', 'Uttara Sector-3', 'DIU Campus', 'DHA-KA-11-3333', 48, 'Shahidul Islam', '+8801899000003',
 '[{"name":"Uttara Sector-3","time":"07:00"},{"name":"Uttara Sector-10","time":"07:10"},{"name":"Airport","time":"07:25"},{"name":"Ashulia","time":"07:45"},{"name":"DIU Campus","time":"08:00"}]'),
('Mohammadpur Route', 'Mohammadpur Bus Stand', 'DIU Campus', 'DHA-KA-11-4444', 45, 'Jamal Mia', '+8801899000004',
 '[{"name":"Mohammadpur","time":"06:45"},{"name":"Shyamoli","time":"06:55"},{"name":"Technical Mor","time":"07:05"},{"name":"Savar","time":"07:30"},{"name":"DIU Campus","time":"07:50"}]'),
('Gulshan Express', 'Gulshan-2', 'DIU Campus', 'DHA-KA-11-5555', 40, 'Rahim Uddin', '+8801899000005',
 '[{"name":"Gulshan-2","time":"06:45"},{"name":"Mohakhali","time":"07:00"},{"name":"Banani","time":"07:10"},{"name":"Airport","time":"07:25"},{"name":"DIU Campus","time":"07:55"}]'),
('Motijheel Route', 'Motijheel', 'DIU Campus', 'DHA-KA-11-6666', 50, 'Abdul Hakim', '+8801899000006',
 '[{"name":"Motijheel","time":"06:30"},{"name":"Farmgate","time":"06:50"},{"name":"Asad Gate","time":"07:05"},{"name":"Savar","time":"07:30"},{"name":"DIU Campus","time":"07:50"}]'),
('Gazipur Line', 'Gazipur Chowrasta', 'DIU Campus', 'DHA-GA-22-1111', 52, 'Karim Sheikh', '+8801899000007',
 '[{"name":"Gazipur Chowrasta","time":"07:00"},{"name":"Board Bazar","time":"07:15"},{"name":"Konabari","time":"07:30"},{"name":"DIU Campus","time":"07:45"}]'),
('Savar Local', 'Savar Bus Stand', 'DIU Campus', 'DHA-SA-33-1111', 35, 'Monir Hossain', '+8801899000008',
 '[{"name":"Savar Bus Stand","time":"07:30"},{"name":"Savar Bazar","time":"07:35"},{"name":"Hemayetpur","time":"07:40"},{"name":"DIU Campus","time":"07:50"}]'),
('Narayanganj Express', 'Narayanganj', 'DIU Campus', 'DHA-NA-44-1111', 48, 'Farid Ahmed', '+8801899000009',
 '[{"name":"Narayanganj","time":"06:15"},{"name":"Signboard","time":"06:35"},{"name":"Jatrabari","time":"06:50"},{"name":"Farmgate","time":"07:10"},{"name":"DIU Campus","time":"07:55"}]'),
('Tongi Route', 'Tongi Station', 'DIU Campus', 'DHA-GA-22-2222', 45, 'Sumon Ali', '+8801899000010',
 '[{"name":"Tongi Station","time":"07:00"},{"name":"Abdullahpur","time":"07:10"},{"name":"Ashulia Bazar","time":"07:30"},{"name":"DIU Campus","time":"07:45"}]');

-- Transport subscriptions (20+ records)
INSERT INTO transport_subscriptions (student_id, route_id, pickup_point, pickup_time, semester_id, fee_amount, fee_paid, status) VALUES
(2, 2, 'Mirpur-10', '07:00:00', 7, 6000.00, 6000.00, 'active'),
(3, 2, 'Mirpur-12', '07:10:00', 7, 6000.00, 3000.00, 'active'),
(4, 3, 'Uttara Sector-3', '07:00:00', 7, 7000.00, 7000.00, 'active'),
(5, 3, 'Airport', '07:25:00', 7, 5000.00, 5000.00, 'active'),
(6, 4, 'Mohammadpur', '06:45:00', 7, 6500.00, 6500.00, 'active'),
(7, 4, 'Shyamoli', '06:55:00', 7, 6000.00, 6000.00, 'active'),
(8, 5, 'Gulshan-2', '06:45:00', 7, 8000.00, 8000.00, 'active'),
(9, 6, 'Motijheel', '06:30:00', 7, 7500.00, 7500.00, 'active'),
(10, 6, 'Farmgate', '06:50:00', 7, 6000.00, 3000.00, 'active'),
(11, 7, 'Gazipur Chowrasta', '07:00:00', 7, 5000.00, 5000.00, 'active'),
(12, 7, 'Board Bazar', '07:15:00', 7, 4500.00, 4500.00, 'active'),
(13, 8, 'Savar Bus Stand', '07:30:00', 7, 3000.00, 3000.00, 'active'),
(14, 9, 'Narayanganj', '06:15:00', 7, 9000.00, 9000.00, 'active'),
(15, 10, 'Tongi Station', '07:00:00', 7, 5500.00, 5500.00, 'active'),
(16, 2, 'Pallabi', '07:20:00', 7, 5500.00, 5500.00, 'active'),
-- Past semester subscriptions
(1, 1, 'Dhanmondi-27', '07:00:00', 6, 5500.00, 5500.00, 'completed'),
(2, 2, 'Mirpur-10', '07:00:00', 6, 5500.00, 5500.00, 'completed'),
(3, 3, 'Uttara Sector-3', '07:00:00', 6, 6500.00, 6500.00, 'completed'),
(4, 4, 'Mohammadpur', '06:45:00', 6, 6000.00, 6000.00, 'completed'),
(5, 5, 'Gulshan-2', '06:45:00', 6, 7500.00, 7500.00, 'completed');

-- ---------- NOTICES (25 records) ----------
INSERT INTO notices (title, body, audience, dept_id, posted_by, priority, pinned, published_at, expires_at) VALUES
('Spring 2026 Semester Registration Open', 'Dear Students,\n\nSpring 2026 semester course registration is now open. Please complete your registration before the deadline.\n\nDeadline: February 28, 2026\n\nRegistrar Office', 'student', NULL, 1, 'urgent', TRUE, '2026-01-05 09:00:00', '2026-02-28 23:59:59'),
('Midterm Examination Schedule Published', 'The midterm examination schedule for Spring 2026 has been published. Please check the exam schedule page for details.\n\nExam Controller', 'student', NULL, 1, 'important', TRUE, '2026-02-20 10:00:00', '2026-04-15 23:59:59'),
('Library Extended Hours During Exam Week', 'The central library will remain open until 10:00 PM during the midterm exam week (March 15-22, 2026).\n\nLibrary Management', 'all', NULL, 1, 'normal', FALSE, '2026-03-10 09:00:00', '2026-03-25 23:59:59'),
('Faculty Meeting - March 2026', 'All faculty members are requested to attend the monthly faculty meeting on March 5, 2026 at 3:00 PM in the Conference Hall.\n\nDean Office', 'faculty', NULL, 1, 'important', FALSE, '2026-02-25 10:00:00', '2026-03-05 23:59:59'),
('Scholarship Application Deadline', 'Applications for the DIU Merit Scholarship are due by March 30, 2026. Eligible students must have a minimum CGPA of 3.50.\n\nScholarship Office', 'student', NULL, 1, 'urgent', TRUE, '2026-02-15 09:00:00', '2026-03-30 23:59:59'),
('CSE Department Workshop on AI', 'The CSE department is organizing a workshop on Artificial Intelligence and Machine Learning on March 20, 2026.\n\nDr. Sheak Rashed Haider Noori', 'all', 1, 5, 'normal', FALSE, '2026-03-01 10:00:00', '2026-03-20 23:59:59'),
('Hostel Fee Payment Reminder', 'Students residing in university hostels are reminded to pay their hostel fees before March 15, 2026 to avoid late charges.\n\nHostel Office', 'student', NULL, 1, 'important', FALSE, '2026-03-01 09:00:00', '2026-03-15 23:59:59'),
('Transport Route Changes', 'Due to road construction, the Dhanmondi Express route will be modified from March 10, 2026. New pickup times will be shared separately.\n\nTransport Office', 'student', NULL, 1, 'normal', FALSE, '2026-03-05 10:00:00', '2026-04-10 23:59:59'),
('Annual Sports Week 2026', 'DIU Annual Sports Week will be held from April 5-10, 2026. All students are encouraged to participate. Registration starts March 15.\n\nDSA Office', 'all', NULL, 1, 'normal', FALSE, '2026-03-10 09:00:00', '2026-04-10 23:59:59'),
('Course Evaluation Period Open', 'Online course evaluation for Spring 2026 is now open. Your anonymous feedback helps improve teaching quality. Deadline: April 15.\n\nQuality Assurance', 'student', NULL, 1, 'important', FALSE, '2026-03-25 10:00:00', '2026-04-15 23:59:59'),
('Research Publication Grant', 'Faculty members are invited to apply for the DIU Research Publication Grant 2026. Deadline: April 30, 2026.\n\nResearch Office', 'faculty', NULL, 1, 'normal', FALSE, '2026-03-15 10:00:00', '2026-04-30 23:59:59'),
('Semester Final Exam Routine', 'The final exam routine for Spring 2026 will be published on April 20, 2026. Keep checking the portal.\n\nExam Controller', 'student', NULL, 1, 'important', FALSE, '2026-04-01 09:00:00', '2026-05-30 23:59:59'),
('EEE Department Seminar', 'A seminar on Renewable Energy Solutions will be held on March 28, 2026 at 2:00 PM in Auditorium Hall.\n\nDr. Abdul Karim', 'all', 2, 9, 'normal', FALSE, '2026-03-15 10:00:00', '2026-03-28 23:59:59'),
('Clearance Process for Final Year', 'All final year students must complete their academic clearance before May 15, 2026. Visit the clearance page on the portal.\n\nRegistrar Office', 'student', NULL, 1, 'urgent', TRUE, '2026-03-20 09:00:00', '2026-05-15 23:59:59'),
('Programming Contest Registration', 'Register for the Intra-University Programming Contest by March 25, 2026. Open for all CSE and SWE students.\n\nCSE Club', 'student', 1, 5, 'normal', FALSE, '2026-03-10 10:00:00', '2026-03-25 23:59:59'),
('Holiday Notice - Independence Day', 'The university will remain closed on March 26, 2026 (Independence Day). Regular classes resume on March 27.\n\nAdmin Office', 'all', NULL, 1, 'normal', FALSE, '2026-03-20 09:00:00', '2026-03-27 23:59:59'),
('Faculty Leave Calendar Updated', 'The faculty leave calendar for Spring 2026 has been updated. Please check for any scheduling conflicts.\n\nHR Department', 'faculty', NULL, 1, 'normal', FALSE, '2026-02-01 10:00:00', NULL),
('New Lab Equipment Arrived', 'New networking and IoT lab equipment has been installed in AB4-Lab3. CSE faculty can schedule lab sessions.\n\nIT Department', 'faculty', 1, 4, 'normal', FALSE, '2026-03-12 10:00:00', NULL),
('Blood Donation Camp', 'DIU is organizing a blood donation camp on April 2, 2026. Interested students and faculty can register at the DSA office.\n\nDSA Office', 'all', NULL, 1, 'normal', FALSE, '2026-03-20 09:00:00', '2026-04-02 23:59:59'),
('Wi-Fi Password Changed', 'The campus Wi-Fi password has been updated. New credentials: SSID: DIU-Student, Password available at IT help desk.\n\nIT Support', 'all', NULL, 1, 'normal', FALSE, '2026-03-01 08:00:00', NULL),
('Internship Fair 2026', 'DIU Internship Fair will be held on April 15, 2026. Over 50 companies confirmed. Bring your CV!\n\nPlacement Cell', 'student', NULL, 1, 'important', TRUE, '2026-03-25 09:00:00', '2026-04-15 23:59:59'),
('BBA Department Case Study Competition', 'The BBA department invites students to participate in the Annual Case Study Competition. Registration open until March 28.\n\nDept of BBA', 'student', 3, 10, 'normal', FALSE, '2026-03-15 10:00:00', '2026-03-28 23:59:59'),
('Server Maintenance Notice', 'The student portal will undergo maintenance on March 30, 2026 from 2:00 AM to 5:00 AM. Services may be temporarily unavailable.\n\nIT Department', 'all', NULL, 1, 'important', FALSE, '2026-03-28 10:00:00', '2026-03-30 23:59:59'),
('Convocation 2026 Registration', 'Graduating students of 2025-2026 batch can now register for the Annual Convocation ceremony. Deadline: May 1, 2026.\n\nRegistrar Office', 'student', NULL, 1, 'urgent', FALSE, '2026-04-01 09:00:00', '2026-05-01 23:59:59'),
('Faculty Development Program', 'A 3-day Faculty Development Program on Modern Teaching Methods will be held April 8-10, 2026. Registration required.\n\nIQAC', 'faculty', NULL, 1, 'normal', FALSE, '2026-03-20 10:00:00', '2026-04-08 23:59:59');

-- Mark some notices as read
INSERT INTO notice_reads (notice_id, user_id) VALUES
(1, 8), (2, 8), (5, 8), (6, 8), (9, 8), (10, 8),
(1, 12), (2, 12), (1, 13), (2, 13), (1, 14),
(4, 2), (4, 3), (4, 4), (4, 5), (4, 6),
(11, 2), (11, 3), (17, 2), (18, 2), (18, 3);

-- ---------- EVALUATION DATA ----------
INSERT INTO evaluation_forms (offering_id, semester_id, open_date, close_date, status) VALUES
(1, 7, '2026-03-25', '2026-04-15', 'open'),
(2, 7, '2026-03-25', '2026-04-15', 'open'),
(3, 7, '2026-03-25', '2026-04-15', 'open'),
(4, 7, '2026-03-25', '2026-04-15', 'open'),
(5, 7, '2026-03-25', '2026-04-15', 'open'),
(6, 7, '2026-03-25', '2026-04-15', 'open');

INSERT INTO evaluation_responses (form_id, student_id, q_teaching, q_content, q_assessment, q_environment, q_overall, comments, submitted_at) VALUES
(1, 1, 5, 4, 4, 5, 5, 'Excellent teaching methodology. Very engaging lectures.', '2026-03-26 10:00:00'),
(1, 2, 4, 5, 4, 4, 4, 'Good course content but could use more practical examples.', '2026-03-26 11:00:00'),
(1, 3, 5, 5, 5, 4, 5, 'Best course this semester. Highly recommended.', '2026-03-27 09:00:00'),
(1, 4, 3, 4, 3, 4, 4, 'Good overall but assessment criteria could be clearer.', '2026-03-27 10:00:00'),
(1, 5, 4, 4, 4, 5, 4, NULL, '2026-03-28 09:00:00'),
(2, 1, 4, 4, 3, 4, 4, 'Good course but could be more organized.', '2026-03-26 10:30:00'),
(2, 2, 5, 5, 4, 4, 5, 'Very well structured course with excellent materials.', '2026-03-26 11:30:00'),
(2, 3, 4, 3, 4, 4, 4, NULL, '2026-03-27 09:30:00'),
(3, 1, 3, 3, 4, 3, 3, 'Average course. Needs improvement in delivery.', '2026-03-26 11:00:00'),
(3, 2, 4, 4, 3, 4, 4, 'Decent course content.', '2026-03-27 10:00:00'),
(3, 4, 4, 5, 4, 4, 4, 'Material was great, more practice problems needed.', '2026-03-28 10:00:00'),
(4, 1, 5, 5, 5, 5, 5, 'Outstanding! One of the best courses I have taken.', '2026-03-26 14:00:00'),
(4, 4, 4, 4, 4, 4, 4, NULL, '2026-03-28 11:00:00'),
(5, 1, 4, 4, 3, 4, 4, 'Good introduction to the topic.', '2026-03-27 14:00:00'),
(5, 5, 5, 4, 5, 4, 5, 'Really enjoyed this course.', '2026-03-28 14:00:00');

-- ---------- FACULTY LEAVE DATA (20+ records) ----------
INSERT INTO faculty_leave_requests (faculty_user_id, leave_type, start_date, end_date, reason, status, approved_by, comments, created_at) VALUES
(2, 'casual', '2026-01-20', '2026-01-20', 'Personal work', 'approved', 1, 'Approved', '2026-01-15 10:00:00'),
(2, 'sick', '2026-02-10', '2026-02-12', 'Flu and fever', 'approved', 1, 'Get well soon', '2026-02-09 08:00:00'),
(3, 'casual', '2026-01-25', '2026-01-26', 'Family event', 'approved', 1, NULL, '2026-01-20 09:00:00'),
(3, 'study', '2026-03-15', '2026-03-20', 'Attending IEEE conference in Singapore', 'approved', 1, 'Conference travel approved', '2026-02-28 10:00:00'),
(4, 'casual', '2026-02-05', '2026-02-05', 'Doctor appointment', 'approved', 1, NULL, '2026-02-01 10:00:00'),
(4, 'annual', '2026-04-15', '2026-04-20', 'Annual leave for family vacation', 'pending', NULL, NULL, '2026-03-25 09:00:00'),
(5, 'sick', '2026-01-28', '2026-01-30', 'Back pain and physiotherapy', 'approved', 1, NULL, '2026-01-27 08:00:00'),
(5, 'casual', '2026-03-10', '2026-03-10', 'Personal matter', 'approved', 1, NULL, '2026-03-05 10:00:00'),
(6, 'casual', '2026-02-15', '2026-02-15', 'Child school event', 'approved', 1, NULL, '2026-02-10 09:00:00'),
(6, 'study', '2026-05-01', '2026-05-10', 'Research collaboration at BUET', 'pending', NULL, NULL, '2026-04-01 10:00:00'),
(9, 'casual', '2026-01-22', '2026-01-22', 'Family ceremony', 'approved', 1, NULL, '2026-01-18 10:00:00'),
(9, 'sick', '2026-03-05', '2026-03-07', 'Dengue fever recovery', 'approved', 1, 'Take rest', '2026-03-04 07:00:00'),
(10, 'annual', '2026-02-20', '2026-02-25', 'Family vacation to Cox Bazar', 'approved', 1, NULL, '2026-02-10 10:00:00'),
(10, 'casual', '2026-03-18', '2026-03-18', 'Personal work', 'rejected', 1, 'Midterm exam week - cannot approve', '2026-03-15 09:00:00'),
(11, 'casual', '2026-01-30', '2026-01-30', 'Visa appointment', 'approved', 1, NULL, '2026-01-25 10:00:00'),
(11, 'study', '2026-04-25', '2026-04-30', 'Workshop on embedded systems at IIT', 'pending', NULL, NULL, '2026-04-01 09:00:00'),
(2, 'casual', '2026-03-25', '2026-03-25', 'Banking work', 'approved', 1, NULL, '2026-03-20 10:00:00'),
(3, 'sick', '2026-04-02', '2026-04-03', 'Viral infection', 'approved', 1, NULL, '2026-04-01 07:00:00'),
(5, 'casual', '2026-04-10', '2026-04-10', 'Passport renewal', 'pending', NULL, NULL, '2026-04-05 09:00:00'),
(9, 'annual', '2026-05-05', '2026-05-12', 'Summer vacation', 'pending', NULL, NULL, '2026-04-10 10:00:00');

-- ---------- REGISTRATION DATA ----------
INSERT INTO registration_requests (student_id, semester_id, status, submitted_at, approved_by, created_at) VALUES
(1, 7, 'approved', '2026-01-10 10:00:00', 1, '2026-01-08 09:00:00'),
(2, 7, 'approved', '2026-01-10 11:00:00', 1, '2026-01-08 10:00:00'),
(3, 7, 'approved', '2026-01-11 09:00:00', 1, '2026-01-09 09:00:00'),
(4, 7, 'approved', '2026-01-11 10:00:00', 1, '2026-01-09 10:00:00'),
(5, 7, 'approved', '2026-01-11 11:00:00', 1, '2026-01-09 11:00:00'),
(6, 7, 'approved', '2026-01-12 09:00:00', 1, '2026-01-10 09:00:00'),
(7, 7, 'approved', '2026-01-12 10:00:00', 1, '2026-01-10 10:00:00'),
(8, 7, 'submitted', '2026-04-01 09:00:00', NULL, '2026-03-28 09:00:00'),
(9, 7, 'submitted', '2026-04-01 10:00:00', NULL, '2026-03-28 10:00:00'),
(10, 7, 'approved', '2026-01-12 11:00:00', 1, '2026-01-10 11:00:00'),
(11, 7, 'approved', '2026-01-13 09:00:00', 1, '2026-01-11 09:00:00'),
(12, 7, 'approved', '2026-01-13 10:00:00', 1, '2026-01-11 10:00:00'),
(13, 7, 'draft', NULL, NULL, '2026-04-05 09:00:00'),
(14, 7, 'submitted', '2026-04-05 10:00:00', NULL, '2026-04-03 10:00:00'),
(15, 7, 'rejected', '2026-01-10 09:00:00', 1, '2026-01-08 09:00:00'),
(16, 7, 'approved', '2026-01-13 11:00:00', 1, '2026-01-11 11:00:00'),
-- Past semester
(1, 6, 'approved', '2025-07-10 10:00:00', 1, '2025-07-08 09:00:00'),
(2, 6, 'approved', '2025-07-10 11:00:00', 1, '2025-07-08 10:00:00'),
(3, 6, 'approved', '2025-07-11 09:00:00', 1, '2025-07-09 09:00:00'),
(4, 6, 'approved', '2025-07-11 10:00:00', 1, '2025-07-09 10:00:00');

-- Registration items
INSERT INTO registration_items (request_id, offering_id, action) VALUES
(1, 1, 'add'), (1, 2, 'add'), (1, 3, 'add'), (1, 4, 'add'), (1, 5, 'add'), (1, 6, 'add'),
(2, 1, 'add'), (2, 2, 'add'), (2, 3, 'add'),
(3, 1, 'add'), (3, 2, 'add'), (3, 3, 'add'),
(4, 1, 'add'), (4, 2, 'add'), (4, 4, 'add'),
(5, 1, 'add'), (5, 2, 'add'), (5, 5, 'add'),
(6, 7, 'add'), (6, 8, 'add'),
(7, 7, 'add'), (7, 8, 'add'),
(8, 9, 'add'), (8, 10, 'add'),
(9, 9, 'add'), (9, 11, 'add');

-- ---------- CLEARANCE DATA ----------
INSERT INTO clearance_requests (student_id, semester_id, type, status, created_at) VALUES
(1, 7, 'semester', 'in_progress', '2026-04-01 10:00:00'),
(2, 7, 'semester', 'cleared', '2026-03-25 10:00:00'),
(3, 7, 'semester', 'pending', '2026-04-05 10:00:00'),
(4, 7, 'semester', 'in_progress', '2026-04-02 10:00:00'),
(5, 7, 'final', 'in_progress', '2026-03-28 10:00:00'),
(6, 7, 'semester', 'cleared', '2026-03-20 10:00:00'),
(7, 7, 'semester', 'cleared', '2026-03-22 10:00:00'),
(8, 7, 'semester', 'pending', '2026-04-10 10:00:00'),
(9, 7, 'semester', 'pending', '2026-04-10 11:00:00'),
(10, 7, 'semester', 'cleared', '2026-03-23 10:00:00'),
(11, 7, 'semester', 'cleared', '2026-03-24 10:00:00'),
-- Past semester
(1, 6, 'semester', 'cleared', '2025-11-01 10:00:00'),
(2, 6, 'semester', 'cleared', '2025-11-02 10:00:00'),
(3, 6, 'semester', 'cleared', '2025-11-03 10:00:00'),
(4, 6, 'semester', 'cleared', '2025-11-04 10:00:00'),
(5, 6, 'semester', 'cleared', '2025-11-05 10:00:00'),
(12, 7, 'semester', 'in_progress', '2026-04-08 10:00:00'),
(13, 7, 'semester', 'pending', '2026-04-12 10:00:00'),
(14, 7, 'final', 'pending', '2026-04-11 10:00:00'),
(15, 7, 'semester', 'cleared', '2026-03-18 10:00:00');

-- Clearance steps
INSERT INTO clearance_steps (clearance_id, department, status, verified_by, verified_at, remarks) VALUES
-- Clearance 1 (in_progress)
(1, 'Library', 'cleared', 1, '2026-04-02 10:00:00', 'No pending books'),
(1, 'Finance', 'cleared', 7, '2026-04-02 11:00:00', 'All fees paid'),
(1, 'Academic', 'pending', NULL, NULL, NULL),
(1, 'Hostel', 'cleared', 1, '2026-04-03 10:00:00', 'Room cleared'),
(1, 'Transport', 'cleared', 1, '2026-04-03 11:00:00', 'No dues'),
-- Clearance 2 (cleared)
(2, 'Library', 'cleared', 1, '2026-03-26 10:00:00', 'OK'),
(2, 'Finance', 'cleared', 7, '2026-03-26 11:00:00', 'OK'),
(2, 'Academic', 'cleared', 2, '2026-03-27 10:00:00', 'OK'),
(2, 'Hostel', 'cleared', 1, '2026-03-27 11:00:00', 'OK'),
(2, 'Transport', 'cleared', 1, '2026-03-28 10:00:00', 'OK'),
-- Clearance 3 (pending)
(3, 'Library', 'pending', NULL, NULL, NULL),
(3, 'Finance', 'pending', NULL, NULL, NULL),
(3, 'Academic', 'pending', NULL, NULL, NULL),
(3, 'Hostel', 'pending', NULL, NULL, NULL),
(3, 'Transport', 'pending', NULL, NULL, NULL),
-- Clearance 4 (in_progress)
(4, 'Library', 'cleared', 1, '2026-04-03 10:00:00', 'OK'),
(4, 'Finance', 'issue', 7, '2026-04-03 11:00:00', 'Outstanding dues ৳25,000'),
(4, 'Academic', 'cleared', 3, '2026-04-04 10:00:00', 'OK'),
(4, 'Hostel', 'pending', NULL, NULL, NULL),
(4, 'Transport', 'cleared', 1, '2026-04-04 11:00:00', 'OK'),
-- Clearance 5 (final, in_progress)
(5, 'Library', 'cleared', 1, '2026-03-29 10:00:00', 'No pending'),
(5, 'Finance', 'cleared', 7, '2026-03-29 11:00:00', 'All clear'),
(5, 'Academic', 'cleared', 2, '2026-03-30 10:00:00', 'All courses completed'),
(5, 'Hostel', 'cleared', 1, '2026-03-30 11:00:00', 'Room returned'),
(5, 'Transport', 'pending', NULL, NULL, NULL);

-- ---------- ADDITIONAL SYSTEM CONFIG RECORDS ----------
INSERT IGNORE INTO system_config (config_type, config_key, config_value, status) VALUES
('setting', 'eval_open_weeks', '"2"', 'active'),
('setting', 'max_courses_per_semester', '"8"', 'active'),
('setting', 'min_cgpa_for_scholarship', '"3.50"', 'active'),
('setting', 'attendance_warning_threshold', '"75"', 'active'),
('setting', 'attendance_danger_threshold', '"60"', 'active'),
('setting', 'hostel_fee_late_penalty', '"500"', 'active'),
('setting', 'transport_fee_late_penalty', '"200"', 'active'),
('setting', 'max_leave_days_casual', '"10"', 'active'),
('setting', 'max_leave_days_annual', '"20"', 'active'),
('setting', 'max_leave_days_sick', '"15"', 'active'),
('setting', 'clearance_departments', '["Library","Finance","Academic","Hostel","Transport"]', 'active');

-- ============================================================================
-- COMPREHENSIVE SQL TEST QUERIES (10+ as required by Guidelines)
-- Covers: SELECT, WHERE, GROUP BY, HAVING, JOINS, SUBQUERIES, VIEWS, etc.
-- ============================================================================

-- Query 1: Basic SELECT with WHERE - Get all active students with their programs
-- SELECT s.student_code, u.full_name, u.email, p.name AS program, s.batch_year
-- FROM students s
-- JOIN users u ON u.user_id = s.user_id
-- JOIN programs p ON p.program_id = s.program_id
-- WHERE u.status = 'active'
-- ORDER BY s.batch_year, s.student_code;

-- Query 2: GROUP BY with HAVING - Departments with more than 2 students
-- SELECT d.name AS department, p.name AS program, COUNT(s.student_id) AS student_count
-- FROM departments d
-- JOIN programs p ON p.dept_id = d.dept_id
-- JOIN students s ON s.program_id = p.program_id
-- GROUP BY d.dept_id, p.program_id
-- HAVING COUNT(s.student_id) > 2
-- ORDER BY student_count DESC;

-- Query 3: INNER JOIN - Student results with course details
-- SELECT s.student_code, u.full_name, c.course_code, c.title,
--        r.total_mark, gs.grade_code, gs.grade_point
-- FROM results r
-- INNER JOIN enrollments e ON e.enrollment_id = r.enrollment_id
-- INNER JOIN students s ON s.student_id = e.student_id
-- INNER JOIN users u ON u.user_id = s.user_id
-- INNER JOIN course_offerings co ON co.offering_id = e.offering_id
-- INNER JOIN courses c ON c.course_id = co.course_id
-- INNER JOIN grade_scale gs ON gs.grade_code = r.grade_code
-- ORDER BY s.student_code, c.course_code;

-- Query 4: LEFT JOIN - All students with their hostel allocation (including those without)
-- SELECT s.student_code, u.full_name, hr.hostel_name, hr.room_no, ra.bed_no, ra.status
-- FROM students s
-- JOIN users u ON u.user_id = s.user_id
-- LEFT JOIN room_allocations ra ON ra.student_id = s.student_id AND ra.status = 'active'
-- LEFT JOIN hostel_rooms hr ON hr.room_id = ra.room_id
-- ORDER BY s.student_code;

-- Query 5: RIGHT JOIN - All transport routes with subscription count  
-- SELECT tr.route_name, tr.start_point, tr.end_point,
--        COUNT(ts.subscription_id) AS active_subscribers
-- FROM transport_subscriptions ts
-- RIGHT JOIN transport_routes tr ON tr.route_id = ts.route_id AND ts.status = 'active'
-- GROUP BY tr.route_id
-- ORDER BY active_subscribers DESC;

-- Query 6: NESTED SUBQUERY - Students with CGPA above average
-- SELECT s.student_code, u.full_name, vc.cgpa
-- FROM vw_student_cgpa vc
-- JOIN students s ON s.student_id = vc.student_id
-- JOIN users u ON u.user_id = s.user_id
-- WHERE vc.cgpa > (SELECT AVG(cgpa) FROM vw_student_cgpa)
-- ORDER BY vc.cgpa DESC;

-- Query 7: Correlated SUBQUERY - Students who scored above class average in each exam
-- SELECT em.exam_id, e.name AS exam_name, s.student_code, u.full_name, em.obtained_marks
-- FROM exam_marks em
-- JOIN exams e ON e.exam_id = em.exam_id
-- JOIN students s ON s.student_id = em.student_id
-- JOIN users u ON u.user_id = s.user_id
-- WHERE em.obtained_marks > (
--   SELECT AVG(em2.obtained_marks) FROM exam_marks em2 WHERE em2.exam_id = em.exam_id
-- )
-- ORDER BY em.exam_id, em.obtained_marks DESC;

-- Query 8: VIEW usage - Attendance summary with warning status
-- SELECT vas.student_code, vas.student_name, vas.course_code, vas.course_title,
--        vas.total_sessions, vas.present, vas.absent, vas.attendance_pct, vas.status
-- FROM vw_attendance_summary vas
-- WHERE vas.status IN ('warning', 'danger')
-- ORDER BY vas.attendance_pct ASC;

-- Query 9: AGGREGATE functions - Financial summary per semester
-- SELECT sem.name AS semester, 
--        COUNT(DISTINCT si.student_id) AS invoiced_students,
--        SUM(ii.amount) AS total_invoiced,
--        COALESCE(SUM(p.amount), 0) AS total_collected,
--        SUM(ii.amount) - COALESCE(SUM(p.amount), 0) AS outstanding
-- FROM student_invoices si
-- JOIN semesters sem ON sem.semester_id = si.semester_id
-- JOIN invoice_items ii ON ii.invoice_id = si.invoice_id
-- LEFT JOIN payments p ON p.invoice_id = si.invoice_id
-- GROUP BY si.semester_id
-- ORDER BY sem.start_date;

-- Query 10: Complex JOIN with CASE - Faculty workload analysis
-- SELECT u.full_name AS faculty,
--        COUNT(DISTINCT co.offering_id) AS courses_taught,
--        COUNT(DISTINCT e.enrollment_id) AS total_students,
--        SUM(CASE WHEN cs.status = 'completed' THEN 1 ELSE 0 END) AS sessions_completed,
--        SUM(CASE WHEN cs.status = 'scheduled' THEN 1 ELSE 0 END) AS sessions_upcoming
-- FROM users u
-- JOIN course_offerings co ON co.teacher_id = u.user_id
-- LEFT JOIN enrollments e ON e.offering_id = co.offering_id AND e.status = 'active'
-- LEFT JOIN class_sessions cs ON cs.offering_id = co.offering_id
-- WHERE co.semester_id = (SELECT semester_id FROM semesters WHERE status = 'active')
-- GROUP BY u.user_id
-- ORDER BY courses_taught DESC;

-- Query 11: TRANSACTION example via Stored Procedure - sp_publish_results
-- CALL sp_publish_results(1, 2); -- publish offering 1 results by faculty 2

-- Query 12: TRIGGER demonstration - trg_exam_marks_before_insert validates marks <= total
-- INSERT INTO exam_marks (exam_id, student_id, obtained_marks, is_published)
-- VALUES (1, 6, 999, FALSE); -- This will FAIL due to trigger validation

-- Query 13: EXISTS subquery - Find students who have NOT submitted course evaluation
-- SELECT s.student_code, u.full_name
-- FROM students s
-- JOIN users u ON u.user_id = s.user_id
-- JOIN enrollments e ON e.student_id = s.student_id AND e.status = 'active'
-- JOIN course_offerings co ON co.offering_id = e.offering_id
-- JOIN evaluation_forms ef ON ef.offering_id = co.offering_id AND ef.status = 'open'
-- WHERE NOT EXISTS (
--   SELECT 1 FROM evaluation_responses er WHERE er.form_id = ef.form_id AND er.student_id = s.student_id
-- );

-- Query 14: UNION - Combined notice feed for a student
-- SELECT 'Notice' AS type, n.title, n.published_at FROM notices n WHERE n.audience IN ('all','student')
-- UNION
-- SELECT 'Exam' AS type, CONCAT(e.name, ' - ', c.course_code) AS title, e.exam_date AS published_at
-- FROM exams e JOIN course_offerings co ON co.offering_id = e.offering_id JOIN courses c ON c.course_id = co.course_id
-- ORDER BY published_at DESC LIMIT 20;

-- Query 15: Window function - Rank students by CGPA
-- SELECT student_code, full_name, cgpa,
--        RANK() OVER (ORDER BY cgpa DESC) AS cgpa_rank,
--        DENSE_RANK() OVER (ORDER BY cgpa DESC) AS dense_rank
-- FROM vw_student_cgpa vc
-- JOIN students s ON s.student_id = vc.student_id
-- JOIN users u ON u.user_id = s.user_id;

-- ============================================================================
-- END OF SCHEMA UPDATE
-- ============================================================================
