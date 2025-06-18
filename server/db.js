// Import the pg module to talk to PostgreSQL
const { Pool } = require('pg');

// Import dotenv to load credentials from .env file
require('dotenv').config();

// Create a new PostgreSQL connection pool using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Export the pool so other parts of the app can use it
module.exports = pool;