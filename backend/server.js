/**
 * Student Portal Backend - Main Server
 * Express.js + MySQL
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Security headers (clickjacking, XSS, MIME-sniffing, etc.)
app.use(helmet());

// CORS — restrict to specific origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500,http://127.0.0.1:5500').split(',').map(o => o.trim());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting — global: 100 req/15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Strict rate limit on auth routes — 10 req/15min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/change-password', authLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
