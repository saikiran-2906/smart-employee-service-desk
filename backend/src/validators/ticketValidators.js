const { body, param, query } = require('express-validator');
const { PRIORITIES, STATUSES } = require('../utils/constants');

const idParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Ticket id must be a positive integer.');

const ticketValidators = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required.')
      .isLength({ max: 200 }).withMessage('Title must be at most 200 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('categoryId').notEmpty().withMessage('Category is required.')
      .bail().isInt({ min: 1 }).withMessage('categoryId must be a positive integer.'),
    body('priority').notEmpty().withMessage('Priority is required.')
      .bail().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}.`),
    // createdBy is derived server-side from the signed-in user (X-User-Id);
    // it is no longer accepted as client input, so it is not required here.
    body('assignedTo').optional({ nullable: true })
      .isInt({ min: 1 }).withMessage('assignedTo must be a positive integer.'),
  ],

  update: [
    idParam,
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty.'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId must be a positive integer.'),
    body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}.`),
    body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}.`),
    body('assignedTo').optional({ nullable: true })
      .custom((v) => v === null || Number.isInteger(Number(v)))
      .withMessage('assignedTo must be a positive integer or null.'),
    body('resolutionNote').optional().trim().isLength({ min: 1 }).withMessage('resolutionNote cannot be empty.'),
  ],

  assign: [
    idParam,
    body('assignedTo').notEmpty().withMessage('assignedTo is required.')
      .bail().isInt({ min: 1 }).withMessage('assignedTo must be a positive integer.'),
  ],

  close: [
    idParam,
    body('resolutionNote').optional().trim().isLength({ min: 1 }).withMessage('resolutionNote cannot be empty.'),
  ],

  idOnly: [idParam],

  list: [
    query('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}.`),
    query('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}.`),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId must be a positive integer.'),
    query('assignedTo').optional().isInt({ min: 1 }).withMessage('assignedTo must be a positive integer.'),
    query('createdBy').optional().isInt({ min: 1 }).withMessage('createdBy must be a positive integer.'),
  ],

  addComment: [
    idParam,
    body('notes').trim().notEmpty().withMessage('notes is required.'),
    body('authorId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('authorId must be a positive integer.'),
  ],
};

module.exports = ticketValidators;
