const categoryRepository = require('../repositories/categoryRepository');
const ApiError = require('../utils/ApiError');

const categoryService = {
  list() {
    return categoryRepository.findAll();
  },

  async create(name) {
    const existing = (await categoryRepository.findAll()).find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      throw ApiError.conflict('A category with this name already exists.');
    }
    return categoryRepository.create(name);
  },
};

module.exports = categoryService;
