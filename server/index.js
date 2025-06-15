const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
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
  const { tool_id, user_id } = req.body;
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Update tool status
    await pool.query(
      'UPDATE tools SET status = $1 WHERE id = $2',
      ['checked_out', tool_id]
    );
    
    // Record transaction
    await pool.query(
      'INSERT INTO transactions (tool_id, user_id, action) VALUES ($1, $2, $3)',
      [tool_id, user_id, 'check_out']
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
  const { tool_id, user_id } = req.body;
  try {
    await pool.query('BEGIN');
    
    await pool.query(
      'UPDATE tools SET status = $1 WHERE id = $2',
      ['available', tool_id]
    );
    
    await pool.query(
      'INSERT INTO transactions (tool_id, user_id, action) VALUES ($1, $2, $3)',
      [tool_id, user_id, 'check_in']
    );
    
    await pool.query('COMMIT');
    res.json({ message: 'Tool checked in successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 