const { query } = require('../config/db');

// Common SELECT that joins the human-readable names onto a ticket row.
const BASE_SELECT = `
  SELECT
    t.ticket_id            AS ticketId,
    t.title                AS title,
    t.description          AS description,
    t.category_id          AS categoryId,
    c.name                 AS categoryName,
    t.priority             AS priority,
    t.status               AS status,
    t.created_by           AS createdBy,
    creator.name           AS createdByName,
    t.assigned_to          AS assignedTo,
    assignee.name          AS assignedToName,
    t.created_date         AS createdDate,
    t.updated_date         AS updatedDate
  FROM tickets t
  JOIN categories c        ON t.category_id = c.category_id
  JOIN users creator       ON t.created_by  = creator.user_id
  LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
`;

const ticketRepository = {
  // Supports optional filters: status, priority, categoryId, assignedTo.
  findAll(filters = {}) {
    const clauses = [];
    const params = [];

    if (filters.status) {
      clauses.push('t.status = ?');
      params.push(filters.status);
    }
    if (filters.priority) {
      clauses.push('t.priority = ?');
      params.push(filters.priority);
    }
    if (filters.categoryId) {
      clauses.push('t.category_id = ?');
      params.push(filters.categoryId);
    }
    if (filters.assignedTo) {
      clauses.push('t.assigned_to = ?');
      params.push(filters.assignedTo);
    }
    if (filters.createdBy) {
      clauses.push('t.created_by = ?');
      params.push(filters.createdBy);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return query(`${BASE_SELECT} ${where} ORDER BY t.created_date DESC`, params);
  },

  async findById(id) {
    const rows = await query(`${BASE_SELECT} WHERE t.ticket_id = ?`, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const result = await query(
      `INSERT INTO tickets (title, description, category_id, priority, status, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.categoryId,
        data.priority,
        data.status || 'Open',
        data.createdBy,
        data.assignedTo || null,
      ]
    );
    return this.findById(result.insertId);
  },

  // Dynamic partial update. `fields` maps DB columns to values.
  async update(id, fields) {
    const columns = Object.keys(fields);
    if (columns.length === 0) {
      return this.findById(id);
    }
    const setClause = columns.map((col) => `${col} = ?`).join(', ');
    const params = [...columns.map((col) => fields[col]), id];
    await query(`UPDATE tickets SET ${setClause} WHERE ticket_id = ?`, params);
    return this.findById(id);
  },
};

module.exports = { ticketRepository, BASE_SELECT };
