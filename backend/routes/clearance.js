/**
 * Clearance Routes - Academic Clearance Management
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get clearance requests (student: own, admin: all)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');
    let reqs;
    if (isAdmin) {
      reqs = await query(
        `SELECT cr.*, s.student_code, u.full_name AS student_name, sem.name AS semester_name,
                (SELECT COUNT(*) FROM clearance_steps cs WHERE cs.clearance_id = cr.clearance_id AND cs.status = 'cleared') AS cleared_steps,
                (SELECT COUNT(*) FROM clearance_steps cs WHERE cs.clearance_id = cr.clearance_id) AS total_steps
         FROM clearance_requests cr
         JOIN students s ON s.student_id = cr.student_id
         JOIN users u ON u.user_id = s.user_id
         JOIN semesters sem ON sem.semester_id = cr.semester_id
         ORDER BY cr.created_at DESC`
      );
    } else {
      const [student] = await query('SELECT student_id FROM students WHERE user_id = ?', [req.user.userId]);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      reqs = await query(
        `SELECT cr.*, sem.name AS semester_name,
                (SELECT COUNT(*) FROM clearance_steps cs WHERE cs.clearance_id = cr.clearance_id AND cs.status = 'cleared') AS cleared_steps,
                (SELECT COUNT(*) FROM clearance_steps cs WHERE cs.clearance_id = cr.clearance_id) AS total_steps
         FROM clearance_requests cr
         JOIN semesters sem ON sem.semester_id = cr.semester_id
         WHERE cr.student_id = ?
         ORDER BY cr.created_at DESC`,
        [student.student_id]
      );
    }
    res.json({ success: true, data: reqs });
  } catch (err) { next(err); }
});

// Get clearance steps for a request
router.get('/:id/steps', authenticate, async (req, res, next) => {
  try {
    const steps = await query(
      `SELECT cs.*, v.full_name AS verified_by_name
       FROM clearance_steps cs
       LEFT JOIN users v ON v.user_id = cs.verified_by
       WHERE cs.clearance_id = ?
       ORDER BY cs.step_id`,
      [req.params.id]
    );
    res.json({ success: true, data: steps });
  } catch (err) { next(err); }
});

// Request clearance (student)
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('student')) {
      return res.status(403).json({ success: false, message: 'Students only' });
    }
    const [student] = await query('SELECT student_id FROM students WHERE user_id = ?', [req.user.userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { semester_id, type } = req.body;
    if (!semester_id) {
      return res.status(400).json({ success: false, message: 'Semester is required' });
    }

    const result = await query(
      `INSERT INTO clearance_requests (student_id, semester_id, type) VALUES (?, ?, ?)`,
      [student.student_id, semester_id, type || 'semester']
    );
    const clearanceId = result.insertId;

    // Auto-create clearance steps
    const departments = ['Library', 'Finance', 'Academic'];
    for (const dept of departments) {
      await query(
        'INSERT INTO clearance_steps (clearance_id, department) VALUES (?, ?)',
        [clearanceId, dept]
      );
    }

    res.status(201).json({ success: true, data: { clearance_id: clearanceId }, message: 'Clearance request created' });
  } catch (err) { next(err); }
});

// Verify/update clearance step (admin/staff)
router.put('/steps/:stepId', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('faculty')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const { status, remarks } = req.body;
    if (!['cleared', 'issue'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be cleared or issue' });
    }
    await query(
      `UPDATE clearance_steps SET status=?, verified_by=?, verified_at=NOW(), remarks=? WHERE step_id=?`,
      [status, req.user.userId, remarks || null, req.params.stepId]
    );
    res.json({ success: true, message: `Step marked as ${status}` });
  } catch (err) { next(err); }
});

module.exports = router;
