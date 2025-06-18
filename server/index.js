const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check polled at', new Date().toISOString());
  res.json({ status: 'ok' });
});

// Get all tools
app.get('/api/tools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tools');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check out a tool
app.post('/api/tools/checkout', async (req, res) => {
  const { toolBarcode, personnelBarcode, area } = req.body;
  try {
    // Look up tool_id from toolBarcode
    const toolResult = await pool.query('SELECT tool_id FROM tools WHERE barcode_id = $1', [toolBarcode]);
    if (toolResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid tool barcode' });
    }
    const tool_id = toolResult.rows[0].tool_id;

    // Look up user_id from personnelBarcode
    const userResult = await pool.query('SELECT user_id FROM users WHERE barcode_id = $1', [personnelBarcode]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid personnel barcode' });
    }
    const user_id = userResult.rows[0].user_id;

    // Look up location_id from area name
    const locationResult = await pool.query('SELECT location_id FROM locations WHERE name = $1', [area]);
    if (locationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid area/location' });
    }
    const location_id = locationResult.rows[0].location_id;

    // Start a transaction
    await pool.query('BEGIN');
    // Update tool status
    await pool.query(
      'UPDATE tools SET status = $1, last_user_id = $2 WHERE tool_id = $3',
      ['checked_out', user_id, tool_id]
    );
    // Record transaction
    await pool.query(
      'INSERT INTO tool_transactions (tool_id, user_id, checkout_time, location_used_id) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)',
      [tool_id, user_id, location_id]
    );
    await pool.query('COMMIT');
    res.json({ message: 'Tool checked out successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check in a tool
app.post('/api/tools/checkin', async (req, res) => {
  const { toolBarcode, personnelBarcode, isStorepersonOverride } = req.body;
  try {
    // Look up tool_id from toolBarcode
    const toolResult = await pool.query('SELECT tool_id, last_user_id, status FROM tools WHERE barcode_id = $1', [toolBarcode]);
    if (toolResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid tool barcode' });
    }
    const { tool_id, last_user_id, status } = toolResult.rows[0];

    // Look up user_id from personnelBarcode
    const userResult = await pool.query('SELECT user_id FROM users WHERE barcode_id = $1', [personnelBarcode]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid personnel barcode' });
    }
    const user_id = userResult.rows[0].user_id;

    // Check if the tool is checked out by this user, unless override
    if (!isStorepersonOverride && last_user_id !== user_id) {
      return res.status(403).json({ error: 'Tool was not checked out by this personnel. Storeperson override required.' });
    }
    if (status !== 'checked_out' && status !== 'overdue') {
      return res.status(400).json({ error: 'Tool is not currently checked out.' });
    }

    await pool.query('BEGIN');
    await pool.query(
      'UPDATE tools SET status = $1, last_user_id = NULL WHERE tool_id = $2',
      ['available', tool_id]
    );
    await pool.query(
      'UPDATE tool_transactions SET checkin_time = CURRENT_TIMESTAMP WHERE tool_id = $1 AND checkin_time IS NULL',
      [tool_id]
    );
    await pool.query('COMMIT');
    res.json({ message: 'Tool checked in successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (placeholder implementation)
app.get('/api/user/current', (req, res) => {
  // You should replace this with real authentication logic
  res.status(200).json({ name: 'Demo User', role: 'worker' });
});

// POST /api/auth/login - Barcode-based authentication
app.post('/api/auth/login', async (req, res) => {
  const { barcodeId } = req.body;
  if (!barcodeId) {
    return res.status(400).json({ error: 'Barcode is required' });
  }
  try {
    const result = await pool.query(
      'SELECT user_id, barcode_id, name, role FROM users WHERE barcode_id = $1 AND active = true',
      [barcodeId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid barcode' });
    }
    const user = result.rows[0];
    // Update last_active_at
    await pool.query('UPDATE users SET last_active_at = NOW() WHERE user_id = $1', [user.user_id]);
    // Insert audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user.user_id, 'LOGIN', 'USER', user.user_id, JSON.stringify({ barcode_id: user.barcode_id })]
    );
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name, barcode_id: user.barcode_id },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    res.json({
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
        barcode_id: user.barcode_id
      },
      token,
      loginSuccess: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/summary - Dashboard metrics for Section 4.3
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    // 1. Checked out tools
    const checkedOutTools = await pool.query(
      `SELECT t.tool_id AS id, t.description AS name, u.name AS user
       FROM tools t
       LEFT JOIN users u ON t.last_user_id = u.user_id
       WHERE t.status = 'checked_out'`
    );

    // 2. Overdue tools (>24h)
    const overdueTools = await pool.query(
      `SELECT t.tool_id AS id, t.description AS name, u.name AS user,
              EXTRACT(HOUR FROM (NOW() - tr.checkout_time)) AS hoursOverdue
       FROM tools t
       LEFT JOIN tool_transactions tr ON t.tool_id = tr.tool_id AND tr.checkin_time IS NULL
       LEFT JOIN users u ON t.last_user_id = u.user_id
       WHERE t.status = 'overdue'`
    );

    // 3. Late return offenders (users with >1 late return in last 30 days)
    const lateReturnOffenders = await pool.query(
      `SELECT u.user_id AS id, u.name, COUNT(*) AS lateReturns
       FROM tool_transactions tr
       JOIN users u ON tr.user_id = u.user_id
       WHERE tr.checkin_time IS NOT NULL
         AND tr.checkout_time < tr.checkin_time - INTERVAL '24 hours'
         AND tr.checkin_time > NOW() - INTERVAL '30 days'
       GROUP BY u.user_id, u.name
       HAVING COUNT(*) > 1`
    );

    // 4. Tools logged today
    const toolsLoggedToday = await pool.query(
      `SELECT COUNT(*) FROM tool_transactions
       WHERE checkout_time::date = CURRENT_DATE`
    );

    // 5. Most used area (by location_used_id in tool_transactions)
    const mostUsedArea = await pool.query(
      `SELECT l.name, COUNT(*) AS count
       FROM tool_transactions tr
       JOIN locations l ON tr.location_used_id = l.location_id
       WHERE tr.checkout_time > NOW() - INTERVAL '30 days'
       GROUP BY l.name
       ORDER BY count DESC
       LIMIT 1`
    );

    // 6. Tool returns count (today)
    const toolReturnsCount = await pool.query(
      `SELECT COUNT(*) FROM tool_transactions
       WHERE checkin_time::date = CURRENT_DATE`
    );

    // 7. Missing tools >24h (checked out or overdue for more than 24h)
    const missingTools = await pool.query(
      `SELECT t.tool_id AS id, t.description AS name,
              EXTRACT(HOUR FROM (NOW() - tr.checkout_time)) AS hoursMissing
       FROM tools t
       LEFT JOIN tool_transactions tr ON t.tool_id = tr.tool_id AND tr.checkin_time IS NULL
       WHERE (t.status = 'checked_out' OR t.status = 'overdue')
         AND tr.checkout_time < NOW() - INTERVAL '24 hours'`
    );

    // 8. Total time lost (sum of lost_time_logs)
    const lostTime = await pool.query(
      `SELECT COALESCE(SUM(time_lost_minutes), 0) AS total FROM lost_time_logs`
    );

    // 9. Lost time logs (last 10)
    const lostTimeLogs = await pool.query(
      `SELECT l.log_id AS id, u.name AS user, t.description AS tool, l.reason, l.time_lost_minutes AS minutes, l.comment, l.timestamp
       FROM lost_time_logs l
       LEFT JOIN users u ON l.user_id = u.user_id
       LEFT JOIN tools t ON l.tool_id = t.tool_id
       ORDER BY l.timestamp DESC
       LIMIT 10`
    );

    // 10. Top offenders: users with tools overdue >24h
    const topOffenders = await pool.query(`
      SELECT u.user_id, u.name, t.description AS tool_name,
             EXTRACT(HOUR FROM (NOW() - tr.checkout_time)) AS hoursOverdue
      FROM tools t
      JOIN tool_transactions tr ON t.tool_id = tr.tool_id AND tr.checkin_time IS NULL
      JOIN users u ON t.last_user_id = u.user_id
      WHERE (t.status = 'overdue' OR t.status = 'checked_out')
        AND tr.checkout_time < NOW() - INTERVAL '24 hours'
      ORDER BY u.name, hoursOverdue DESC
    `);
    // Group by user
    const offendersMap = {};
    for (const row of topOffenders.rows) {
      if (!offendersMap[row.user_id]) {
        offendersMap[row.user_id] = { user: row.name, tools: [] };
      }
      offendersMap[row.user_id].tools.push({ name: row.tool_name, hoursOverdue: Math.round(row.hoursOverdue) });
    }
    const topOffendersList = Object.values(offendersMap);

    res.json({
      checkedOutTools: checkedOutTools.rows,
      overdueTools: overdueTools.rows,
      lateReturnOffenders: lateReturnOffenders.rows,
      toolsLoggedToday: Number(toolsLoggedToday.rows[0].count),
      mostUsedArea: mostUsedArea.rows[0]?.name || '',
      toolReturnsCount: Number(toolReturnsCount.rows[0].count),
      missingTools: missingTools.rows,
      lostTime: Number(lostTime.rows[0].total),
      lostTimeLogs: lostTimeLogs.rows,
      topOffenders: topOffendersList
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Verify tool ownership by barcode
app.get('/api/tools/verify-ownership/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    // Find the tool by barcode
    const toolResult = await pool.query(
      'SELECT tool_id, last_user_id FROM tools WHERE barcode_id = $1',
      [barcode]
    );
    if (toolResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    const { tool_id, last_user_id } = toolResult.rows[0];

    // Find the user who last checked out the tool
    let ownerBarcode = null;
    if (last_user_id) {
      const userResult = await pool.query(
        'SELECT barcode_id FROM users WHERE user_id = $1',
        [last_user_id]
      );
      if (userResult.rows.length > 0) {
        ownerBarcode = userResult.rows[0].barcode_id;
      }
    }

    res.json({
      toolId: tool_id,
      ownerBarcode
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 