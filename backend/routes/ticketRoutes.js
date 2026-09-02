// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();

const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.put('/:id/close', ticketController.closeTicket);
router.post('/:id/comments', commentController.addComment);

module.exports = router;
