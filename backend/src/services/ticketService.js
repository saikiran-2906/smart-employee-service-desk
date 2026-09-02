const { ticketRepository } = require('../repositories/ticketRepository');
const categoryRepository = require('../repositories/categoryRepository');
const userRepository = require('../repositories/userRepository');
const commentRepository = require('../repositories/commentRepository');
const ApiError = require('../utils/ApiError');

// Ensures a referenced category exists, throwing a clean 400 otherwise.
async function assertCategoryExists(categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw ApiError.badRequest(`Category with id ${categoryId} does not exist.`);
  }
}

// Resolves and validates a Support assignee for a ticket in `categoryId`:
// the user must exist, be a Support agent, and belong to that department.
async function assertValidAssignee(userId, categoryId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.badRequest(`Assignee (assignedTo) with id ${userId} does not exist.`);
  }
  if (user.role !== 'Support' || user.department_id !== categoryId) {
    throw ApiError.badRequest('The assignee must be a support agent in this ticket\'s department.');
  }
  return user;
}

// Admins are scoped to their own department; throws 403 if a ticket belongs
// to a different department than the one they administer.
function assertAdminOwnsDepartment(ticket, currentUser) {
  if (ticket.categoryId !== currentUser.department_id) {
    throw ApiError.forbidden('This ticket belongs to a different department.');
  }
}

// Throws 403 unless the caller is the Admin of the ticket's department, or a
// Support user who owns (is assigned to) the ticket, or an Employee who
// created the ticket.
function assertCanView(ticket, currentUser) {
  if (currentUser.role === 'Admin') return assertAdminOwnsDepartment(ticket, currentUser);
  if (currentUser.role === 'Support' && ticket.assignedTo === currentUser.user_id) return;
  if (currentUser.role === 'Employee' && ticket.createdBy === currentUser.user_id) return;
  throw ApiError.forbidden('You do not have access to this ticket.');
}

// Throws 403 unless the caller is the Admin of the ticket's department, or
// the Support user this ticket is assigned to. Used for status/priority/
// notes/close actions.
function assertCanManage(ticket, currentUser) {
  if (currentUser.role === 'Admin') return assertAdminOwnsDepartment(ticket, currentUser);
  if (currentUser.role === 'Support' && ticket.assignedTo === currentUser.user_id) return;
  throw ApiError.forbidden('Only that department\'s admin or the assigned support agent can manage this ticket.');
}

const ticketService = {
  // Support users only ever see tickets assigned to them; employees only
  // see tickets they raised; department admins only see tickets in their
  // own department (their categoryId filter is enforced, not user-supplied).
  list(filters, currentUser) {
    const scoped = { ...filters };
    if (currentUser.role === 'Support') {
      scoped.assignedTo = currentUser.user_id;
      delete scoped.createdBy;
    } else if (currentUser.role === 'Employee') {
      scoped.createdBy = currentUser.user_id;
      delete scoped.assignedTo;
    } else if (currentUser.role === 'Admin') {
      scoped.categoryId = currentUser.department_id;
    }
    return ticketRepository.findAll(scoped);
  },

  async getById(id, currentUser) {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) {
      throw ApiError.notFound(`Ticket with id ${id} not found.`);
    }
    assertCanView(ticket, currentUser);
    ticket.comments = await commentRepository.findByTicketId(id);
    return ticket;
  },

  async create(data, currentUser) {
    await assertCategoryExists(data.categoryId);

    // The creator is always the signed-in user; a client-supplied createdBy
    // cannot be used to raise a ticket on someone else's behalf.
    const createdBy = currentUser.user_id;

    let assignedTo = null;
    let status = 'Open';

    // The department admin may pre-assign a ticket, to a support agent in
    // their own department, at creation time.
    if (data.assignedTo && currentUser.role === 'Admin' && currentUser.department_id === data.categoryId) {
      await assertValidAssignee(data.assignedTo, data.categoryId);
      assignedTo = data.assignedTo;
      status = 'In Progress';
    } else {
      // Otherwise, auto-assign to the support agent in the ticket's own
      // department with the fewest open/in-progress tickets (load balancing).
      const leastBusy = await userRepository.findLeastBusySupportUser(data.categoryId);
      if (leastBusy) {
        assignedTo = leastBusy.user_id;
        status = 'In Progress';
      }
    }

    return ticketRepository.create({ ...data, createdBy, assignedTo, status });
  },

  // Partial update: title, description, category, priority, status, notes.
  // Reassignment is intentionally NOT accepted here — use assign().
  async update(id, data, currentUser) {
    const existing = await ticketRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Ticket with id ${id} not found.`);
    }
    assertCanManage(existing, currentUser);

    const fields = {};
    if (data.title !== undefined) fields.title = data.title;
    if (data.description !== undefined) fields.description = data.description;

    if (data.categoryId !== undefined) {
      await assertCategoryExists(data.categoryId);
      fields.category_id = data.categoryId;
    }
    if (data.priority !== undefined) fields.priority = data.priority;
    if (data.status !== undefined) fields.status = data.status;

    const updated = await ticketRepository.update(id, fields);

    // A resolution note supplied with the update is stored as a comment.
    if (data.resolutionNote) {
      await commentRepository.create({
        ticketId: id,
        authorId: currentUser.user_id,
        notes: data.resolutionNote,
      });
    }

    updated.comments = await commentRepository.findByTicketId(id);
    return updated;
  },

  // Assign (or reassign) a ticket to a support user in the same department;
  // moves Open -> In Progress. Only that department's admin may do this.
  async assign(id, assignedTo, currentUser) {
    if (currentUser.role !== 'Admin') {
      throw ApiError.forbidden('Only a department admin can assign tickets.');
    }
    const existing = await ticketRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Ticket with id ${id} not found.`);
    }
    assertAdminOwnsDepartment(existing, currentUser);
    await assertValidAssignee(assignedTo, existing.categoryId);

    const fields = { assigned_to: assignedTo };
    if (existing.status === 'Open') {
      fields.status = 'In Progress';
    }
    return ticketRepository.update(id, fields);
  },

  // Close a ticket, optionally attaching a final resolution note.
  async close(id, resolutionNote, currentUser) {
    const existing = await ticketRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Ticket with id ${id} not found.`);
    }
    assertCanManage(existing, currentUser);
    if (existing.status === 'Closed') {
      throw ApiError.conflict('Ticket is already closed.');
    }

    const updated = await ticketRepository.update(id, { status: 'Closed' });
    if (resolutionNote) {
      await commentRepository.create({
        ticketId: id,
        authorId: currentUser.user_id,
        notes: resolutionNote,
      });
    }
    updated.comments = await commentRepository.findByTicketId(id);
    return updated;
  },
};

module.exports = ticketService;
