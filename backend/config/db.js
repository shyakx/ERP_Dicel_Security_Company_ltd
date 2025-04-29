const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dicel_erp',
    password: '0123',
    port: 5434,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection error:', err.message);
        console.error('Connection details:', {
            host: pool.options.host,
            port: pool.options.port,
            database: pool.options.database,
            user: pool.options.user
        });
        return false;
    }
};

pool.on('connect', () => {
    console.log('New client connected to the database');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
});

module.exports = {
    pool,
    testConnection
};