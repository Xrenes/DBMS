/**
 * Authentication Routes - Login, Register, Password
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Get user with roles
    const users = await query(
      `SELECT u.user_id, u.email, u.password_hash, u.full_name, u.status,
              GROUP_CONCAT(DISTINCT r.role_name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.email = ?
       GROUP BY u.user_id`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Get student info if student role
    let studentInfo = null;
    if (user.roles && user.roles.includes('student')) {
      const students = await query(
        `SELECT s.student_id, s.student_code, p.name as program_name, 
                d.name as department_name, s.batch_year, s.section
         FROM students s
         JOIN programs p ON s.program_id = p.program_id
         JOIN departments d ON p.dept_id = d.dept_id
         WHERE s.user_id = ?`,
        [user.user_id]
      );
      if (students.length > 0) {
        studentInfo = students[0];
      }
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Log login event to ledger
    await query(
      `INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
       VALUES (?, 'USER_LOGIN', 'user', ?, ?)`,
      [user.user_id, user.user_id, JSON.stringify({ ip: req.ip, userAgent: req.get('User-Agent') })]
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          roles: user.roles ? user.roles.split(',') : [],
          student: studentInfo
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const users = await query(
      `SELECT u.user_id, u.email, u.full_name, u.phone, u.status, u.created_at,
              GROUP_CONCAT(DISTINCT r.role_name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Get student details if student role
    let studentInfo = null;
    if (user.roles && user.roles.includes('student')) {
      const students = await query(
        `SELECT s.*, p.name as program_name, p.code as program_code,
                d.name as department_name, d.code as dept_code,
                advisor.full_name as advisor_name
         FROM students s
         JOIN programs p ON s.program_id = p.program_id
         JOIN departments d ON p.dept_id = d.dept_id
         LEFT JOIN users advisor ON s.advisor_id = advisor.user_id
         WHERE s.user_id = ?`,
        [req.user.userId]
      );
      if (students.length > 0) {
        studentInfo = students[0];
      }
    }
    
    // Get permissions
    const permissions = await query(
      `SELECT DISTINCT p.perm_code
       FROM permissions p
       JOIN role_permissions rp ON p.perm_id = rp.perm_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [req.user.userId]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          status: user.status,
          createdAt: user.created_at,
          roles: user.roles ? user.roles.split(',') : [],
          permissions: permissions.map(p => p.perm_code)
        },
        student: studentInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get current password hash
    const users = await query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, req.user.userId]
    );
    
    // Log to ledger
    await query(
      `INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
       VALUES (?, 'PASSWORD_CHANGED', 'user', ?, '{}')`,
      [req.user.userId, req.user.userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal, server logs event)
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Log logout event
    await query(
      `INSERT INTO ledger_events (actor_user_id, event_type, entity_type, entity_id, payload)
       VALUES (?, 'USER_LOGOUT', 'user', ?, '{}')`,
      [req.user.userId, req.user.userId]
    );
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
