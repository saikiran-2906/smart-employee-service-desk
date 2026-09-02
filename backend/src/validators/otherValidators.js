const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const userValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().notEmpty().withMessage('Email is required.')
      .bail().isEmail().withMessage('A valid email is required.'),
    body('role').optional().isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}.`),
  ],
};

const categoryValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Category name is required.')
      .isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  ],
};

module.exports = { userValidators, categoryValidators };
