// controllers/categoryController.js
const { pool } = require('../config/db');

// GET /api/categories
exports.getAllCategories = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Categories ORDER BY Name');
        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
};
