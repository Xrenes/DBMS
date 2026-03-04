/**
 * Results Routes - Grades, CGPA, SGPA, Transcript
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/db');
const { authenticate, requireRole, requirePermission } = require('../middleware/auth');

// Get student CGPA
router.get('/cgpa', authenticate, async (req, res, next) => {
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
    
    const cgpa = await query(
      'SELECT * FROM vw_student_cgpa WHERE student_id = ?',
      [students[0].student_id]
    );
    
    res.json({
      success: true,
      data: cgpa.length > 0 ? cgpa[0] : null
    });
  } catch (error) {
    next(error);
  }
});

// Get semester-wise SGPA
router.get('/sgpa', authenticate, async (req, res, next) => {
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
    
    const sgpa = await query(
      'SELECT * FROM vw_semester_sgpa WHERE student_id = ? ORDER BY semester_id',
      [students[0].student_id]
    );
    
    res.json({
      success: true,
      data: sgpa
    });
  } catch (error) {
    next(error);
  }
});

// Get all results (transcript)
router.get('/transcript', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      `SELECT s.student_id, s.student_code, u.full_name,
              p.name as program_name, d.name as dept_name
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       JOIN programs p ON s.program_id = p.program_id
       JOIN departments d ON p.dept_id = d.dept_id
       WHERE s.user_id = ?`,
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const student = students[0];
    
    // Get all results grouped by semester
    const results = await query(
      `SELECT r.result_id, r.total_mark, r.grade_code, r.published_at, r.locked,
              g.grade_point, g.remark,
              c.course_code, c.title, c.credit, c.category,
              sem.semester_id, sem.name as semester_name
       FROM results r
       JOIN enrollments e ON r.enrollment_id = e.enrollment_id
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN semesters sem ON co.semester_id = sem.semester_id
       JOIN grade_scale g ON r.grade_code = g.grade_code
       WHERE e.student_id = ? AND r.published_at IS NOT NULL
       ORDER BY sem.start_date, c.course_code`,
      [student.student_id]
    );
    
    // Group by semester
    const semesters = {};
    results.forEach(r => {
      if (!semesters[r.semester_id]) {
        semesters[r.semester_id] = {
          semesterId: r.semester_id,
          semesterName: r.semester_name,
          courses: [],
          totalCredits: 0,
          totalPoints: 0
        };
      }
      semesters[r.semester_id].courses.push(r);
      semesters[r.semester_id].totalCredits += parseFloat(r.credit);
      semesters[r.semester_id].totalPoints += parseFloat(r.credit) * parseFloat(r.grade_point);
    });
    
    // Calculate SGPA for each semester
    Object.values(semesters).forEach(sem => {
      sem.sgpa = sem.totalCredits > 0 
        ? (sem.totalPoints / sem.totalCredits).toFixed(2) 
        : 0;
    });
    
    // Get overall CGPA
    const cgpa = await query(
      'SELECT * FROM vw_student_cgpa WHERE student_id = ?',
      [student.student_id]
    );
    
    res.json({
      success: true,
      data: {
        student,
        semesters: Object.values(semesters),
        summary: cgpa.length > 0 ? cgpa[0] : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get live marks (current semester components)
router.get('/live', authenticate, async (req, res, next) => {
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
    
    // Get live marks summary
    const liveMarks = await query(
      'SELECT * FROM vw_live_marks WHERE student_id = ?',
      [students[0].student_id]
    );
    
    // Get detailed component marks
    const components = await query(
      `SELECT ex.exam_id, ex.exam_type, ex.name, ex.total_marks, ex.weight_percent,
              em.obtained_marks, em.is_published, em.published_at,
              c.course_code, c.title as course_title,
              co.offering_id
       FROM exams ex
       JOIN course_offerings co ON ex.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN semesters sem ON co.semester_id = sem.semester_id
       JOIN enrollments e ON co.offering_id = e.offering_id
       LEFT JOIN exam_marks em ON ex.exam_id = em.exam_id AND em.student_id = e.student_id
       WHERE e.student_id = ? AND sem.status = 'active'
       ORDER BY c.course_code, ex.exam_type, ex.name`,
      [students[0].student_id]
    );
    
    // Group by course
    const courses = {};
    components.forEach(comp => {
      if (!courses[comp.course_code]) {
        courses[comp.course_code] = {
          courseCode: comp.course_code,
          courseTitle: comp.course_title,
          offeringId: comp.offering_id,
          components: [],
          publishedWeight: 0,
          weightedScore: 0
        };
      }
      courses[comp.course_code].components.push(comp);
      if (comp.is_published && comp.obtained_marks !== null) {
        const score = (comp.obtained_marks / comp.total_marks) * comp.weight_percent;
        courses[comp.course_code].weightedScore += score;
        courses[comp.course_code].publishedWeight += parseFloat(comp.weight_percent);
      }
    });
    
    res.json({
      success: true,
      data: {
        summary: liveMarks,
        courses: Object.values(courses)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Enter/update marks (faculty)
router.post('/marks', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const { examId, marks } = req.body;
    
    if (!examId || !Array.isArray(marks)) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and marks array required'
      });
    }
    
    // Verify faculty teaches this course
    const exam = await query(
      `SELECT ex.*, co.teacher_id FROM exams ex
       JOIN course_offerings co ON ex.offering_id = co.offering_id
       WHERE ex.exam_id = ?`,
      [examId]
    );
    
    if (exam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    if (exam[0].teacher_id !== req.user.userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to enter marks for this exam'
      });
    }
    
    // Insert/update marks
    for (const mark of marks) {
      await query(
        `INSERT INTO exam_marks (exam_id, student_id, obtained_marks, is_published)
         VALUES (?, ?, ?, FALSE)
         ON DUPLICATE KEY UPDATE obtained_marks = VALUES(obtained_marks)`,
        [examId, mark.studentId, mark.obtainedMarks]
      );
    }
    
    res.json({
      success: true,
      message: 'Marks saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Publish marks (faculty)
router.post('/marks/publish', authenticate, requireRole('faculty', 'admin'), async (req, res, next) => {
  try {
    const { examId } = req.body;
    
    if (!examId) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID required'
      });
    }
    
    await query(
      `UPDATE exam_marks SET is_published = TRUE, published_at = NOW()
       WHERE exam_id = ? AND is_published = FALSE`,
      [examId]
    );
    
    // Log to ledger
    await query(
      `INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
       VALUES (?, 'MARKS_PUBLISHED', 'exam', ?, ?)`,
      [req.user.userId, examId, JSON.stringify({ examId, publishedAt: new Date() })]
    );
    
    res.json({
      success: true,
      message: 'Marks published successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Publish final results (admin)
router.post('/publish', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { offeringId } = req.body;
    
    if (!offeringId) {
      return res.status(400).json({
        success: false,
        message: 'Offering ID required'
      });
    }
    
    // Use stored procedure
    await query('CALL sp_publish_results(?, ?)', [offeringId, req.user.userId]);
    
    res.json({
      success: true,
      message: 'Results published successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
