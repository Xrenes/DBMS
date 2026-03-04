/**
 * Finance Routes - Invoices, Payments, Dues
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student finance summary
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
    
    const dues = await query(
      'SELECT * FROM vw_student_dues WHERE student_id = ?',
      [students[0].student_id]
    );
    
    // Get recent invoices
    const invoices = await query(
      `SELECT si.invoice_id, si.invoice_no, si.issue_date, si.due_date, si.status,
              sem.name as semester_name,
              (SELECT SUM(amount) FROM invoice_items WHERE invoice_id = si.invoice_id) as total_amount,
              (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = si.invoice_id) as paid_amount
       FROM student_invoices si
       JOIN semesters sem ON si.semester_id = sem.semester_id
       WHERE si.student_id = ?
       ORDER BY si.issue_date DESC
       LIMIT 5`,
      [students[0].student_id]
    );
    
    res.json({
      success: true,
      data: {
        summary: dues.length > 0 ? dues[0] : null,
        recentInvoices: invoices
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all invoices
router.get('/invoices', authenticate, async (req, res, next) => {
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
    
    const invoices = await query(
      `SELECT si.invoice_id, si.invoice_no, si.issue_date, si.due_date, si.status,
              sem.name as semester_name,
              (SELECT SUM(amount) FROM invoice_items WHERE invoice_id = si.invoice_id) as total_amount,
              (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = si.invoice_id) as paid_amount
       FROM student_invoices si
       JOIN semesters sem ON si.semester_id = sem.semester_id
       WHERE si.student_id = ?
       ORDER BY si.issue_date DESC`,
      [students[0].student_id]
    );
    
    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
});

// Get invoice details
router.get('/invoices/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const invoice = await query(
      `SELECT si.*, sem.name as semester_name,
              s.student_code, u.full_name, u.email
       FROM student_invoices si
       JOIN semesters sem ON si.semester_id = sem.semester_id
       JOIN students s ON si.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE si.invoice_id = ?`,
      [id]
    );
    
    if (invoice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check authorization
    const students = await query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (students.length > 0 && invoice[0].student_id !== students[0].student_id && 
        !req.user.roles.includes('admin') && !req.user.roles.includes('accountant')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get invoice items
    const items = await query(
      `SELECT ii.*, fh.name as fee_head_name
       FROM invoice_items ii
       JOIN fee_heads fh ON ii.fee_head_id = fh.fee_head_id
       WHERE ii.invoice_id = ?`,
      [id]
    );
    
    // Get payments
    const payments = await query(
      `SELECT p.*, u.full_name as recorded_by_name
       FROM payments p
       LEFT JOIN users u ON p.recorded_by = u.user_id
       WHERE p.invoice_id = ?
       ORDER BY p.paid_at`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        invoice: invoice[0],
        items,
        payments,
        totalAmount: items.reduce((sum, item) => sum + parseFloat(item.amount), 0),
        totalPaid: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/payments', authenticate, async (req, res, next) => {
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
    
    const payments = await query(
      `SELECT p.*, si.invoice_no, sem.name as semester_name
       FROM payments p
       JOIN student_invoices si ON p.invoice_id = si.invoice_id
       JOIN semesters sem ON si.semester_id = sem.semester_id
       WHERE si.student_id = ?
       ORDER BY p.paid_at DESC`,
      [students[0].student_id]
    );
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
});

// Get fee heads
router.get('/fee-heads', authenticate, async (req, res, next) => {
  try {
    const feeHeads = await query('SELECT * FROM fee_heads ORDER BY name');
    res.json({
      success: true,
      data: feeHeads
    });
  } catch (error) {
    next(error);
  }
});

// Create invoice (admin/accountant)
router.post('/invoices', authenticate, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { studentId, semesterId, items, dueInDays = 30 } = req.body;
    
    if (!studentId || !semesterId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, semester ID, and items are required'
      });
    }
    
    // Calculate totals
    const tuition = items.find(i => i.feeHeadId === 1)?.amount || 0;
    const lab = items.find(i => i.feeHeadId === 2)?.amount || 0;
    const library = items.find(i => i.feeHeadId === 3)?.amount || 0;
    const development = items.find(i => i.feeHeadId === 4)?.amount || 0;
    const exam = items.find(i => i.feeHeadId === 5)?.amount || 0;
    const misc = items.find(i => i.feeHeadId === 6)?.amount || 0;
    
    // Use stored procedure
    const [result] = await query(
      'CALL sp_generate_invoice(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, semesterId, tuition, lab, library, development, exam, misc, dueInDays]
    );
    
    res.json({
      success: true,
      message: 'Invoice created successfully',
      data: result[0]
    });
  } catch (error) {
    next(error);
  }
});

// Record payment (admin/accountant)
router.post('/payments', authenticate, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { invoiceId, amount, method, referenceNo } = req.body;
    
    if (!invoiceId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID, amount, and method are required'
      });
    }
    
    // Use stored procedure
    const [result] = await query(
      'CALL sp_record_payment(?, ?, ?, ?, ?)',
      [invoiceId, amount, method, referenceNo || null, req.user.userId]
    );
    
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: result[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get students with dues (admin/accountant)
router.get('/defaulters', authenticate, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const defaulters = await query(
      `SELECT * FROM vw_student_dues WHERE outstanding > 0 ORDER BY outstanding DESC`
    );
    
    res.json({
      success: true,
      data: defaulters
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
