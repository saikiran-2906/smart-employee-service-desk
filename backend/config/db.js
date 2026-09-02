// config/db.js
//
// Creates ONE shared connection pool to MySQL, using the
// credentials from .env. Every controller imports "pool"
// from this file instead of opening its own connection.
//
// A "pool" keeps a handful of connections open and ready,
// and hands one out per query - this is faster and safer
// than opening a brand-new connection for every request.

require('dotenv').config();
const mysql = require('mysql2/promise'); // the "/promise" version lets us use async/await

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // max number of simultaneous connections in the pool
    queueLimit: 0        // 0 = unlimited queued requests waiting for a free connection
});

// Quick one-time check when the server starts, so connection
// problems show up immediately in the terminal instead of only
// failing later on the first API call.
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
        connection.release(); // give the connection back to the pool
    } catch (error) {
        console.error('❌ Failed to connect to MySQL:', error.message);
    }
}

module.exports = { pool, testConnection };
