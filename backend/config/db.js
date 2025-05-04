const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dicel_erp',
    password: '0123',
    port: 5434,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
        return true;
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error.message);
        return false;
    }
}

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
};