const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary(req.currentUser);
    res.json({ success: true, data: summary });
  }),
};

module.exports = dashboardController;
