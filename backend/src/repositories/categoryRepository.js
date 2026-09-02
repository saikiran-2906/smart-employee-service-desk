const { query } = require('../config/db');

const categoryRepository = {
  findAll() {
    return query('SELECT category_id, name FROM categories ORDER BY name');
  },

  async findById(id) {
    const rows = await query(
      'SELECT category_id, name FROM categories WHERE category_id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(name) {
    const result = await query('INSERT INTO categories (name) VALUES (?)', [name]);
    return this.findById(result.insertId);
  },
};

module.exports = categoryRepository;
