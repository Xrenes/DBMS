/**
 * Student Portal Backend - Main Server
 * Express.js + MySQL
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const academicRoutes = require('./routes/academic');
const resultsRoutes = require('./routes/results');
const attendanceRoutes = require('./routes/attendance');
const financeRoutes = require('./routes/finance');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const queryBuilderRoutes = require('./routes/query-builder');
const evaluationRoutes = require('./routes/evaluation');
const facultyRoutes = require('./routes/faculty');
const leaveRoutes = require('./routes/leave');
const registrationRoutes = require('./routes/registration');
const clearanceRoutes = require('./routes/clearance');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname, '..')));

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/query-builder', queryBuilderRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/clearance', clearanceRoutes);

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
  let dbStatus = 'connected';
  try {
    await testConnection();
  } catch (error) {
    dbStatus = 'disconnected (mock data only)';
    console.warn('⚠ Database connection failed:', error.message);
    console.warn('  Server will start anyway — frontend uses mock data.');
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         STUDENT PORTAL BACKEND SERVER                      ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                        ║
║  Port:      ${PORT}                                            ║
║  Mode:      ${process.env.NODE_ENV || 'development'}                                 ║
║  Database:  ${dbStatus}                                        ║
║  API Base:  http://localhost:${PORT}/api                       ║
║  Frontend:  http://localhost:${PORT}/login-student.html        ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}

startServer();

module.exports = app;
