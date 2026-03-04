/**
 * Student Portal Backend - Main Server
 * Express.js + MySQL
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const academicRoutes = require('./routes/academic');
const resultsRoutes = require('./routes/results');
const attendanceRoutes = require('./routes/attendance');
const financeRoutes = require('./routes/finance');
const hostelRoutes = require('./routes/hostel');
const transportRoutes = require('./routes/transport');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const queryBuilderRoutes = require('./routes/query-builder');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/query-builder', queryBuilderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║         STUDENT PORTAL BACKEND SERVER                      ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                        ║
║  Port:      ${PORT}                                            ║
║  Mode:      ${process.env.NODE_ENV || 'development'}                                 ║
║  Database:  ${process.env.DB_NAME || 'student_portal'}                             ║
║  API Base:  http://localhost:${PORT}/api                       ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
