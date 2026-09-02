const { query } = require('../config/db');

// Joins the department name for display, since Admin/Support are department-
// scoped (Employees have a NULL department_id and department_name).
const BASE_SELECT = `
  SELECT
    u.user_id       AS user_id,
    u.name          AS name,
    u.email         AS email,
    u.role          AS role,
    u.department_id AS department_id,
    c.name          AS department_name
  FROM users u
  LEFT JOIN categories c ON u.department_id = c.category_id
`;

const userRepository = {
  findAll(role) {
    if (role) {
      return query(`${BASE_SELECT} WHERE u.role = ? ORDER BY u.name`, [role]);
    }
    return query(`${BASE_SELECT} ORDER BY u.name`);
  },

  async findById(id) {
    const rows = await query(`${BASE_SELECT} WHERE u.user_id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ name, email, role, departmentId }) {
    const result = await query(
      'INSERT INTO users (name, email, role, department_id) VALUES (?, ?, ?, ?)',
      [name, email, role, departmentId || null]
    );
    return this.findById(result.insertId);
  },

  // Picks the Support agent, within the given department, currently carrying
  // the fewest open/in-progress tickets (load balancing for auto-assignment).
  async findLeastBusySupportUser(departmentId) {
    const rows = await query(
      `SELECT u.user_id, u.name, COUNT(t.ticket_id) AS openCount
       FROM users u
       LEFT JOIN tickets t
         ON t.assigned_to = u.user_id AND t.status IN ('Open', 'In Progress')
       WHERE u.role = 'Support' AND u.department_id = ?
       GROUP BY u.user_id, u.name
       ORDER BY openCount ASC, u.user_id ASC
       LIMIT 1`,
      [departmentId]
    );
    return rows[0] || null;
  },
};

module.exports = userRepository;
