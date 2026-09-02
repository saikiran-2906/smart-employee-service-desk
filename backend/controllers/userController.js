// controllers/userController.js
const { pool } = require('../config/db');

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users ORDER BY UserId');
        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
};

// GET /api/users/support?categoryId=1
exports.getSupportUsers = async (req, res, next) => {
    try {
        const { categoryId } = req.query;
        let query = "SELECT * FROM Users WHERE Role = 'Support'";
        const params = [];
        if (categoryId) {
            query += ' AND CategoryId = ?';
            params.push(categoryId);
        }
        query += ' ORDER BY Name';
        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE UserId = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (err) {
        next(err);
    }
};
