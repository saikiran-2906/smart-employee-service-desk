const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const requireCurrentUser = require('../middleware/currentUser');

const router = express.Router();

// Needs to know who's asking, so stats can be scoped to their role.
router.get('/', requireCurrentUser, dashboardController.summary);

module.exports = router;
