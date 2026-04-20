/**
 * Evaluation Routes - Course Evaluation Forms & Responses
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get open evaluation forms for current student
router.get('/forms', authenticate, async (req, res, next) => {
  try {
    const isStudent = req.user.roles.includes('student');
    if (isStudent) {
      const forms = await query(
        `SELECT ef.form_id, ef.offering_id, ef.open_date, ef.close_date, ef.status,
                c.course_code, c.title AS course_title, u.full_name AS teacher_name,
                CASE WHEN er.response_id IS NOT NULL THEN TRUE ELSE FALSE END AS submitted
         FROM evaluation_forms ef
         JOIN course_offerings co ON co.offering_id = ef.offering_id
         JOIN courses c ON c.course_id = co.course_id
         JOIN users u ON u.user_id = co.teacher_id
         JOIN enrollments e ON e.offering_id = co.offering_id AND e.status = 'active'
         JOIN students s ON s.student_id = e.student_id AND s.user_id = ?
         LEFT JOIN evaluation_responses er ON er.form_id = ef.form_id AND er.student_id = s.student_id
         WHERE ef.status = 'open'`,
        [req.user.userId]
      );
      return res.json({ success: true, data: forms });
    }
    // Faculty/admin see all forms
    const forms = await query(
      `SELECT ef.*, c.course_code, c.title AS course_title, u.full_name AS teacher_name,
              (SELECT COUNT(*) FROM evaluation_responses er WHERE er.form_id = ef.form_id) AS response_count
       FROM evaluation_forms ef
       JOIN course_offerings co ON co.offering_id = ef.offering_id
       JOIN courses c ON c.course_id = co.course_id
       JOIN users u ON u.user_id = co.teacher_id
       ORDER BY ef.form_id DESC`
    );
    res.json({ success: true, data: forms });
  } catch (err) { next(err); }
});

// Get evaluation summary (faculty/admin)
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('faculty') && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const summary = await query('SELECT * FROM vw_evaluation_summary');
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Submit evaluation response (student only)
router.post('/submit', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('student')) {
      return res.status(403).json({ success: false, message: 'Students only' });
    }
    const { form_id, q_teaching, q_content, q_assessment, q_environment, q_overall, comments } = req.body;
    if (!form_id || !q_teaching || !q_content || !q_assessment || !q_environment || !q_overall) {
      return res.status(400).json({ success: false, message: 'All ratings are required' });
    }

    const [student] = await query('SELECT student_id FROM students WHERE user_id = ?', [req.user.userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await query(
      `INSERT INTO evaluation_responses (form_id, student_id, q_teaching, q_content, q_assessment, q_environment, q_overall, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [form_id, student.student_id, q_teaching, q_content, q_assessment, q_environment, q_overall, comments || null]
    );
    res.status(201).json({ success: true, message: 'Evaluation submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Already submitted for this form' });
    }
    next(err);
  }
});

// Create evaluation form (admin only)
router.post('/forms', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const { offering_id, semester_id, open_date, close_date } = req.body;
    const result = await query(
      `INSERT INTO evaluation_forms (offering_id, semester_id, open_date, close_date, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [offering_id, semester_id, open_date, close_date]
    );
    res.status(201).json({ success: true, data: { form_id: result.insertId } });
  } catch (err) { next(err); }
});

module.exports = router;
