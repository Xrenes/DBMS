/**
 * Faculty Routes - Faculty Profile, Courses, Students
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get faculty profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const [profile] = await query(
      `SELECT fp.*, u.full_name, u.email, u.phone, d.name AS department_name, d.code AS dept_code
       FROM faculty_profiles fp
       JOIN users u ON u.user_id = fp.user_id
       JOIN departments d ON d.dept_id = fp.dept_id
       WHERE fp.user_id = ?`,
      [req.user.userId]
    );
    if (!profile) {
      // Return basic info if no profile exists
      const [user] = await query('SELECT user_id, full_name, email, phone FROM users WHERE user_id = ?', [req.user.userId]);
      return res.json({ success: true, data: user });
    }
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
});

// Get faculty member's courses (current semester)
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { semester_id } = req.query;
    let semFilter = '';
    const params = [req.user.userId];
    if (semester_id) {
      semFilter = 'AND co.semester_id = ?';
      params.push(semester_id);
    } else {
      semFilter = 'AND sem.status = "active"';
    }
    const courses = await query(
      `SELECT co.offering_id, c.course_id, c.course_code, c.title, c.credits, c.type,
              co.section, sem.name AS semester_name, sem.semester_id,
              (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = co.offering_id AND e.status = 'active') AS enrolled_students,
              (SELECT COUNT(*) FROM class_sessions cs WHERE cs.offering_id = co.offering_id AND cs.status = 'completed') AS sessions_held
       FROM course_offerings co
       JOIN courses c ON c.course_id = co.course_id
       JOIN semesters sem ON sem.semester_id = co.semester_id
       WHERE co.teacher_id = ? ${semFilter}
       ORDER BY c.course_code`,
      params
    );
    res.json({ success: true, data: courses });
  } catch (err) { next(err); }
});

// Get students in a faculty member's course
router.get('/courses/:offeringId/students', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      `SELECT s.student_id, s.student_code, u.full_name, u.email, u.phone,
              s.batch_year, s.section, p.name AS program_name,
              e.enrollment_id, e.status AS enrollment_status,
              (SELECT ROUND(SUM(CASE WHEN ar.status='P' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1)
               FROM attendance_records ar
               JOIN class_sessions cs ON cs.session_id = ar.session_id
               WHERE ar.student_id = s.student_id AND cs.offering_id = ?) AS attendance_pct
       FROM enrollments e
       JOIN students s ON s.student_id = e.student_id
       JOIN users u ON u.user_id = s.user_id
       JOIN programs p ON p.program_id = s.program_id
       WHERE e.offering_id = ? AND e.status = 'active'
       ORDER BY s.student_code`,
      [req.params.offeringId, req.params.offeringId]
    );
    res.json({ success: true, data: students });
  } catch (err) { next(err); }
});

// Get faculty routine (class schedule)
router.get('/routine', authenticate, async (req, res, next) => {
  try {
    const schedule = await query(
      `SELECT cs.session_id, cs.session_date, cs.day_of_week, cs.start_time, cs.end_time,
              cs.room, cs.session_type, cs.status,
              c.course_code, c.title AS course_title, co.section
       FROM class_sessions cs
       JOIN course_offerings co ON co.offering_id = cs.offering_id
       JOIN courses c ON c.course_id = co.course_id
       JOIN semesters sem ON sem.semester_id = co.semester_id
       WHERE co.teacher_id = ? AND sem.status = 'active'
       ORDER BY cs.session_date, cs.start_time`,
      [req.user.userId]
    );
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
});

// Get all faculty members (admin/public)
router.get('/list', authenticate, async (req, res, next) => {
  try {
    const faculty = await query(
      `SELECT fp.profile_id, fp.user_id, u.full_name, u.email, u.phone,
              fp.designation, fp.specialization, fp.office_room, fp.office_hours,
              d.name AS department_name, d.code AS dept_code,
              fp.publications_count
       FROM faculty_profiles fp
       JOIN users u ON u.user_id = fp.user_id
       JOIN departments d ON d.dept_id = fp.dept_id
       WHERE u.status = 'active'
       ORDER BY d.name, fp.designation DESC, u.full_name`
    );
    res.json({ success: true, data: faculty });
  } catch (err) { next(err); }
});

// Update faculty profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('faculty') && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const { office_room, office_hours, specialization, research_interests } = req.body;
    await query(
      `UPDATE faculty_profiles SET office_room=COALESCE(?,office_room), 
       office_hours=COALESCE(?,office_hours), specialization=COALESCE(?,specialization),
       research_interests=COALESCE(?,research_interests) WHERE user_id=?`,
      [office_room, office_hours, specialization, research_interests ? JSON.stringify(research_interests) : null, req.user.userId]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { next(err); }
});

module.exports = router;
