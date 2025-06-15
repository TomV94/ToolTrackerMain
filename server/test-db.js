const pool = require('./db');

async function testConnection() {
    try {
        // Test basic connection
        const client = await pool.connect();
        console.log('Successfully connected to the database!');

        // Test querying users table
        const usersResult = await client.query('SELECT * FROM users');
        console.log('\nUsers in database:');
        console.log(usersResult.rows);

        // Test querying tools table
        const toolsResult = await client.query('SELECT * FROM tools');
        console.log('\nTools in database:');
        console.log(toolsResult.rows);

        // Test querying transactions table
        const transactionsResult = await client.query('SELECT * FROM transactions');
        console.log('\nTransactions in database:');
        console.log(transactionsResult.rows);

        // Release the client back to the pool
        client.release();
    } catch (err) {
        console.error('Error testing database connection:', err);
    } finally {
        // Close the pool
        await pool.end();
    }
}

testConnection(); 