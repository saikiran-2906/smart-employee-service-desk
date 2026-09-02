// controllers/ticketController.js
//
// Handles HTTP request/response for tickets. Validation lives
// here (close to the request); actual SQL lives in ticketService.

const ticketService = require('../services/ticketService');
const { pool } = require('../config/db');

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const TITLE_MAX_LENGTH = 200;

// POST /api/tickets
exports.createTicket = async (req, res, next) => {
    try {
        const { title, description, categoryId, priority, createdBy } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (title.length > TITLE_MAX_LENGTH) {
            return res.status(400).json({ message: `Title must be ${TITLE_MAX_LENGTH} characters or fewer` });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Description is required' });
        }
        if (!categoryId) {
            return res.status(400).json({ message: 'Category is required' });
        }
        if (!priority || !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ message: 'Priority must be High, Medium, or Low' });
        }
        if (!createdBy) {
            return res.status(400).json({ message: 'CreatedBy is required' });
        }

        const ticket = await ticketService.createTicket({ title, description, categoryId, priority, createdBy });
        res.status(201).json(ticket);
    } catch (err) {
        next(err);
    }
};

// GET /api/tickets?status=&priority=&categoryId=&assignedTo=
exports.getAllTickets = async (req, res, next) => {
    try {
        const { status, priority, categoryId, assignedTo } = req.query;
        const tickets = await ticketService.getAllTickets({ status, priority, categoryId, assignedTo });
        res.status(200).json(tickets);
    } catch (err) {
        next(err);
    }
};

// GET /api/tickets/:id
exports.getTicketById = async (req, res, next) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.status(200).json(ticket);
    } catch (err) {
        next(err);
    }
};

// PUT /api/tickets/:id  (priority, status, assignedTo)
exports.updateTicket = async (req, res, next) => {
    try {
        const existing = await ticketService.getTicketById(req.params.id);

        if (!existing) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (existing.Status === 'Closed') {
            return res.status(400).json({ message: 'Cannot modify a closed ticket' });
        }

        const { priority, status, assignedTo } = req.body;

        // Verify assigned person is a Support user
        if (assignedTo) {
            const [userRows] = await pool.query(
                'SELECT * FROM Users WHERE UserId = ? AND Role = ?',
                [assignedTo, 'Support']
            );

            if (userRows.length === 0) {
                return res.status(400).json({
                    message: 'Tickets can only be assigned to support staff'
                });
            }
        }

        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                message: 'Priority must be High, Medium, or Low'
            });
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status value'
            });
        }

        const updated = await ticketService.updateTicket(
            req.params.id,
            { priority, status, assignedTo }
        );

        res.status(200).json(updated);

    } catch (err) {
        next(err);
    }
};

// PUT /api/tickets/:id/close
exports.closeTicket = async (req, res, next) => {
    try {
        const existing = await ticketService.getTicketById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        if (existing.Status === 'Closed') {
            return res.status(400).json({ message: 'Ticket is already closed' });
        }

        const closed = await ticketService.closeTicket(req.params.id);
        res.status(200).json(closed);
    } catch (err) {
        next(err);
    }
};
