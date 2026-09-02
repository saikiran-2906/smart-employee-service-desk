// controllers/commentController.js
const { pool } = require('../config/db');
const ticketService = require('../services/ticketService');

// POST /api/tickets/:id/comments
exports.addComment = async (req, res, next) => {
    try {
        const { id: ticketId } = req.params;
        const { userId, notes } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        if (!notes || !notes.trim()) {
            return res.status(400).json({ message: 'notes is required' });
        }

        const ticket = await ticketService.getTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await pool.query(
            'INSERT INTO Comments (TicketId, UserId, Notes) VALUES (?, ?, ?)',
            [ticketId, userId, notes]
        );

        // Return the full ticket (with the new comment included)
        // so the frontend can just re-render from one response.
        const updatedTicket = await ticketService.getTicketById(ticketId);
        res.status(201).json(updatedTicket);
    } catch (err) {
        next(err);
    }
};
