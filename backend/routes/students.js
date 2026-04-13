/**
 * Student Routes - Profile, Academic Info
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student profile (current logged-in student)
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      `SELECT s.student_id, s.student_code, s.batch_year, s.section, 
              s.enrollment_date, s.photo_url,
              u.user_id, u.email, u.full_name, u.phone,
              p.program_id, p.code as program_code, p.name as program_name, 
              p.total_credits, p.duration_years,
              d.dept_id, d.code as dept_code, d.name as department_name, d.faculty,
              advisor.full_name as advisor_name, advisor.email as advisor_email
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       JOIN programs p ON s.program_id = p.program_id
       JOIN departments d ON p.dept_id = d.dept_id
       LEFT JOIN users advisor ON s.advisor_id = advisor.user_id
       WHERE s.user_id = ?`,
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }
    
    const student = students[0];
    
    // Get academic summary from CGPA view
    const cgpaData = await query(
      `SELECT cgpa, total_credits, courses_completed 
       FROM vw_student_cgpa WHERE student_id = ?`,
      [student.student_id]
    );
    
    // Get current semester enrollments count
    const currentEnrollments = await query(
      `SELECT COUNT(*) as count FROM enrollments e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN semesters sem ON co.semester_id = sem.semester_id
       WHERE e.student_id = ? AND sem.status = 'active'`,
      [student.student_id]
    );
    
    res.json({
      success: true,
      data: {
        profile: {
          id: student.student_id,
          studentCode: student.student_code,
          name: student.full_name,
          email: student.email,
          phone: student.phone,
          batchYear: student.batch_year,
          section: student.section,
          enrollmentDate: student.enrollment_date,
          photoUrl: student.photo_url,
          program: {
            id: student.program_id,
            code: student.program_code,
            name: student.program_name,
            totalCredits: student.total_credits,
            durationYears: student.duration_years
          },
          department: {
            id: student.dept_id,
            code: student.dept_code,
            name: student.department_name,
            faculty: student.faculty
          },
          advisor: {
            name: student.advisor_name,
            email: student.advisor_email
          }
        },
        academic: {
          cgpa: cgpaData.length > 0 ? cgpaData[0].cgpa : null,
          totalCredits: cgpaData.length > 0 ? cgpaData[0].total_credits : 0,
          coursesCompleted: cgpaData.length > 0 ? cgpaData[0].courses_completed : 0,
          currentEnrollments: currentEnrollments[0].count
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get student by ID (admin/faculty)
router.get('/:id', authenticate, requireRole('admin', 'faculty'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const students = await query(
      `SELECT s.*, u.email, u.full_name, u.phone, u.status,
              p.code as program_code, p.name as program_name,
              d.code as dept_code, d.name as department_name
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       JOIN programs p ON s.program_id = p.program_id
       JOIN departments d ON p.dept_id = d.dept_id
       WHERE s.student_id = ?`,
      [id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    next(error);
  }
});

// List all students (admin/faculty)
router.get('/', authenticate, requireRole('admin', 'faculty'), async (req, res, next) => {
  try {
    const { program, batch, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT s.student_id, s.student_code, s.batch_year, s.section,
             u.full_name, u.email, u.status,
             p.code as program_code, p.name as program_name,
             d.code as dept_code
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN programs p ON s.program_id = p.program_id
      JOIN departments d ON p.dept_id = d.dept_id
      WHERE 1=1
    `;
    const params = [];
    
    if (program) {
      sql += ' AND p.program_id = ?';
      params.push(program);
    }
    
    if (batch) {
      sql += ' AND s.batch_year = ?';
      params.push(batch);
    }
    
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR s.student_code LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await query(countSql, params);
    const total = countResult.total;
    
    // Add pagination
    sql += ' ORDER BY s.student_code LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const students = await query(sql, params);
    
    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get student enrollments
router.get('/enrollments/current', authenticate, async (req, res, next) => {
  try {
    // Get student_id for current user
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
    
    const studentId = students[0].student_id;
    
    const enrollments = await query(
      `SELECT e.enrollment_id, e.status, e.enrolled_at,
              co.offering_id, co.section,
              c.course_code, c.title, c.credit, c.category,
              sem.name as semester_name, sem.status as semester_status,
              t.full_name as teacher_name
       FROM enrollments e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN semesters sem ON co.semester_id = sem.semester_id
       LEFT JOIN users t ON co.teacher_id = t.user_id
       WHERE e.student_id = ? AND sem.status = 'active'
       ORDER BY c.course_code`,
      [studentId]
    );
    
    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
