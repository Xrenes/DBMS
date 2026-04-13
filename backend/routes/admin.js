/**
 * Admin Routes - CRUD Operations, Audit Logs, System Config
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/db');
const { authenticate, requireRole, requirePermission } = require('../middleware/auth');

// ============ USERS ============

// Get all users
router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT u.user_id, u.email, u.full_name, u.phone, u.status, u.created_at,
             GROUP_CONCAT(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' GROUP BY u.user_id';
    
    if (role) {
      sql = `SELECT * FROM (${sql}) AS subq WHERE roles LIKE ?`;
      params.push(`%${role}%`);
    }
    
    sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const users = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) as total FROM users');
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { email, password, fullName, phone, roles } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await transaction(async (conn) => {
      const [userResult] = await conn.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [email, hashedPassword, fullName, phone]
      );
      
      const userId = userResult.insertId;
      
      // Assign roles
      if (roles && roles.length > 0) {
        for (const roleName of roles) {
          const [roleRows] = await conn.execute(
            'SELECT role_id FROM roles WHERE role_name = ?',
            [roleName]
          );
          if (roleRows.length > 0) {
            await conn.execute(
              'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
              [userId, roleRows[0].role_id]
            );
          }
        }
      }
      
      return userId;
    });
    
    res.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
});

// Update user
router.put('/users/:userId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, status } = req.body;
    
    await query(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, status = ? WHERE user_id = ?`,
      [fullName, email, phone, status, userId]
    );
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
});

// ============ STUDENTS ============

// Get all students
router.get('/students', authenticate, requireRole('admin', 'faculty'), async (req, res, next) => {
  try {
    const { program, status, batch, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT s.*, u.full_name, u.email, u.phone, p.name as program_name, d.dept_name
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN programs p ON s.program_id = p.program_id
      JOIN departments d ON p.dept_id = d.dept_id
      WHERE 1=1
    `;
    const params = [];
    
    if (program) {
      sql += ' AND s.program_id = ?';
      params.push(program);
    }
    
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    
    if (batch) {
      sql += ' AND s.batch = ?';
      params.push(batch);
    }
    
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR s.student_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY s.student_code LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const students = await query(sql, params);
    
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
});

// Create student
router.post('/students', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { email, password, fullName, phone, programId, batch, admissionDate, bloodGroup, address, guardianName, guardianPhone } = req.body;
    
    await transaction(async (conn) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const [userResult] = await conn.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [email, hashedPassword, fullName, phone]
      );
      
      const userId = userResult.insertId;
      
      // Assign student role
      const [roleRows] = await conn.execute(
        'SELECT role_id FROM roles WHERE role_name = ?',
        ['student']
      );
      await conn.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleRows[0].role_id]
      );
      
      // Generate student code
      const year = new Date().getFullYear().toString().slice(-2);
      const [countResult] = await conn.execute(
        'SELECT COUNT(*) as count FROM students WHERE batch = ?',
        [batch]
      );
      const studentCode = `STU${year}${String(countResult[0].count + 1).padStart(4, '0')}`;
      
      // Create student record
      await conn.execute(
        `INSERT INTO students (user_id, student_code, program_id, batch, admission_date, blood_group, address, guardian_name, guardian_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [userId, studentCode, programId, batch, admissionDate, bloodGroup, address, guardianName, guardianPhone]
      );
    });
    
    res.json({ success: true, message: 'Student created successfully' });
  } catch (error) {
    next(error);
  }
});

// ============ COURSES ============

// Get all courses
router.get('/courses', authenticate, requireRole('admin', 'faculty'), async (req, res, next) => {
  try {
    const courses = await query(
      `SELECT c.*, d.dept_name
       FROM courses c
       JOIN departments d ON c.dept_id = d.dept_id
       ORDER BY c.course_code`
    );
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
});

// Create course
router.post('/courses', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseCode, courseName, deptId, credits, courseType } = req.body;
    
    await query(
      `INSERT INTO courses (course_code, course_name, dept_id, credits, course_type)
       VALUES (?, ?, ?, ?, ?)`,
      [courseCode, courseName, deptId, credits, courseType || 'theory']
    );
    
    res.json({ success: true, message: 'Course created successfully' });
  } catch (error) {
    next(error);
  }
});

// ============ AUDIT LOGS ============

// Get audit logs
router.get('/audit-logs', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { tableName, action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT al.*, u.email, u.full_name
      FROM audit_logs al
      JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (tableName) {
      sql += ' AND al.table_name = ?';
      params.push(tableName);
    }
    
    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }
    
    if (userId) {
      sql += ' AND al.user_id = ?';
      params.push(userId);
    }
    
    if (startDate) {
      sql += ' AND al.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND al.created_at <= ?';
      params.push(endDate);
    }
    
    sql += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const logs = await query(sql, params);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

// ============ LEDGER (BLOCKCHAIN-STYLE) ============

// Get ledger events
router.get('/ledger', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const events = await query(
      `SELECT * FROM ledger_events ORDER BY event_id DESC LIMIT ?`,
      [parseInt(limit)]
    );
    
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

// Verify ledger integrity
router.get('/ledger/verify', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const events = await query(
      `SELECT * FROM ledger_events ORDER BY event_id ASC`
    );
    
    let valid = true;
    let brokenAt = null;
    
    for (let i = 1; i < events.length; i++) {
      if (events[i].prev_hash !== events[i-1].curr_hash) {
        valid = false;
        brokenAt = events[i].event_id;
        break;
      }
    }
    
    res.json({
      success: true,
      data: {
        valid,
        totalEvents: events.length,
        brokenAt: brokenAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============ SYSTEM CONFIG ============

// Get system config
router.get('/config', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const config = await query('SELECT * FROM system_config');
    
    const configMap = {};
    config.forEach(c => {
      configMap[c.config_key] = c.config_value;
    });
    
    res.json({ success: true, data: configMap });
  } catch (error) {
    next(error);
  }
});

// Update system config
router.put('/config/:key', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await query(
      `INSERT INTO system_config (config_key, config_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE config_value = ?`,
      [key, value, value]
    );
    
    res.json({ success: true, message: 'Config updated' });
  } catch (error) {
    next(error);
  }
});

// ============ ROLES & PERMISSIONS ============

// Get all roles
router.get('/roles', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const roles = await query(
      `SELECT r.*, GROUP_CONCAT(p.permission_name) as permissions
       FROM roles r
       LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.permission_id
       GROUP BY r.role_id`
    );
    
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
});

// Get all permissions
router.get('/permissions', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const permissions = await query('SELECT * FROM permissions ORDER BY permission_name');
    res.json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
});

// Assign permission to role
router.post('/roles/:roleId/permissions', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { permissionId } = req.body;
    
    await query(
      'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [roleId, permissionId]
    );
    
    res.json({ success: true, message: 'Permission assigned' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
