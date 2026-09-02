const mysql = require('mysql2/promise');
const config = require('../config');

// A single shared connection pool for the whole app.
// The database name is intentionally omitted here so the pool can also
// be used to CREATE the database during initialization. It is selected
// per-query via fully-qualified names or by the init routine.
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      multipleStatements: false,
    });
  }
  return pool;
}

// Thin helper so callers don't repeat pool.query everywhere.
async function query(sql, params) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = { getPool, query, closePool };
