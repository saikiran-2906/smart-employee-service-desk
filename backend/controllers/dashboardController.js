// controllers/dashboardController.js
const { pool } = require('../config/db');

// GET /api/dashboard
// Returns totals used by the dashboard cards and simple charts.
exports.getDashboard = async (req, res, next) => {
    try {
        const [[{ totalTickets }]] = await pool.query('SELECT COUNT(*) AS totalTickets FROM Tickets');

        const [byCategory] = await pool.query(`
            SELECT c.Name AS category, COUNT(t.TicketId) AS count
            FROM Categories c
            LEFT JOIN Tickets t ON c.CategoryId = t.CategoryId
            GROUP BY c.CategoryId, c.Name
            ORDER BY c.Name
        `);

        const [byPriority] = await pool.query(`
            SELECT Priority AS priority, COUNT(*) AS count
            FROM Tickets
            GROUP BY Priority
        `);

        const [byStatus] = await pool.query(`
            SELECT Status AS status, COUNT(*) AS count
            FROM Tickets
            GROUP BY Status
        `);

        res.status(200).json({ totalTickets, byCategory, byPriority, byStatus });
    } catch (err) {
        next(err);
    }
};
