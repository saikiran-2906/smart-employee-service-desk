// CLI: create the database schema (no seed data).
// Usage: npm run db:init
const { initializeDatabase } = require('../db/initialize');
const config = require('../config');

(async () => {
  try {
    await initializeDatabase({ seed: false });
    console.log(`Database "${config.db.database}" schema created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  }
})();
