const app = require('./app');
const config = require('./config');
const { getPool, closePool } = require('./config/db');
const { initializeDatabase } = require('./db/initialize');

async function start() {
  try {
    // Ensure the database + tables exist and seed data is present on boot.
    // This makes the project "just run" after configuring credentials.
    await initializeDatabase({ seed: true });

    // Verify connectivity before accepting traffic.
    await getPool().query('SELECT 1');

    const server = app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${config.port}/api (env: ${config.env})`);
    });

    const shutdown = async (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
