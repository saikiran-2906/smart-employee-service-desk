// CLI: create the schema AND load sample seed data.
// Usage: npm run db:seed
const { initializeDatabase } = require('../db/initialize');
const config = require('../config');

(async () => {
  try {
    await initializeDatabase({ seed: true });
    console.log(`Database "${config.db.database}" created and seeded successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err.message);
    process.exit(1);
  }
})();
