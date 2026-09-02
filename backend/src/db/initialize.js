const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

// Reads a .sql file and rewrites the hard-coded `service_desk` database
// name to the configured one (so the test database works too).
function loadSql(fileName) {
  const filePath = path.join(__dirname, '..', '..', 'sql', fileName);
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.replace(/service_desk\b/g, config.db.database);
}

// Adds the department_id column/index on users if they don't already exist.
// MySQL doesn't support "ADD COLUMN/INDEX IF NOT EXISTS" here, so duplicate
// errors (already applied on a previous run) are caught and ignored instead.
async function ensureDepartmentColumn(connection) {
  try {
    await connection.query('ALTER TABLE users ADD COLUMN department_id INT NULL');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') throw err;
  }
  try {
    await connection.query('ALTER TABLE users ADD INDEX idx_users_department (department_id)');
  } catch (err) {
    if (err.code !== 'ER_DUP_KEYNAME') throw err;
  }
}

// Wipes all rows (but keeps the schema) so a re-run starts from a clean,
// deterministic slate — used for the test database, where accumulated
// tickets from previous runs would otherwise skew auto-assignment counts.
async function resetTables(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE comments');
  await connection.query('TRUNCATE TABLE tickets');
  await connection.query('TRUNCATE TABLE users');
  await connection.query('TRUNCATE TABLE categories');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
}

// Creates the database + tables and (optionally) seeds sample data.
// A one-off connection with multipleStatements enabled is used so the
// whole .sql file can be executed in a single call.
async function initializeDatabase({ seed = true, reset = false } = {}) {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    await connection.query(loadSql('schema.sql'));
    await connection.query(`USE \`${config.db.database}\``);
    await ensureDepartmentColumn(connection);
    if (reset) {
      await resetTables(connection);
    }
    if (seed) {
      await connection.query(loadSql('seed.sql'));
    }
  } finally {
    await connection.end();
  }
}

module.exports = { initializeDatabase, loadSql };
