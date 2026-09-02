// controllers/dashboardController.js
const { pool } = require('../config/db');

// GET /api/dashboard
// Returns totals used by the dashboard cards and charts.
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

        // Average resolution time (in hours) for closed tickets
        const [[{ avgResolutionHours }]] = await pool.query(`
            SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, CreatedDate, ClosedDate)), 0) AS avgResolutionHours
            FROM Tickets WHERE Status = 'Closed' AND ClosedDate IS NOT NULL
        `);

        // Department breakdown with open/closed split
        const [byDepartmentDetailed] = await pool.query(`
            SELECT c.Name AS category,
                   SUM(CASE WHEN t.Status NOT IN ('Closed','Resolved') THEN 1 ELSE 0 END) AS openCount,
                   SUM(CASE WHEN t.Status IN ('Closed','Resolved') THEN 1 ELSE 0 END) AS closedCount,
                   COUNT(t.TicketId) AS totalCount
            FROM Categories c
            LEFT JOIN Tickets t ON c.CategoryId = t.CategoryId
            GROUP BY c.CategoryId, c.Name
            ORDER BY c.Name
        `);

        // Recent 5 tickets
        const [recentTickets] = await pool.query(`
            SELECT t.TicketId, t.Title, t.Priority, t.Status, t.CreatedDate, c.Name AS CategoryName
            FROM Tickets t JOIN Categories c ON t.CategoryId = c.CategoryId
            ORDER BY t.CreatedDate DESC LIMIT 5
        `);

        // Unassigned tickets count
        const [[{ unassignedCount }]] = await pool.query(
            "SELECT COUNT(*) AS unassignedCount FROM Tickets WHERE AssignedTo IS NULL AND Status NOT IN ('Closed','Resolved')"
        );

        res.status(200).json({
            totalTickets, byCategory, byPriority, byStatus,
            avgResolutionHours: Math.round(avgResolutionHours),
            byDepartmentDetailed, recentTickets, unassignedCount
        });
    } catch (err) {
        next(err);
    }
};
