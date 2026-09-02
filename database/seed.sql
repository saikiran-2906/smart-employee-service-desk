-- ============================================================
-- Smart Employee Service Desk - Seed Data (MySQL)
-- Run AFTER schema.sql, against the same database.
-- ============================================================

-- --------------------------------------------
-- Categories (departments a ticket can belong to)
-- --------------------------------------------
INSERT INTO Categories (Name) VALUES
    ('IT'),                  -- CategoryId 1
    ('HR'),                  -- CategoryId 2
    ('Facilities'),          -- CategoryId 3
    ('Finance'),             -- CategoryId 4
    ('Access Management');   -- CategoryId 5

-- --------------------------------------------
-- Users (simulated login - see README for why real auth was skipped)
-- --------------------------------------------
INSERT INTO Users (Name, Email, Department) VALUES
    ('Kiran', 'kiran@company.com', 'Employee'),           -- UserId 1
    ('Rahul', 'rahul@company.com', 'IT Support'),         -- UserId 2
    ('Priya', 'priya@company.com', 'HR Support'),         -- UserId 3
    ('Arun', 'arun@company.com', 'Finance Support'),      -- UserId 4
    ('Sneha', 'sneha@company.com', 'Facilities Support'); -- UserId 5

-- --------------------------------------------
-- Tickets
-- CategoryId reference: 1=IT, 2=HR, 3=Facilities, 4=Finance, 5=Access Management
-- UserId reference:     1=Kiran(Employee), 2=Rahul(IT), 3=Priya(HR),
--                       4=Arun(Finance), 5=Sneha(Facilities)
-- --------------------------------------------

-- 1. VPN issue - IT - High - being worked on
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Unable to access VPN while working remotely',
        'VPN client fails to connect from home network. Getting a timeout error.',
        1, 'High', 'In Progress', 1, 2, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 2. Laptop not booting - IT - High - just came in, unassigned
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Laptop not booting before a customer presentation',
        'Laptop shows a black screen on power-on. Needed urgently for a client demo tomorrow.',
        1, 'High', 'Open', 1, NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 3. Leave policy clarification - HR - Low - resolved
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Leave policy clarification',
        'Need clarification on carry-forward rules for unused annual leave.',
        2, 'Low', 'Resolved', 1, 3, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 4. Access request for new application - Access Management - Medium - assigned
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Access request for a new application',
        'Requesting access to the internal reporting dashboard for the new project.',
        5, 'Medium', 'Assigned', 1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 5. Air conditioning issue - Facilities - Medium - closed
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate, ClosedDate)
VALUES ('Air conditioning issue',
        'AC unit on the 3rd floor is not cooling and making a rattling noise.',
        3, 'Medium', 'Closed', 1, 5, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- 6. Reimbursement pending - Finance - High - open
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Reimbursement pending for more than 30 days',
        'Travel reimbursement submitted over a month ago has not been processed.',
        4, 'High', 'Open', 1, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7. Password reset request - IT - Medium - resolved
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Password reset request',
        'Locked out of the company email account after too many failed login attempts.',
        1, 'Medium', 'Resolved', 1, 2, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 8. Employee ID card replacement - Access Management - Low - assigned
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Employee ID card replacement',
        'Lost ID card and need a replacement to access the office building.',
        5, 'Low', 'Assigned', 1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 9. Software installation request - IT - Low - in progress
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate)
VALUES ('Software installation request',
        'Need the latest version of the design software installed on my workstation.',
        1, 'Low', 'In Progress', 1, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- 10. Printer not working - Facilities - Medium - closed
INSERT INTO Tickets (Title, Description, CategoryId, Priority, Status, CreatedBy, AssignedTo, CreatedDate, UpdatedDate, ClosedDate)
VALUES ('Printer not working',
        'Office printer on the 2nd floor shows a paper jam error even when empty.',
        3, 'Medium', 'Closed', 1, 5, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- --------------------------------------------
-- Sample comments, to demonstrate the ticket-detail comment thread
-- --------------------------------------------
INSERT INTO Comments (TicketId, UserId, Notes, CreatedDate) VALUES
    (1, 2, 'Investigating - checked firewall rules, VPN gateway logs look fine so far.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (1, 1, 'Still happening as of this morning, tried restarting the router too.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
    (5, 5, 'Technician replaced the compressor capacitor. AC now cooling normally.', DATE_SUB(NOW(), INTERVAL 8 DAY)),
    (7, 2, 'Password reset and MFA re-registered. Please confirm you can log in.', DATE_SUB(NOW(), INTERVAL 3 DAY));
