/**
 * Hostel Routes - Room Allocation, Details
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student hostel details
router.get('/details', authenticate, async (req, res, next) => {
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
    
    const allocation = await query(
      `SELECT ra.*, hr.hostel_name, hr.hostel_type, hr.room_no, hr.floor,
              hr.room_type, hr.capacity, hr.warden_name, hr.warden_phone, hr.warden_email
       FROM room_allocations ra
       JOIN hostel_rooms hr ON ra.room_id = hr.room_id
       WHERE ra.student_id = ? AND ra.status = 'active'`,
      [students[0].student_id]
    );
    
    if (allocation.length === 0) {
      return res.json({
        success: true,
        data: {
          allocated: false,
          message: 'No hostel allocated'
        }
      });
    }
    
    // Get roommates
    const roommates = await query(
      `SELECT s.student_code, u.full_name, ra.bed_no
       FROM room_allocations ra
       JOIN students s ON ra.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE ra.room_id = ? AND ra.status = 'active' AND ra.student_id != ?`,
      [allocation[0].room_id, students[0].student_id]
    );
    
    res.json({
      success: true,
      data: {
        allocated: true,
        allocation: allocation[0],
        roommates
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all hostels (admin)
router.get('/rooms', authenticate, requireRole('admin', 'hostel_manager'), async (req, res, next) => {
  try {
    const { hostel, available } = req.query;
    
    let sql = `
      SELECT hr.*,
             (SELECT COUNT(*) FROM room_allocations WHERE room_id = hr.room_id AND status = 'active') as occupied
      FROM hostel_rooms hr
      WHERE 1=1
    `;
    const params = [];
    
    if (hostel) {
      sql += ' AND hr.hostel_name = ?';
      params.push(hostel);
    }
    
    if (available === 'true') {
      sql += ` AND hr.capacity > (SELECT COUNT(*) FROM room_allocations WHERE room_id = hr.room_id AND status = 'active')`;
    }
    
    sql += ' ORDER BY hr.hostel_name, hr.floor, hr.room_no';
    
    const rooms = await query(sql, params);
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
});

// Get hostel list
router.get('/list', authenticate, async (req, res, next) => {
  try {
    const hostels = await query(
      `SELECT DISTINCT hostel_name, hostel_type, warden_name, warden_phone,
              COUNT(*) as total_rooms,
              SUM(capacity) as total_beds
       FROM hostel_rooms
       GROUP BY hostel_name, hostel_type, warden_name, warden_phone`
    );
    
    res.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    next(error);
  }
});

// Allocate room (admin/hostel_manager)
router.post('/allocate', authenticate, requireRole('admin', 'hostel_manager'), async (req, res, next) => {
  try {
    const { studentId, roomId, bedNo, startDate, annualFee } = req.body;
    
    if (!studentId || !roomId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, room ID, and start date are required'
      });
    }
    
    // Check room capacity
    const room = await query(
      `SELECT hr.*, 
              (SELECT COUNT(*) FROM room_allocations WHERE room_id = hr.room_id AND status = 'active') as occupied
       FROM hostel_rooms hr WHERE hr.room_id = ?`,
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (room[0].occupied >= room[0].capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }
    
    // Check if student already has allocation
    const existing = await query(
      `SELECT * FROM room_allocations WHERE student_id = ? AND status = 'active'`,
      [studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active hostel allocation'
      });
    }
    
    // Create allocation
    const [result] = await query(
      `INSERT INTO room_allocations (student_id, room_id, bed_no, start_date, annual_fee, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [studentId, roomId, bedNo || null, startDate, annualFee || null]
    );
    
    res.json({
      success: true,
      message: 'Room allocated successfully',
      data: { allocationId: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

// End allocation (admin/hostel_manager)
router.post('/deallocate/:allocationId', authenticate, requireRole('admin', 'hostel_manager'), async (req, res, next) => {
  try {
    const { allocationId } = req.params;
    const { endDate } = req.body;
    
    await query(
      `UPDATE room_allocations 
       SET status = 'ended', end_date = ?
       WHERE allocation_id = ?`,
      [endDate || new Date().toISOString().split('T')[0], allocationId]
    );
    
    res.json({
      success: true,
      message: 'Allocation ended successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
