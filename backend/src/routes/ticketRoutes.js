const express = require('express');
const ticketController = require('../controllers/ticketController');
const validate = require('../middleware/validate');
const requireCurrentUser = require('../middleware/currentUser');
const ticketValidators = require('../validators/ticketValidators');

const router = express.Router();

// Every ticket route needs to know who's calling, to enforce role-based
// visibility (Support sees only assigned tickets, Employee only their own,
// Admin sees everything and is the only role allowed to assign tickets).
router.use(requireCurrentUser);

// Collection
router.get('/', validate(ticketValidators.list), ticketController.list);
router.post('/', validate(ticketValidators.create), ticketController.create);

// Single ticket
router.get('/:id', validate(ticketValidators.idOnly), ticketController.getById);
router.put('/:id', validate(ticketValidators.update), ticketController.update);

// Ticket workflow actions
router.put('/:id/assign', validate(ticketValidators.assign), ticketController.assign);
router.put('/:id/close', validate(ticketValidators.close), ticketController.close);

// Comments / resolution notes
router.get('/:id/comments', validate(ticketValidators.idOnly), ticketController.listComments);
router.post('/:id/comments', validate(ticketValidators.addComment), ticketController.addComment);

module.exports = router;
