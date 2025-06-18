const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function initializeDatabase() {
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');

    // Create initial admin user if not exists
    const adminCheck = await pool.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (barcode_id, name, role, phone)
         VALUES ($1, $2, $3, $4)`,
        ['ADMIN001', 'System Administrator', 'admin', '0000000000']
      );
      console.log('Initial admin user created');
    }

    // Create initial tool types if not exists
    const toolTypes = [
      'Hand Tool',
      'Power Tool',
      'Measuring Tool',
      'Safety Equipment',
      'Specialty Tool'
    ];

    for (const type of toolTypes) {
      await pool.query(
        `INSERT INTO tool_types (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [type]
      );
    }
    console.log('Initial tool types created');

    // Create initial locations if not exists
    const locations = [
      'Commissioning Store',
      'Mech Container',
      'Site Office',
      'Tool Room',
      'Field Storage'
    ];

    for (const location of locations) {
      await pool.query(
        `INSERT INTO locations (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [location]
      );
    }
    console.log('Initial locations created');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase; 