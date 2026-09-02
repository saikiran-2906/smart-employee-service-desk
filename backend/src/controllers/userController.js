const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
  list: asyncHandler(async (req, res) => {
    const users = await userService.list(req.query.role);
    res.json({ success: true, count: users.length, data: users });
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userService.getById(Number(req.params.id));
    res.json({ success: true, data: user });
  }),

  create: asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json({ success: true, data: user });
  }),
};

module.exports = userController;
