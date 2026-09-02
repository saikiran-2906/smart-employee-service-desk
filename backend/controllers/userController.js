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
