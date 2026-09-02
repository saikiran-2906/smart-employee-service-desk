const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

const userService = {
  list(role) {
    return userRepository.findAll(role);
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with id ${id} not found.`);
    }
    return user;
  },

  create(data) {
    return userRepository.create(data);
  },
};

module.exports = userService;
