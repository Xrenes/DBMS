/**
 * Notice Routes - Announcements & Notifications
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all notices (with read status for current user)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { audience, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = '(n.expires_at IS NULL OR n.expires_at > NOW())';
    const params = [];

    // Filter by audience based on user role
    const isStudent = req.user.roles.includes('student');
    const isFaculty = req.user.roles.includes('faculty');
    if (isStudent) {
      where += " AND n.audience IN ('all','student')";
    } else if (isFaculty) {
      where += " AND n.audience IN ('all','faculty')";
    }

    if (audience) {
      where += ' AND n.audience = ?';
      params.push(audience);
    }
    if (priority) {
      where += ' AND n.priority = ?';
      params.push(priority);
    }

    const notices = await query(
      `SELECT n.notice_id, n.title, n.body, n.audience, n.priority, n.pinned,
              n.published_at, n.expires_at,
              u.full_name AS posted_by_name,
              d.name AS department_name,
              CASE WHEN nr.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_read
       FROM notices n
       JOIN users u ON u.user_id = n.posted_by
       LEFT JOIN departments d ON d.dept_id = n.dept_id
       LEFT JOIN notice_reads nr ON nr.notice_id = n.notice_id AND nr.user_id = ?
       WHERE ${where}
       ORDER BY n.pinned DESC, n.published_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.userId, ...params, parseInt(limit), offset]
    );

    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM notices n WHERE ${where}`,
      params
    );

    res.json({ success: true, data: notices, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { next(err); }
});

// Get single notice
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [notice] = await query(
      `SELECT n.*, u.full_name AS posted_by_name, d.name AS department_name
       FROM notices n
       JOIN users u ON u.user_id = n.posted_by
       LEFT JOIN departments d ON d.dept_id = n.dept_id
       WHERE n.notice_id = ?`,
      [req.params.id]
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Mark as read
    await query(
      'INSERT IGNORE INTO notice_reads (notice_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.userId]
    );

    res.json({ success: true, data: notice });
  } catch (err) { next(err); }
});

// Create notice (admin/faculty only)
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('faculty')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const { title, body, audience, dept_id, priority, pinned, expires_at } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }
    const result = await query(
      `INSERT INTO notices (title, body, audience, dept_id, posted_by, priority, pinned, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, body, audience || 'all', dept_id || null, req.user.userId, priority || 'normal', pinned || false, expires_at || null]
    );
    res.status(201).json({ success: true, data: { notice_id: result.insertId }, message: 'Notice created' });
  } catch (err) { next(err); }
});

// Update notice
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('faculty')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const { title, body, audience, dept_id, priority, pinned, expires_at } = req.body;
    await query(
      `UPDATE notices SET title=COALESCE(?,title), body=COALESCE(?,body), 
       audience=COALESCE(?,audience), dept_id=?, priority=COALESCE(?,priority),
       pinned=COALESCE(?,pinned), expires_at=? WHERE notice_id=?`,
      [title, body, audience, dept_id, priority, pinned, expires_at, req.params.id]
    );
    res.json({ success: true, message: 'Notice updated' });
  } catch (err) { next(err); }
});

// Delete notice
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    await query('DELETE FROM notices WHERE notice_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) { next(err); }
});

// Mark notice as read
router.post('/:id/read', authenticate, async (req, res, next) => {
  try {
    await query(
      'INSERT IGNORE INTO notice_reads (notice_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
});

module.exports = router;
