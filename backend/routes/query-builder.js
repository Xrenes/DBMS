/**
 * Query Builder Routes - Dynamic SQL Query Execution for Admin Panel
 * Supports: Table browsing, Column info, SELECT queries, JOINs, Aggregation
 * READ-ONLY: Only SELECT queries are allowed
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate, requireRole('admin'));

// ============ TABLE METADATA ============

// Get all tables in the database
router.get('/tables', async (req, res, next) => {
  try {
    const tables = await query(
      `SELECT TABLE_NAME as table_name, TABLE_ROWS as row_count, TABLE_COMMENT as comment,
              ENGINE as engine, CREATE_TIME as created_at
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME || 'student_portal']
    );
    res.json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
});

// Get all views in the database
router.get('/views', async (req, res, next) => {
  try {
    const views = await query(
      `SELECT TABLE_NAME as view_name, VIEW_DEFINITION as definition
       FROM INFORMATION_SCHEMA.VIEWS 
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME || 'student_portal']
    );
    res.json({ success: true, data: views });
  } catch (error) {
    next(error);
  }
});

// Get columns for a specific table
router.get('/tables/:tableName/columns', async (req, res, next) => {
  try {
    const { tableName } = req.params;
    
    // Validate table exists in our database
    const tableCheck = await query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'student_portal', tableName]
    );
    
    if (tableCheck[0].cnt === 0) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    
    const columns = await query(
      `SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, 
              COLUMN_TYPE as column_type, IS_NULLABLE as nullable,
              COLUMN_KEY as column_key, COLUMN_DEFAULT as default_value,
              EXTRA as extra, CHARACTER_MAXIMUM_LENGTH as max_length
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME || 'student_portal', tableName]
    );
    
    res.json({ success: true, data: columns });
  } catch (error) {
    next(error);
  }
});

// Get foreign keys for a table
router.get('/tables/:tableName/foreign-keys', async (req, res, next) => {
  try {
    const { tableName } = req.params;
    
    const fks = await query(
      `SELECT 
        kcu.COLUMN_NAME as column_name,
        kcu.REFERENCED_TABLE_NAME as referenced_table,
        kcu.REFERENCED_COLUMN_NAME as referenced_column,
        kcu.CONSTRAINT_NAME as constraint_name
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       WHERE kcu.TABLE_SCHEMA = ? 
         AND kcu.TABLE_NAME = ? 
         AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY kcu.COLUMN_NAME`,
      [process.env.DB_NAME || 'student_portal', tableName]
    );
    
    res.json({ success: true, data: fks });
  } catch (error) {
    next(error);
  }
});

// Get indexes for a table
router.get('/tables/:tableName/indexes', async (req, res, next) => {
  try {
    const { tableName } = req.params;
    
    const indexes = await query(
      `SELECT INDEX_NAME as index_name, COLUMN_NAME as column_name,
              NON_UNIQUE as non_unique, INDEX_TYPE as index_type
       FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
      [process.env.DB_NAME || 'student_portal', tableName]
    );
    
    res.json({ success: true, data: indexes });
  } catch (error) {
    next(error);
  }
});

// Get distinct values for a column (for filter UI)
router.get('/tables/:tableName/columns/:columnName/values', async (req, res, next) => {
  try {
    const { tableName, columnName } = req.params;
    const { limit = 100 } = req.query;
    
    // Validate table and column exist
    const colCheck = await query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME || 'student_portal', tableName, columnName]
    );
    
    if (colCheck[0].cnt === 0) {
      return res.status(404).json({ success: false, message: 'Column not found' });
    }
    
    // Use backtick escaping for table/column names (safe since we validated above)
    const values = await query(
      `SELECT DISTINCT \`${columnName}\` as value, COUNT(*) as count 
       FROM \`${tableName}\` 
       GROUP BY \`${columnName}\` 
       ORDER BY count DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    res.json({ success: true, data: values });
  } catch (error) {
    next(error);
  }
});

// ============ DATA BROWSING ============

// Browse table data with pagination
router.get('/tables/:tableName/data', async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 50, sortBy, sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    // Validate table exists
    const tableCheck = await query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'student_portal', tableName]
    );
    
    if (tableCheck[0].cnt === 0) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    
    let sql = `SELECT * FROM \`${tableName}\``;
    
    if (sortBy) {
      const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      sql += ` ORDER BY \`${sortBy}\` ${order}`;
    }
    
    sql += ` LIMIT ? OFFSET ?`;
    
    const data = await query(sql, [parseInt(limit), parseInt(offset)]);
    const countResult = await query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
    
    res.json({
      success: true,
      data,
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

// ============ QUERY EXECUTION ============

// Execute a custom SELECT query (READ-ONLY)
router.post('/execute', async (req, res, next) => {
  try {
    const { sql: userSql } = req.body;
    
    if (!userSql) {
      return res.status(400).json({ success: false, message: 'SQL query is required' });
    }
    
    // Security: Only allow SELECT, SHOW, DESCRIBE, EXPLAIN statements
    const trimmed = userSql.trim().toUpperCase();
    const allowed = ['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN'];
    const startsWithAllowed = allowed.some(kw => trimmed.startsWith(kw));
    
    if (!startsWithAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed'
      });
    }
    
    // Block dangerous keywords
    const blocked = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'];
    const hasBlocked = blocked.some(kw => trimmed.includes(kw));
    
    if (hasBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Query contains forbidden keywords (write operations not allowed)'
      });
    }
    
    const startTime = Date.now();
    const results = await query(userSql);
    const executionTime = Date.now() - startTime;
    
    // Get column info from results
    let columns = [];
    if (results.length > 0) {
      columns = Object.keys(results[0]).map(key => ({
        name: key,
        type: typeof results[0][key]
      }));
    }
    
    res.json({
      success: true,
      data: results,
      meta: {
        rowCount: results.length,
        columns,
        executionTime: `${executionTime}ms`
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      sqlState: error.sqlState,
      errno: error.errno
    });
  }
});

// ============ STORED PROCEDURES ============

// Get stored procedures list
router.get('/procedures', async (req, res, next) => {
  try {
    const procedures = await query(
      `SELECT ROUTINE_NAME as name, ROUTINE_TYPE as type, 
              CREATED as created_at, LAST_ALTERED as updated_at,
              ROUTINE_COMMENT as comment
       FROM INFORMATION_SCHEMA.ROUTINES 
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
       ORDER BY ROUTINE_NAME`,
      [process.env.DB_NAME || 'student_portal']
    );
    res.json({ success: true, data: procedures });
  } catch (error) {
    next(error);
  }
});

// Get triggers list
router.get('/triggers', async (req, res, next) => {
  try {
    const triggers = await query(
      `SELECT TRIGGER_NAME as name, EVENT_MANIPULATION as event,
              EVENT_OBJECT_TABLE as table_name, ACTION_TIMING as timing,
              ACTION_STATEMENT as statement, CREATED as created_at
       FROM INFORMATION_SCHEMA.TRIGGERS 
       WHERE TRIGGER_SCHEMA = ?
       ORDER BY EVENT_OBJECT_TABLE, ACTION_TIMING`,
      [process.env.DB_NAME || 'student_portal']
    );
    res.json({ success: true, data: triggers });
  } catch (error) {
    next(error);
  }
});

// ============ SCHEMA INFO ============

// EXPLAIN — execution plan for a SELECT query
router.post('/explain', async (req, res, next) => {
  try {
    const { sql: userSql } = req.body;
    if (!userSql) return res.status(400).json({ success: false, message: 'SQL required' });
    const trimmed = userSql.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT')) {
      return res.status(400).json({ success: false, message: 'Only SELECT queries can be explained' });
    }
    const startTime = Date.now();
    const plan = await query(`EXPLAIN ${userSql}`);
    const elapsed = Date.now() - startTime;
    // Try EXPLAIN ANALYZE (MySQL 8.0.18+)
    let analyze = null;
    try { analyze = await query(`EXPLAIN ANALYZE ${userSql}`); } catch (_) { /* older MySQL */ }
    res.json({ success: true, data: { plan, analyze, executionTime: `${elapsed}ms` } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============ SAVED QUERIES ============

// List user's saved queries
router.get('/saved', async (req, res, next) => {
  try {
    const queries = await query(
      `SELECT sq.*, u.full_name as author
       FROM saved_queries sq
       LEFT JOIN users u ON sq.created_by = u.user_id
       ORDER BY sq.updated_at DESC`
    );
    res.json({ success: true, data: queries });
  } catch (error) { next(error); }
});

// Get one saved query with its operations
router.get('/saved/:id', async (req, res, next) => {
  try {
    const [q] = await query('SELECT * FROM saved_queries WHERE query_id = ?', [req.params.id]);
    if (!q) return res.status(404).json({ success: false, message: 'Query not found' });
    const ops = await query(
      'SELECT * FROM query_operations WHERE query_id = ? ORDER BY op_order', [req.params.id]
    );
    // Parse JSON config
    ops.forEach(o => { try { o.op_config = JSON.parse(o.op_config); } catch(_){} });
    res.json({ success: true, data: { ...q, operations: ops } });
  } catch (error) { next(error); }
});

// Save a new query + operations
router.post('/saved', async (req, res, next) => {
  try {
    const { title, description, operations } = req.body;
    // created_by = 1 (admin) since we auto-login
    const result = await query(
      'INSERT INTO saved_queries (title, description, created_by) VALUES (?, ?, 1)',
      [title || 'Untitled Query', description || null]
    );
    const queryId = result.insertId;
    if (operations && operations.length) {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        await query(
          'INSERT INTO query_operations (query_id, op_order, op_type, op_config) VALUES (?, ?, ?, ?)',
          [queryId, i, op.op_type, JSON.stringify(op.op_config)]
        );
      }
    }
    res.json({ success: true, data: { query_id: queryId } });
  } catch (error) { next(error); }
});

// Update a saved query
router.put('/saved/:id', async (req, res, next) => {
  try {
    const { title, description, operations } = req.body;
    await query('UPDATE saved_queries SET title=?, description=? WHERE query_id=?',
      [title, description || null, req.params.id]);
    // Replace operations
    await query('DELETE FROM query_operations WHERE query_id=?', [req.params.id]);
    if (operations && operations.length) {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        await query(
          'INSERT INTO query_operations (query_id, op_order, op_type, op_config) VALUES (?, ?, ?, ?)',
          [req.params.id, i, op.op_type, JSON.stringify(op.op_config)]
        );
      }
    }
    res.json({ success: true });
  } catch (error) { next(error); }
});

// Delete a saved query
router.delete('/saved/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM saved_queries WHERE query_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// ============ EXPORT (CSV) ============
router.post('/export-csv', async (req, res, next) => {
  try {
    const { sql: userSql } = req.body;
    if (!userSql) return res.status(400).json({ success: false, message: 'SQL required' });
    const trimmed = userSql.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT')) {
      return res.status(403).json({ success: false, message: 'Only SELECT allowed' });
    }
    const rows = await query(userSql);
    if (!rows.length) return res.status(200).send('');
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        const v = r[h];
        if (v === null) return '';
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    res.send(csv);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get complete ER diagram data (tables + relationships)
router.get('/schema', async (req, res, next) => {
  try {
    const tables = await query(
      `SELECT TABLE_NAME as table_name, TABLE_ROWS as row_count
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME || 'student_portal']
    );
    
    const relationships = await query(
      `SELECT 
        kcu.TABLE_NAME as from_table,
        kcu.COLUMN_NAME as from_column,
        kcu.REFERENCED_TABLE_NAME as to_table,
        kcu.REFERENCED_COLUMN_NAME as to_column,
        kcu.CONSTRAINT_NAME as fk_name
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY kcu.TABLE_NAME`,
      [process.env.DB_NAME || 'student_portal']
    );
    
    res.json({
      success: true,
      data: { tables, relationships }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
