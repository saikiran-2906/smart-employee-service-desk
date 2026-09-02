require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  port: process.env.PORT || 5000,
  env,
  clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // Use a dedicated database when running the test suite.
    database: env === 'test'
      ? process.env.DB_NAME_TEST || 'service_desk_test'
      : process.env.DB_NAME || 'service_desk',
  },
};

module.exports = config;
