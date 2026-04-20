/**
 * Leave Routes - Faculty Leave Management
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get leave requests for current faculty / all (admin)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const isAdmin = req.user.roles.includes('admin');
    let where = isAdmin ? '1=1' : 'flr.faculty_user_id = ?';
    const params = isAdmin ? [] : [req.user.userId];

    if (status) {
      where += ' AND flr.status = ?';
      params.push(status);
    }

    const leaves = await query(
      `SELECT flr.*, u.full_name AS faculty_name, u.email AS faculty_email,
              a.full_name AS approved_by_name
       FROM faculty_leave_requests flr
       JOIN users u ON u.user_id = flr.faculty_user_id
       LEFT JOIN users a ON a.user_id = flr.approved_by
       WHERE ${where}
       ORDER BY flr.created_at DESC`,
      params
    );
    res.json({ success: true, data: leaves });
  } catch (err) { next(err); }
});

// Get leave balance/summary for current faculty
router.get('/balance', authenticate, async (req, res, next) => {
  try {
    const balance = await query(
      `SELECT leave_type,
              COUNT(*) AS total_requests,
              SUM(CASE WHEN status = 'approved' THEN DATEDIFF(end_date, start_date) + 1 ELSE 0 END) AS days_used,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count
       FROM faculty_leave_requests
       WHERE faculty_user_id = ?
       GROUP BY leave_type`,
      [req.user.userId]
    );
    res.json({ success: true, data: balance });
  } catch (err) { next(err); }
});

// Apply for leave
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('faculty')) {
      return res.status(403).json({ success: false, message: 'Faculty only' });
    }
    const { leave_type, start_date, end_date, reason } = req.body;
    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }
    const result = await query(
      `INSERT INTO faculty_leave_requests (faculty_user_id, leave_type, start_date, end_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.userId, leave_type, start_date, end_date, reason]
    );
    res.status(201).json({ success: true, data: { leave_id: result.insertId }, message: 'Leave request submitted' });
  } catch (err) { next(err); }
});

// Approve/reject leave (admin only)
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const { status, comments } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    await query(
      `UPDATE faculty_leave_requests SET status=?, approved_by=?, comments=? WHERE leave_id=?`,
      [status, req.user.userId, comments || null, req.params.id]
    );
    res.json({ success: true, message: `Leave ${status}` });
  } catch (err) { next(err); }
});

module.exports = router;
