/**
 * Registration Routes - Course Registration Workflow
 */

const express = require('express');
const router = express.Router();
const { query, pool } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get current student's registration requests
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');
    let reqs;
    if (isAdmin) {
      reqs = await query(
        `SELECT rr.*, s.student_code, u.full_name AS student_name, sem.name AS semester_name,
                a.full_name AS approved_by_name
         FROM registration_requests rr
         JOIN students s ON s.student_id = rr.student_id
         JOIN users u ON u.user_id = s.user_id
         JOIN semesters sem ON sem.semester_id = rr.semester_id
         LEFT JOIN users a ON a.user_id = rr.approved_by
         ORDER BY rr.created_at DESC`
      );
    } else {
      const [student] = await query('SELECT student_id FROM students WHERE user_id = ?', [req.user.userId]);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      reqs = await query(
        `SELECT rr.*, sem.name AS semester_name, a.full_name AS approved_by_name
         FROM registration_requests rr
         JOIN semesters sem ON sem.semester_id = rr.semester_id
         LEFT JOIN users a ON a.user_id = rr.approved_by
         WHERE rr.student_id = ?
         ORDER BY rr.created_at DESC`,
        [student.student_id]
      );
    }
    res.json({ success: true, data: reqs });
  } catch (err) { next(err); }
});

// Get items in a registration request
router.get('/:id/items', authenticate, async (req, res, next) => {
  try {
    const items = await query(
      `SELECT ri.*, c.course_code, c.title AS course_title, c.credits,
              co.section, u.full_name AS teacher_name
       FROM registration_items ri
       JOIN course_offerings co ON co.offering_id = ri.offering_id
       JOIN courses c ON c.course_id = co.course_id
       JOIN users u ON u.user_id = co.teacher_id
       WHERE ri.request_id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// Create registration request
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('student')) {
      return res.status(403).json({ success: false, message: 'Students only' });
    }
    const [student] = await query('SELECT student_id FROM students WHERE user_id = ?', [req.user.userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { semester_id, items } = req.body;
    if (!semester_id || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Semester and at least one course required' });
    }

    const result = await query(
      `INSERT INTO registration_requests (student_id, semester_id, status) VALUES (?, ?, 'draft')`,
      [student.student_id, semester_id]
    );
    const requestId = result.insertId;

    for (const item of items) {
      await query(
        'INSERT INTO registration_items (request_id, offering_id, action) VALUES (?, ?, ?)',
        [requestId, item.offering_id, item.action || 'add']
      );
    }
    res.status(201).json({ success: true, data: { request_id: requestId }, message: 'Registration draft created' });
  } catch (err) { next(err); }
});

// Submit registration request
router.put('/:id/submit', authenticate, async (req, res, next) => {
  try {
    await query(
      `UPDATE registration_requests SET status='submitted', submitted_at=NOW() WHERE request_id=? AND status='draft'`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Registration submitted for approval' });
  } catch (err) { next(err); }
});

// Approve/reject registration (admin only)
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status === 'approved') {
      // Use stored procedure for atomic approval
      await query('CALL sp_approve_registration(?, ?)', [req.params.id, req.user.userId]);
    } else {
      await query(
        `UPDATE registration_requests SET status='rejected', approved_by=? WHERE request_id=?`,
        [req.user.userId, req.params.id]
      );
    }
    res.json({ success: true, message: `Registration ${status}` });
  } catch (err) { next(err); }
});

module.exports = router;
