-- =============================================================
-- Seed data for the Service Desk portal
-- Uses INSERT IGNORE so re-running does not create duplicates.
-- =============================================================

USE service_desk;

-- ---------- Categories / Departments ----------
INSERT IGNORE INTO categories (category_id, name) VALUES
  (1, 'IT'),
  (2, 'HR'),
  (3, 'Facilities'),
  (4, 'Finance'),
  (5, 'Access Management');

-- ---------- Users ----------
-- Employees are department-agnostic and can raise tickets for any department.
-- Each department has exactly one Admin and two Support agents (design
-- decision: auto-assignment and admin oversight are scoped per department).
-- Uses ON DUPLICATE KEY UPDATE (rather than INSERT IGNORE) so re-running this
-- script also backfills department_id on users seeded before it existed.
INSERT INTO users (user_id, name, email, role, department_id) VALUES
  -- Employees (no department)
  (1, 'Aarav Sharma',   'aarav.sharma@company.com',   'Employee', NULL),
  (2, 'Priya Nair',     'priya.nair@company.com',     'Employee', NULL),
  (3, 'Rahul Verma',    'rahul.verma@company.com',    'Employee', NULL),

  -- IT department (category_id 1)
  (4,  'Sara Thomas',      'sara.thomas@company.com',      'Support', 1),
  (12, 'Karan Malhotra',   'karan.malhotra@company.com',   'Support', 1),
  (7,  'Meera Rao',        'meera.rao@company.com',        'Admin',   1),

  -- HR department (category_id 2)
  (13, 'Anjali Bose',      'anjali.bose@company.com',      'Support', 2),
  (14, 'Ritu Chawla',      'ritu.chawla@company.com',      'Support', 2),
  (8,  'Kavita Singh',     'kavita.singh@company.com',     'Admin',   2),

  -- Facilities department (category_id 3)
  (15, 'Farah Khan',       'farah.khan@company.com',       'Support', 3),
  (16, 'Suresh Pillai',    'suresh.pillai@company.com',    'Support', 3),
  (9,  'Arjun Mehta',      'arjun.mehta@company.com',      'Admin',   3),

  -- Finance department (category_id 4)
  (6,  'Neha Gupta',       'neha.gupta@company.com',       'Support', 4),
  (17, 'Tanya Joshi',      'tanya.joshi@company.com',      'Support', 4),
  (10, 'Divya Kapoor',     'divya.kapoor@company.com',     'Admin',   4),

  -- Access Management department (category_id 5)
  (5,  'Vikram Iyer',      'vikram.iyer@company.com',      'Support', 5),
  (18, 'Imran Sheikh',     'imran.sheikh@company.com',     'Support', 5),
  (11, 'Rohan Das',        'rohan.das@company.com',        'Admin',   5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  department_id = VALUES(department_id);

-- ---------- Tickets (based on assignment sample scenarios) ----------
INSERT IGNORE INTO tickets
  (ticket_id, title, description, category_id, priority, status, created_by, assigned_to) VALUES
  (1, 'Unable to access VPN while working remotely',
      'I cannot connect to the corporate VPN from home. It keeps timing out during authentication.',
      1, 'High', 'Open', 1, NULL),
  (2, 'Laptop not booting before a customer presentation',
      'My work laptop shows a black screen on startup. I have a customer demo in two hours.',
      1, 'High', 'In Progress', 2, 4),
  (3, 'Leave policy clarification',
      'Requesting clarification on carry-forward rules for unused annual leave.',
      2, 'Low', 'Open', 3, NULL),
  (4, 'Access request for a new application',
      'Please grant me access to the internal analytics dashboard for the finance reports.',
      5, 'Medium', 'In Progress', 1, 5),
  (5, 'Air conditioning issue in office workspace',
      'The AC on the 3rd floor east wing is not cooling and the area is very warm.',
      3, 'Medium', 'Open', 2, NULL),
  (6, 'Reimbursement approval pending for over 30 days',
      'My travel reimbursement submitted last month is still not approved. Please expedite.',
      4, 'High', 'Resolved', 3, 6);

-- ---------- Comments / resolution notes ----------
INSERT IGNORE INTO comments (comment_id, ticket_id, author_id, notes) VALUES
  (1, 2, 4, 'Confirmed hardware failure on the display cable. Replacement scheduled.'),
  (2, 4, 5, 'Access request forwarded to the application owner for approval.'),
  (3, 6, 6, 'Reimbursement approved and processed. Amount will reflect in next payroll.');
