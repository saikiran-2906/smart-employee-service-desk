const { query } = require('../config/db');

const commentRepository = {
  findByTicketId(ticketId) {
    return query(
      `SELECT
         cm.comment_id   AS commentId,
         cm.ticket_id    AS ticketId,
         cm.author_id    AS authorId,
         u.name          AS authorName,
         cm.notes        AS notes,
         cm.created_date AS createdDate
       FROM comments cm
       LEFT JOIN users u ON cm.author_id = u.user_id
       WHERE cm.ticket_id = ?
       ORDER BY cm.created_date ASC`,
      [ticketId]
    );
  },

  async create({ ticketId, authorId, notes }) {
    const result = await query(
      'INSERT INTO comments (ticket_id, author_id, notes) VALUES (?, ?, ?)',
      [ticketId, authorId || null, notes]
    );
    const rows = await query(
      `SELECT
         cm.comment_id   AS commentId,
         cm.ticket_id    AS ticketId,
         cm.author_id    AS authorId,
         u.name          AS authorName,
         cm.notes        AS notes,
         cm.created_date AS createdDate
       FROM comments cm
       LEFT JOIN users u ON cm.author_id = u.user_id
       WHERE cm.comment_id = ?`,
      [result.insertId]
    );
    return rows[0];
  },
};

module.exports = commentRepository;
