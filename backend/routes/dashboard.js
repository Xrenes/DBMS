/**
 * Dashboard Routes - Aggregated Stats for Student Dashboard
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student dashboard overview
router.get('/student', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const studentId = students[0].student_id;
    
    // Get CGPA
    const cgpa = await query(
      'SELECT * FROM vw_student_cgpa WHERE student_id = ?',
      [studentId]
    );
    
    // Get attendance summary
    const attendance = await query(
      'SELECT * FROM vw_attendance_summary WHERE student_id = ?',
      [studentId]
    );
    
    // Get dues
    const dues = await query(
      'SELECT * FROM vw_student_dues WHERE student_id = ?',
      [studentId]
    );
    
    // Get current enrollments count
    const enrollments = await query(
      `SELECT COUNT(*) as course_count FROM enrollments e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN semesters s ON co.semester_id = s.semester_id
       WHERE e.student_id = ? AND s.is_current = TRUE`,
      [studentId]
    );
    
    // Get upcoming exams
    const upcomingExams = await query(
      `SELECT e.exam_id, e.exam_type, e.exam_date, c.course_code, c.course_name
       FROM exams e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN enrollments en ON co.offering_id = en.offering_id
       WHERE en.student_id = ? AND e.exam_date >= CURDATE()
       ORDER BY e.exam_date LIMIT 5`,
      [studentId]
    );
    
    // Get recent results (last 5)
    const recentResults = await query(
      `SELECT r.*, c.course_code, c.course_name
       FROM results r
       JOIN enrollments e ON r.enrollment_id = e.enrollment_id
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       WHERE e.student_id = ?
       ORDER BY r.created_at DESC LIMIT 5`,
      [studentId]
    );
    
    res.json({
      success: true,
      data: {
        cgpa: cgpa[0]?.cgpa || 0,
        totalCredits: cgpa[0]?.total_credits || 0,
        totalCourses: cgpa[0]?.total_courses || 0,
        attendancePercentage: attendance[0]?.attendance_pct || 0,
        totalClasses: attendance[0]?.total_classes || 0,
        classesAttended: attendance[0]?.attended || 0,
        totalDues: dues[0]?.net_dues || 0,
        currentCourses: enrollments[0]?.course_count || 0,
        upcomingExams,
        recentResults
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get admin dashboard stats
router.get('/admin', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    // Student counts
    const studentStats = await query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated,
         SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
       FROM students`
    );
    
    // Faculty count
    const facultyCount = await query(
      `SELECT COUNT(*) as count FROM users u
       JOIN user_roles ur ON u.user_id = ur.user_id
       JOIN roles r ON ur.role_id = r.role_id
       WHERE r.role_name = 'faculty'`
    );
    
    // Department count
    const deptCount = await query('SELECT COUNT(*) as count FROM departments');
    
    // Program count
    const programCount = await query('SELECT COUNT(*) as count FROM programs');
    
    // Current semester info
    const currentSemester = await query(
      'SELECT * FROM semesters WHERE is_current = TRUE'
    );
    
    // Revenue stats
    const revenueStats = await query(
      `SELECT 
         SUM(total_amount) as total_invoiced,
         (SELECT SUM(amount) FROM payments WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as last_30_days
       FROM student_invoices`
    );
    
    // Defaulters count
    const defaulters = await query(
      `SELECT COUNT(DISTINCT student_id) as count FROM vw_student_dues WHERE net_dues > 0`
    );
    
    // Recent audit logs
    const recentLogs = await query(
      `SELECT al.*, u.email, u.full_name
       FROM audit_logs al
       JOIN users u ON al.user_id = u.user_id
       ORDER BY al.created_at DESC LIMIT 10`
    );
    
    res.json({
      success: true,
      data: {
        students: studentStats[0],
        facultyCount: facultyCount[0].count,
        departmentCount: deptCount[0].count,
        programCount: programCount[0].count,
        currentSemester: currentSemester[0] || null,
        revenue: revenueStats[0],
        defaultersCount: defaulters[0].count,
        recentAuditLogs: recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
