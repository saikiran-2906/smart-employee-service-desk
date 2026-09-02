const { query } = require('../config/db');

// Builds a WHERE clause scoping stats to one user's tickets.
// scope = { column: 'assigned_to' | 'created_by', value: userId } or null (no scope = everyone, admin view).
function scopedWhere(scope) {
  if (!scope) return { clause: '', params: [] };
  return { clause: `WHERE t.${scope.column} = ?`, params: [scope.value] };
}

const dashboardRepository = {
  async getTotals(scope) {
    const { clause, params } = scopedWhere(scope);
    const rows = await query(`SELECT COUNT(*) AS total FROM tickets t ${clause}`, params);
    return rows[0].total;
  },

  countByStatus(scope) {
    const { clause, params } = scopedWhere(scope);
    return query(
      `SELECT status AS label, COUNT(*) AS count
       FROM tickets t
       ${clause}
       GROUP BY status`,
      params
    );
  },

  countByPriority(scope) {
    const { clause, params } = scopedWhere(scope);
    return query(
      `SELECT priority AS label, COUNT(*) AS count
       FROM tickets t
       ${clause}
       GROUP BY priority`,
      params
    );
  },

  countByCategory(scope) {
    // Scope condition lives in the JOIN so categories with zero matching
    // tickets still appear (with a count of 0) instead of being dropped.
    const extra = scope ? `AND t.${scope.column} = ?` : '';
    const params = scope ? [scope.value] : [];
    return query(
      `SELECT c.name AS label, COUNT(t.ticket_id) AS count
       FROM categories c
       LEFT JOIN tickets t ON t.category_id = c.category_id ${extra}
       GROUP BY c.category_id, c.name
       ORDER BY c.name`,
      params
    );
  },
};

module.exports = dashboardRepository;
