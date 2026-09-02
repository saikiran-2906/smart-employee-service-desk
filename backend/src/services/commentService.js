const commentRepository = require('../repositories/commentRepository');
const { ticketRepository } = require('../repositories/ticketRepository');
const ApiError = require('../utils/ApiError');

// Mirrors ticketService's view/manage rules: a ticket's department admin
// and its assigned support agent may act on it; employees only for tickets
// they raised.
function assertCanView(ticket, currentUser) {
  if (currentUser.role === 'Admin' && ticket.categoryId === currentUser.department_id) return;
  if (currentUser.role === 'Support' && ticket.assignedTo === currentUser.user_id) return;
  if (currentUser.role === 'Employee' && ticket.createdBy === currentUser.user_id) return;
  throw ApiError.forbidden('You do not have access to this ticket.');
}

function assertCanManage(ticket, currentUser) {
  if (currentUser.role === 'Admin' && ticket.categoryId === currentUser.department_id) return;
  if (currentUser.role === 'Support' && ticket.assignedTo === currentUser.user_id) return;
  throw ApiError.forbidden('Only that department\'s admin or the assigned support agent can add notes to this ticket.');
}

const commentService = {
  async listForTicket(ticketId, currentUser) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw ApiError.notFound(`Ticket with id ${ticketId} not found.`);
    }
    assertCanView(ticket, currentUser);
    return commentRepository.findByTicketId(ticketId);
  },

  async addToTicket(ticketId, { notes }, currentUser) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw ApiError.notFound(`Ticket with id ${ticketId} not found.`);
    }
    assertCanManage(ticket, currentUser);
    // The author is always the signed-in user, not a client-supplied value.
    return commentRepository.create({ ticketId, authorId: currentUser.user_id, notes });
  },
};

module.exports = commentService;
