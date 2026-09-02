const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');

const categoryController = {
  list: asyncHandler(async (req, res) => {
    const categories = await categoryService.list();
    res.json({ success: true, count: categories.length, data: categories });
  }),

  create: asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body.name);
    res.status(201).json({ success: true, data: category });
  }),
};

module.exports = categoryController;
