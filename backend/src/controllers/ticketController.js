const ticketService = require('../services/ticketService');
const commentService = require('../services/commentService');
const asyncHandler = require('../utils/asyncHandler');

const ticketController = {
  list: asyncHandler(async (req, res) => {
    const { status, priority, categoryId, assignedTo, createdBy } = req.query;
    const tickets = await ticketService.list(
      { status, priority, categoryId, assignedTo, createdBy },
      req.currentUser
    );
    res.json({ success: true, count: tickets.length, data: tickets });
  }),

  getById: asyncHandler(async (req, res) => {
    const ticket = await ticketService.getById(Number(req.params.id), req.currentUser);
    res.json({ success: true, data: ticket });
  }),

  create: asyncHandler(async (req, res) => {
    const ticket = await ticketService.create(req.body, req.currentUser);
    res.status(201).json({ success: true, data: ticket });
  }),

  update: asyncHandler(async (req, res) => {
    const ticket = await ticketService.update(Number(req.params.id), req.body, req.currentUser);
    res.json({ success: true, data: ticket });
  }),

  assign: asyncHandler(async (req, res) => {
    const ticket = await ticketService.assign(Number(req.params.id), req.body.assignedTo, req.currentUser);
    res.json({ success: true, data: ticket });
  }),

  close: asyncHandler(async (req, res) => {
    const ticket = await ticketService.close(Number(req.params.id), req.body.resolutionNote, req.currentUser);
    res.json({ success: true, data: ticket });
  }),

  listComments: asyncHandler(async (req, res) => {
    const comments = await commentService.listForTicket(Number(req.params.id), req.currentUser);
    res.json({ success: true, count: comments.length, data: comments });
  }),

  addComment: asyncHandler(async (req, res) => {
    const comment = await commentService.addToTicket(Number(req.params.id), req.body, req.currentUser);
    res.status(201).json({ success: true, data: comment });
  }),
};

module.exports = ticketController;
