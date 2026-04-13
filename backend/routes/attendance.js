/**
 * Attendance Routes - View and Mark Attendance
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get attendance summary (student view)
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const summary = await query(
      'SELECT * FROM vw_attendance_summary WHERE student_id = ?',
      [students[0].student_id]
    );
    
    // Calculate overall attendance
    const totals = summary.reduce((acc, curr) => {
      acc.totalSessions += curr.total_sessions || 0;
      acc.present += curr.present || 0;
      return acc;
    }, { totalSessions: 0, present: 0 });
    
    const overallPercentage = totals.totalSessions > 0 
      ? ((totals.present / totals.totalSessions) * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      data: {
        courses: summary,
        overall: {
          totalSessions: totals.totalSessions,
          present: totals.present,
          percentage: parseFloat(overallPercentage)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get detailed attendance records
router.get('/records', authenticate, async (req, res, next) => {
  try {
    const { offering, month } = req.query;
    
    const students = await query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    let sql = `
      SELECT ar.status, ar.marked_at,
             cs.session_id, cs.session_date, cs.day_of_week, 
             cs.start_time, cs.end_time, cs.room, cs.session_type,
             c.course_code, c.title as course_title,
             u.full_name as marked_by_name
      FROM attendance_records ar
      JOIN class_sessions cs ON ar.session_id = cs.session_id
      JOIN course_offerings co ON cs.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN semesters sem ON co.semester_id = sem.semester_id
      LEFT JOIN users u ON ar.marked_by = u.user_id
      WHERE ar.student_id = ? AND sem.status = 'active'
    `;
    const params = [students[0].student_id];
    
    if (offering) {
      sql += ' AND co.offering_id = ?';
      params.push(offering);
    }
    
    if (month) {
      sql += ' AND MONTH(cs.session_date) = ?';
      params.push(month);
    }
    
    sql += ' ORDER BY cs.session_date DESC, cs.start_time';
    
    const records = await query(sql, params);
    
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    next(error);
  }
});

// Get class session for marking attendance (faculty)
router.get('/sessions/:sessionId', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await query(
      `SELECT cs.*, c.course_code, c.title,
              co.section, co.teacher_id
       FROM class_sessions cs
       JOIN course_offerings co ON cs.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       WHERE cs.session_id = ?`,
      [sessionId]
    );
    
    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Get enrolled students with attendance status
    const students = await query(
      `SELECT s.student_id, s.student_code, u.full_name,
              ar.status as attendance_status
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN attendance_records ar ON ar.session_id = ? AND ar.student_id = s.student_id
       WHERE e.offering_id = ?
       ORDER BY s.student_code`,
      [sessionId, session[0].offering_id]
    );
    
    res.json({
      success: true,
      data: {
        session: session[0],
        students
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark attendance (faculty)
router.post('/mark', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const { sessionId, attendance } = req.body;
    
    if (!sessionId || !Array.isArray(attendance)) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and attendance array required'
      });
    }
    
    // Verify faculty teaches this session
    const session = await query(
      `SELECT cs.*, co.teacher_id FROM class_sessions cs
       JOIN course_offerings co ON cs.offering_id = co.offering_id
       WHERE cs.session_id = ?`,
      [sessionId]
    );
    
    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    if (session[0].teacher_id !== req.user.userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this session'
      });
    }
    
    // Insert/update attendance
    for (const record of attendance) {
      await query(
        `INSERT INTO attendance_records (session_id, student_id, status, marked_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), marked_at = NOW()`,
        [sessionId, record.studentId, record.status, req.user.userId]
      );
    }
    
    // Update session status
    await query(
      `UPDATE class_sessions SET status = 'completed' WHERE session_id = ?`,
      [sessionId]
    );
    
    res.json({
      success: true,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get faculty's sessions to mark attendance
router.get('/faculty/sessions', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const { date } = req.query;
    
    let sql = `
      SELECT cs.session_id, cs.session_date, cs.day_of_week,
             cs.start_time, cs.end_time, cs.room, cs.status,
             c.course_code, c.title, co.section,
             (SELECT COUNT(*) FROM attendance_records WHERE session_id = cs.session_id) as marked_count,
             (SELECT COUNT(*) FROM enrollments WHERE offering_id = co.offering_id) as total_students
      FROM class_sessions cs
      JOIN course_offerings co ON cs.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN semesters sem ON co.semester_id = sem.semester_id
      WHERE co.teacher_id = ? AND sem.status = 'active'
    `;
    const params = [req.user.userId];
    
    if (date) {
      sql += ' AND cs.session_date = ?';
      params.push(date);
    } else {
      // Default to today
      sql += ' AND cs.session_date = CURDATE()';
    }
    
    sql += ' ORDER BY cs.start_time';
    
    const sessions = await query(sql, params);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
