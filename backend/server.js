// server.js
//
// Entry point for the backend. Starts Express, applies global
// middleware, checks the database connection, and (in later
// phases) mounts all the /api routes.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Global middleware ---
app.use(cors());          // allows the React frontend (different port) to call this API
app.use(express.json());  // parses incoming JSON request bodies into req.body

// --- Health check route ---
// Simple route to confirm the server is running, e.g. for a quick
// browser check at http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// --- Feature routes ---
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// --- 404 handler for unknown routes ---
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// --- Centralized error handler (must be LAST) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await testConnection(); // confirms MySQL connection right away
});
