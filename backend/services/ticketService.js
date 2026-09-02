// services/ticketService.js
//
// All direct database queries for tickets live here. Controllers
// call these functions instead of writing SQL themselves - this
// keeps controllers focused on request/response handling.

const { pool } = require('../config/db');

// Create a new ticket. New tickets always start as "Open"
// and unassigned, per the department workflow.
async function createTicket({ title, description, categoryId, priority, createdBy }) {
    const [result] = await pool.query(
        `INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy)
         VALUES (?, ?, ?, ?, 'Open', ?)`,
        [title, description, categoryId, priority, createdBy]
    );
    return getTicketById(result.insertId);
}

// List tickets with optional filters, including the category
// name and the names of the creator/assignee (so the frontend
// doesn't have to make extra lookups for each row).
async function getAllTickets(filters) {
    let query = `
        SELECT t.TicketId, t.Title, t.Priority, t.Status, t.CreatedDate, t.UpdatedDate,
               c.CategoryId, c.Name AS CategoryName,
               creator.Name AS CreatedByName,
               assignee.Name AS AssignedToName
        FROM Tickets t
        JOIN Categories c ON t.CategoryId = c.CategoryId
        JOIN Users creator ON t.CreatedBy = creator.UserId
        LEFT JOIN Users assignee ON t.AssignedTo = assignee.UserId
        WHERE 1 = 1
    `;
    const params = [];

    if (filters.status) {
        query += ' AND t.Status = ?';
        params.push(filters.status);
    }
    if (filters.priority) {
        query += ' AND t.Priority = ?';
        params.push(filters.priority);
    }
    if (filters.categoryId) {
        query += ' AND t.CategoryId = ?';
        params.push(filters.categoryId);
    }

    query += ' ORDER BY t.CreatedDate DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

// Full details for one ticket, plus its comment thread.
async function getTicketById(id) {
    const [ticketRows] = await pool.query(
        `SELECT t.*, c.Name AS CategoryName,
                creator.Name AS CreatedByName, creator.Email AS CreatedByEmail,
                assignee.Name AS AssignedToName
         FROM Tickets t
         JOIN Categories c ON t.CategoryId = c.CategoryId
         JOIN Users creator ON t.CreatedBy = creator.UserId
         LEFT JOIN Users assignee ON t.AssignedTo = assignee.UserId
         WHERE t.TicketId = ?`,
        [id]
    );

    if (ticketRows.length === 0) return null;

    const [comments] = await pool.query(
        `SELECT cm.CommentId, cm.Notes, cm.CreatedDate, u.Name AS UserName
         FROM Comments cm
         JOIN Users u ON cm.UserId = u.UserId
         WHERE cm.TicketId = ?
         ORDER BY cm.CreatedDate ASC`,
        [id]
    );

    return { ...ticketRows[0], Comments: comments };
}

// Partial update - only touches the fields that were actually sent.
async function updateTicket(id, { priority, status, assignedTo }) {
    const fields = [];
    const params = [];

    if (priority) {
        fields.push('Priority = ?');
        params.push(priority);
    }
    if (status) {
        fields.push('Status = ?');
        params.push(status);
    }
    if (assignedTo !== undefined) {
        fields.push('AssignedTo = ?');
        params.push(assignedTo);
    }

    if (fields.length === 0) {
        return getTicketById(id); // nothing to update
    }

    params.push(id);
    await pool.query(`UPDATE Tickets SET ${fields.join(', ')} WHERE TicketId = ?`, params);
    return getTicketById(id);
}

// Close a ticket: sets Status = Closed and stamps ClosedDate.
async function closeTicket(id) {
    await pool.query(
        `UPDATE Tickets SET Status = 'Closed', ClosedDate = NOW() WHERE TicketId = ?`,
        [id]
    );
    return getTicketById(id);
}

module.exports = { createTicket, getAllTickets, getTicketById, updateTicket, closeTicket };
