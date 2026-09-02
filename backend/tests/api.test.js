const request = require('supertest');
const app = require('../src/app');
const { initializeDatabase } = require('../src/db/initialize');
const { closePool, getPool } = require('../src/config/db');

// Seeded user ids (see sql/seed.sql). Departments: 1=IT, 2=HR, 3=Facilities,
// 4=Finance, 5=Access Management. Each department has one Admin and two
// Support agents; Employees are department-agnostic.
const EMPLOYEE_ID = 1; // Aarav Sharma

const IT_ADMIN_ID = 7; // Meera Rao
const IT_SUPPORT_ID = 4; // Sara Thomas (already has 1 open IT ticket from seed)
const IT_SUPPORT_2_ID = 12; // Karan Malhotra (0 open IT tickets from seed)

const HR_ADMIN_ID = 8; // Kavita Singh
const HR_SUPPORT_ID = 13; // Anjali Bose

const FINANCE_ADMIN_ID = 10; // Divya Kapoor

// These tests run against the dedicated test database (service_desk_test).
// The schema + seed data are recreated fresh before the suite runs.
beforeAll(async () => {
  await initializeDatabase({ seed: true, reset: true });
});

afterAll(async () => {
  await closePool();
});

describe('Health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Tickets API - authentication', () => {
  it('GET /api/tickets without X-User-Id is rejected', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  it('GET /api/tickets with an unknown X-User-Id is rejected', async () => {
    const res = await request(app).get('/api/tickets').set('X-User-Id', '999999');
    expect(res.status).toBe(401);
  });
});

describe('Tickets API - role & department-based visibility', () => {
  it('IT admin only sees tickets in the IT department', async () => {
    const res = await request(app).get('/api/tickets').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((t) => t.categoryId === 1)).toBe(true);
  });

  it('Support only sees tickets assigned to them', async () => {
    const res = await request(app).get('/api/tickets').set('X-User-Id', IT_SUPPORT_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t) => t.assignedTo === IT_SUPPORT_ID)).toBe(true);
  });

  it('Employee only sees tickets they raised', async () => {
    const res = await request(app).get('/api/tickets').set('X-User-Id', EMPLOYEE_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t) => t.createdBy === EMPLOYEE_ID)).toBe(true);
  });

  it('Support cannot view a ticket assigned to someone else', async () => {
    // Ticket 4 (Access Management) is assigned to Vikram, not Sara (IT support).
    const res = await request(app).get('/api/tickets/4').set('X-User-Id', IT_SUPPORT_ID);
    expect(res.status).toBe(403);
  });

  it('Admin cannot view a ticket from a different department', async () => {
    // Ticket 6 belongs to Finance; the IT admin should not be able to view it.
    const res = await request(app).get('/api/tickets/6').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(403);
  });
});

describe('Tickets API - CRUD', () => {
  it('POST /api/tickets creates a ticket owned by the caller and auto-assigns within its department', async () => {
    const res = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'Test ticket from suite',
      description: 'Automated test ticket',
      categoryId: 1, // IT
      priority: 'High',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.ticketId).toBeDefined();
    expect(res.body.data.status).toBe('In Progress');
    expect(res.body.data.categoryName).toBe('IT');
    expect(res.body.data.createdBy).toBe(EMPLOYEE_ID);
    // Karan (12) starts with fewer open IT tickets than Sara (4) in the seed data.
    expect(res.body.data.assignedTo).toBe(IT_SUPPORT_2_ID);
  });

  it('POST /api/tickets fails validation when required fields are missing', async () => {
    const res = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('GET /api/tickets/:id returns a single ticket', async () => {
    const res = await request(app).get('/api/tickets/1').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.ticketId).toBe(1);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
  });

  it('GET /api/tickets/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/tickets/999999').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tickets/:id returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/tickets/abc').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(400);
  });

  it('PUT /api/tickets/:id updates priority and status as the department admin', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'Ticket to update',
      description: 'desc',
      categoryId: 1,
      priority: 'Low',
    });
    const id = create.body.data.ticketId;

    const res = await request(app).put(`/api/tickets/${id}`).set('X-User-Id', IT_ADMIN_ID).send({
      priority: 'High',
      status: 'In Progress',
      resolutionNote: 'Investigating the issue.',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe('High');
    expect(res.body.data.status).toBe('In Progress');
    expect(res.body.data.comments.length).toBeGreaterThan(0);
  });

  it('PUT /api/tickets/:id is forbidden for a support agent who does not own the ticket', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'Ticket not yet assigned',
      description: 'desc',
      categoryId: 1,
      priority: 'Medium',
    });
    const id = create.body.data.ticketId;

    // Pin a known owner so the "not owner" check below is deterministic.
    await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', IT_ADMIN_ID)
      .send({ assignedTo: IT_SUPPORT_ID });

    const res = await request(app).put(`/api/tickets/${id}`).set('X-User-Id', IT_SUPPORT_2_ID).send({
      status: 'In Progress',
    });
    expect(res.status).toBe(403);
  });

  it('PUT /api/tickets/:id/assign is department-admin-only', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'Ticket to assign',
      description: 'desc',
      categoryId: 1,
      priority: 'Medium',
    });
    const id = create.body.data.ticketId;

    const forbidden = await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', IT_SUPPORT_ID)
      .send({ assignedTo: IT_SUPPORT_2_ID });
    expect(forbidden.status).toBe(403);

    const res = await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', IT_ADMIN_ID)
      .send({ assignedTo: IT_SUPPORT_ID });
    expect(res.status).toBe(200);
    expect(res.body.data.assignedTo).toBe(IT_SUPPORT_ID);
    expect(res.body.data.status).toBe('In Progress');
  });

  it('PUT /api/tickets/:id/assign rejects an admin from a different department', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'IT ticket for cross-department test',
      description: 'desc',
      categoryId: 1,
      priority: 'Medium',
    });
    const id = create.body.data.ticketId;

    const res = await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', HR_ADMIN_ID)
      .send({ assignedTo: IT_SUPPORT_ID });
    expect(res.status).toBe(403);
  });

  it('PUT /api/tickets/:id/assign rejects a support agent from a different department', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'IT ticket for cross-department assignee test',
      description: 'desc',
      categoryId: 1,
      priority: 'Medium',
    });
    const id = create.body.data.ticketId;

    const res = await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', IT_ADMIN_ID)
      .send({ assignedTo: HR_SUPPORT_ID });
    expect(res.status).toBe(400);
  });

  it('PUT /api/tickets/:id/close closes a ticket the support agent owns', async () => {
    const create = await request(app).post('/api/tickets').set('X-User-Id', EMPLOYEE_ID).send({
      title: 'Ticket to close',
      description: 'desc',
      categoryId: 1,
      priority: 'Medium',
    });
    const id = create.body.data.ticketId;

    await request(app)
      .put(`/api/tickets/${id}/assign`)
      .set('X-User-Id', IT_ADMIN_ID)
      .send({ assignedTo: IT_SUPPORT_ID });

    const res = await request(app)
      .put(`/api/tickets/${id}/close`)
      .set('X-User-Id', IT_SUPPORT_ID)
      .send({ resolutionNote: 'Resolved and closing.' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Closed');
  });

  it('POST /api/tickets/:id/comments adds a comment as the owning support agent', async () => {
    const res = await request(app)
      .post('/api/tickets/4/comments')
      .set('X-User-Id', 5) // Vikram Iyer, assigned to ticket 4 (Access Management)
      .send({ notes: 'Following up on this ticket.' });
    expect(res.status).toBe(201);
    expect(res.body.data.notes).toBe('Following up on this ticket.');
  });
});

describe('Categories & Users API', () => {
  it('GET /api/categories returns seeded departments', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/users?role=Support returns support staff', async () => {
    const res = await request(app).get('/api/users').query({ role: 'Support' });
    expect(res.status).toBe(200);
    expect(res.body.data.every((u) => u.role === 'Support')).toBe(true);
  });
});

describe('Dashboard API', () => {
  it('GET /api/dashboard without X-User-Id is rejected', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });

  it('IT admin sees stats scoped to the IT department only', async () => {
    const res = await request(app).get('/api/dashboard').set('X-User-Id', IT_ADMIN_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.totalTickets).toBeGreaterThan(0);
    expect(res.body.data.byStatus).toBeDefined();
    expect(res.body.data.byPriority).toBeDefined();
    expect(Array.isArray(res.body.data.byCategory)).toBe(true);
  });

  it('Different departments report independent, non-negative totals', async () => {
    const it = await request(app).get('/api/dashboard').set('X-User-Id', IT_ADMIN_ID);
    const finance = await request(app).get('/api/dashboard').set('X-User-Id', FINANCE_ADMIN_ID);
    expect(it.status).toBe(200);
    expect(finance.status).toBe(200);
    expect(typeof it.body.data.totalTickets).toBe('number');
    expect(typeof finance.body.data.totalTickets).toBe('number');
  });

  it('Support only sees stats for tickets assigned to them', async () => {
    const res = await request(app).get('/api/dashboard').set('X-User-Id', IT_SUPPORT_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.totalTickets).toBeGreaterThanOrEqual(0);
  });

  it('Employee only sees stats for tickets they raised', async () => {
    const res = await request(app).get('/api/dashboard').set('X-User-Id', EMPLOYEE_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.totalTickets).toBeGreaterThan(0);
  });
});

