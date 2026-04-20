/**
 * Academic Routes - Courses, Semesters, Departments
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all departments
router.get('/departments', authenticate, async (req, res, next) => {
  try {
    const departments = await query(
      `SELECT dept_id, code, name, faculty,
              (SELECT COUNT(*) FROM programs WHERE dept_id = d.dept_id) as program_count,
              (SELECT COUNT(*) FROM courses WHERE dept_id = d.dept_id) as course_count
       FROM departments d
       ORDER BY name`
    );
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
});

// Get all programs
router.get('/programs', authenticate, async (req, res, next) => {
  try {
    const { dept } = req.query;
    
    let sql = `
      SELECT p.program_id, p.code, p.name, p.total_credits, p.duration_years,
             d.code as dept_code, d.name as dept_name
      FROM programs p
      JOIN departments d ON p.dept_id = d.dept_id
    `;
    const params = [];
    
    if (dept) {
      sql += ' WHERE p.dept_id = ?';
      params.push(dept);
    }
    
    sql += ' ORDER BY d.name, p.name';
    
    const programs = await query(sql, params);
    
    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    next(error);
  }
});

// Get all semesters
router.get('/semesters', authenticate, async (req, res, next) => {
  try {
    const semesters = await query(
      `SELECT semester_id, name, start_date, end_date, status,
              (SELECT COUNT(*) FROM course_offerings WHERE semester_id = s.semester_id) as offerings_count
       FROM semesters s
       ORDER BY start_date DESC`
    );
    
    res.json({
      success: true,
      data: semesters
    });
  } catch (error) {
    next(error);
  }
});

// Get current/active semester
router.get('/semesters/current', authenticate, async (req, res, next) => {
  try {
    const semesters = await query(
      `SELECT semester_id, name, start_date, end_date, status
       FROM semesters WHERE status = 'active' LIMIT 1`
    );
    
    if (semesters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active semester found'
      });
    }
    
    res.json({
      success: true,
      data: semesters[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get all courses
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { dept, category, search } = req.query;
    
    let sql = `
      SELECT c.course_id, c.course_code, c.title, c.credit, c.category,
             d.code as dept_code, d.name as dept_name
      FROM courses c
      JOIN departments d ON c.dept_id = d.dept_id
      WHERE 1=1
    `;
    const params = [];
    
    if (dept) {
      sql += ' AND c.dept_id = ?';
      params.push(dept);
    }
    
    if (category) {
      sql += ' AND c.category = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (c.course_code LIKE ? OR c.title LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY c.course_code';
    
    const courses = await query(sql, params);
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

// Get course offerings for a semester
router.get('/offerings', authenticate, async (req, res, next) => {
  try {
    const { semester, course, teacher } = req.query;
    
    let sql = `
      SELECT co.offering_id, co.section, co.max_students,
             c.course_code, c.title, c.credit, c.category,
             sem.name as semester_name, sem.status as semester_status,
             t.full_name as teacher_name, t.email as teacher_email,
             (SELECT COUNT(*) FROM enrollments WHERE offering_id = co.offering_id) as enrolled_count
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      JOIN semesters sem ON co.semester_id = sem.semester_id
      LEFT JOIN users t ON co.teacher_id = t.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (semester) {
      sql += ' AND co.semester_id = ?';
      params.push(semester);
    } else {
      // Default to active semester
      sql += ' AND sem.status = ?';
      params.push('active');
    }
    
    if (course) {
      sql += ' AND co.course_id = ?';
      params.push(course);
    }
    
    if (teacher) {
      sql += ' AND co.teacher_id = ?';
      params.push(teacher);
    }
    
    sql += ' ORDER BY c.course_code, co.section';
    
    const offerings = await query(sql, params);
    
    res.json({
      success: true,
      data: offerings
    });
  } catch (error) {
    next(error);
  }
});

// Get timetable for current user (student or faculty)
router.get('/timetable', authenticate, async (req, res, next) => {
  try {
    const isStudent = req.user.roles.includes('student');
    const isFaculty = req.user.roles.includes('faculty');
    
    let sessions;
    
    if (isStudent) {
      // Get student's timetable
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
      
      sessions = await query(
        `SELECT DISTINCT cs.session_id, cs.session_date, cs.day_of_week, 
                cs.start_time, cs.end_time, cs.room, cs.session_type, cs.status,
                c.course_code, c.title as course_title,
                t.full_name as teacher_name
         FROM class_sessions cs
         JOIN course_offerings co ON cs.offering_id = co.offering_id
         JOIN courses c ON co.course_id = c.course_id
         JOIN enrollments e ON co.offering_id = e.offering_id
         JOIN semesters sem ON co.semester_id = sem.semester_id
         LEFT JOIN users t ON co.teacher_id = t.user_id
         WHERE e.student_id = ? AND sem.status = 'active'
         ORDER BY cs.session_date, cs.start_time`,
        [students[0].student_id]
      );
    } else if (isFaculty) {
      // Get faculty's timetable
      sessions = await query(
        `SELECT DISTINCT cs.session_id, cs.session_date, cs.day_of_week,
                cs.start_time, cs.end_time, cs.room, cs.session_type, cs.status,
                c.course_code, c.title as course_title, co.section
         FROM class_sessions cs
         JOIN course_offerings co ON cs.offering_id = co.offering_id
         JOIN courses c ON co.course_id = c.course_id
         JOIN semesters sem ON co.semester_id = sem.semester_id
         WHERE co.teacher_id = ? AND sem.status = 'active'
         ORDER BY cs.session_date, cs.start_time`,
        [req.user.userId]
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Group by day of week for easy display
    const grouped = {
      Sat: [], Sun: [], Mon: [], Tue: [], Wed: [], Thu: []
    };
    
    sessions.forEach(s => {
      if (grouped[s.day_of_week]) {
        grouped[s.day_of_week].push(s);
      }
    });
    
    res.json({
      success: true,
      data: {
        sessions,
        grouped
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get grade scale
router.get('/grade-scale', authenticate, async (req, res, next) => {
  try {
    const grades = await query(
      'SELECT * FROM grade_scale ORDER BY grade_point DESC'
    );
    
    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
