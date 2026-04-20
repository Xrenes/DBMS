/**
 * Transport Routes - Bus Routes, Subscriptions
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student transport subscription
router.get('/subscription', authenticate, async (req, res, next) => {
  try {
    const students = await query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const subscription = await query(
      `SELECT ts.*, tr.route_name, tr.origin, tr.destination, tr.via_points,
              tr.vehicle_no, tr.driver_name, tr.driver_phone, tr.departure_time, tr.arrival_time
       FROM transport_subscriptions ts
       JOIN transport_routes tr ON ts.route_id = tr.route_id
       WHERE ts.student_id = ? AND ts.status = 'active'`,
      [students[0].student_id]
    );
    
    if (subscription.length === 0) {
      return res.json({
        success: true,
        data: { subscribed: false, message: 'No active transport subscription' }
      });
    }
    
    res.json({
      success: true,
      data: { subscribed: true, subscription: subscription[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Get all routes
router.get('/routes', authenticate, async (req, res, next) => {
  try {
    const routes = await query(
      `SELECT tr.*,
              (SELECT COUNT(*) FROM transport_subscriptions WHERE route_id = tr.route_id AND status = 'active') as current_subscribers
       FROM transport_routes tr
       WHERE tr.status = 'active'
       ORDER BY tr.route_name`
    );
    
    res.json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
});

// Get route details
router.get('/routes/:routeId', authenticate, async (req, res, next) => {
  try {
    const route = await query(
      `SELECT * FROM transport_routes WHERE route_id = ?`,
      [req.params.routeId]
    );
    
    if (route.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    res.json({ success: true, data: route[0] });
  } catch (error) {
    next(error);
  }
});

// Subscribe to route (admin/transport_manager)
router.post('/subscribe', authenticate, requireRole('admin', 'transport_manager'), async (req, res, next) => {
  try {
    const { studentId, routeId, pickupPoint, startDate, monthlyFee } = req.body;
    
    if (!studentId || !routeId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, route ID, and start date are required'
      });
    }
    
    // Check existing subscription
    const existing = await query(
      `SELECT * FROM transport_subscriptions WHERE student_id = ? AND status = 'active'`,
      [studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active transport subscription'
      });
    }
    
    const [result] = await query(
      `INSERT INTO transport_subscriptions (student_id, route_id, pickup_point, start_date, monthly_fee, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [studentId, routeId, pickupPoint, startDate, monthlyFee || 0]
    );
    
    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscriptionId: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/unsubscribe/:subscriptionId', authenticate, requireRole('admin', 'transport_manager'), async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const { endDate } = req.body;
    
    await query(
      `UPDATE transport_subscriptions SET status = 'cancelled', end_date = ? WHERE subscription_id = ?`,
      [endDate || new Date().toISOString().split('T')[0], subscriptionId]
    );
    
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
});

// Add/update route (admin)
router.post('/routes', authenticate, requireRole('admin', 'transport_manager'), async (req, res, next) => {
  try {
    const { routeName, origin, destination, viaPoints, vehicleNo, driverName, driverPhone, departureTime, arrivalTime, capacity } = req.body;
    
    const [result] = await query(
      `INSERT INTO transport_routes (route_name, origin, destination, via_points, vehicle_no, driver_name, driver_phone, departure_time, arrival_time, capacity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [routeName, origin, destination, JSON.stringify(viaPoints || []), vehicleNo, driverName, driverPhone, departureTime, arrivalTime, capacity || 50]
    );
    
    res.json({
      success: true,
      message: 'Route created successfully',
      data: { routeId: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
