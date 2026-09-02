# Smart Employee Service Desk & Ticket Management Portal

A full‑stack **employee service‑desk portal** where employees raise support tickets and a support team triages, assigns, updates, and resolves them. Includes a clean reporting dashboard.

Built with **MySQL + Express + React + Node (a "MERN‑style" stack using MySQL instead of MongoDB)**.

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Roles, Departments & Authentication](#roles-departments--authentication)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Design](#database-design)
- [Sample Data](#sample-data)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Additional Deliverables](#additional-deliverables)

---

## Features

### Employee
- Create support tickets with title, description, department/category and priority.
- View submitted tickets and track their status.

### Support Team
- View and filter all tickets (by status, priority, department).
- Assign a ticket to a support staff member (auto‑moves `Open → In Progress`).
- Update ticket status and change priority.
- Add resolution notes / comments.
- Close tickets.

### Dashboard
- Total tickets and status counters.
- Tickets by **status** (pie chart).
- Tickets by **priority** (bar chart, color‑coded).
- Tickets by **department** (bar chart).

### Cross‑cutting
- Frontend **and** backend validation.
- Central error handling with clean JSON error responses.
- Loading / empty / error states and toast notifications.
- Responsive, professional UI (sidebar, top bar, cards, tables, badges).

---

## Technology Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, React Router, Axios, Recharts, Vite |
| Backend   | Node.js, Express, express‑validator |
| Database  | MySQL 8 (via `mysql2` connection pool, parameterized SQL) |
| Testing   | Jest + Supertest |
| Security  | Helmet, CORS, parameterized queries |

> Design decision: the assignment listed a MERN stack but requested **MySQL**, so MongoDB is replaced by MySQL. Data access uses `mysql2` with a repository layer and parameterized SQL — simple, explainable, and safe from SQL injection (no heavy ORM needed).

---

## Architecture

Layered REST architecture:

```
Request → Route → Validator → Controller → Service → Repository → MySQL
                                   ↑                         │
                            Error Handler ←──────────────────┘
```

- **Routes** – map HTTP verbs/paths to controllers.
- **Validators** – express‑validator chains (input validation at the boundary).
- **Controllers** – parse the request, call a service, shape the HTTP response.
- **Services** – business logic (assignment rules, close rules, FK checks).
- **Repositories** – all SQL lives here (parameterized queries).
- **Middleware** – validation, identity resolution, 404, and centralized error handling.

---

## Roles, Departments & Authentication

There are 5 departments: **IT, HR, Facilities, Finance, Access Management**.
Each department has exactly **one Admin** and **two Support agents**;
Employees are department-agnostic and can raise tickets for any department.

| Role | Scope | Can do |
|------|-------|--------|
| **Employee** | Not department-bound | Create tickets; view only tickets they raised |
| **Support** | One department | View/manage only tickets **assigned to them** (status, priority, notes, close) |
| **Admin** | One department ("department admin") | View **all tickets in their department**; the only role that can **assign/reassign** tickets, always to a Support agent in that same department |

**No password login.** The assignment does not require authentication, so the
frontend uses a simple "sign in as" identity picker (login page lists every
department with its Admin + 2 Support agents, plus a separate Employees
section). The chosen identity is sent on every API call as an `X-User-Id`
header and is what the backend uses to enforce every rule above — this is
real server-side authorization (a user cannot see or act outside their scope
by tampering with query params), it just isn't cryptographically verified
like a password/JWT would be. See [Future Improvements](#future-improvements).

**Auto-assignment.** When an Employee creates a ticket, it is immediately
auto-assigned to the Support agent **in that ticket's department** who
currently has the fewest Open/In Progress tickets (simple load balancing),
and the ticket starts at status `In Progress`. The department Admin can
reassign it to the other Support agent in the same department at any time via
the ticket detail page.

---

## Project Structure

```
sai_kirapro/
├── backend/
│   ├── sql/
│   │   ├── schema.sql          # Database + tables (idempotent)
│   │   └── seed.sql            # Sample data (departments, users, tickets)
│   ├── src/
│   │   ├── config/             # env config + MySQL pool
│   │   ├── controllers/        # HTTP handlers
│   │   ├── db/                 # DB initializer (schema + seed + migrations)
│   │   ├── middleware/         # currentUser, validate, notFound, errorHandler
│   │   ├── repositories/       # SQL data access
│   │   ├── routes/             # Express routers
│   │   ├── scripts/            # db:init / db:seed CLIs
│   │   ├── services/           # business logic (role/department rules)
│   │   ├── utils/              # ApiError, asyncHandler, constants
│   │   ├── validators/         # express-validator chains
│   │   ├── app.js              # Express app
│   │   └── server.js           # entry point
│   ├── tests/                  # Jest + Supertest API tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # axios client (attaches X-User-Id) + API services
│   │   ├── components/         # TicketForm, TicketResults, PriorityBadge,
│   │   │                       #   Dashboard, StatusBadge, Layout, Toast, States, Sidebar
│   │   ├── context/            # CurrentUserContext (identity picker state)
│   │   ├── pages/               # Login, Dashboard, Tickets, NewTicket, TicketDetail
│   │   ├── styles/             # index.css (design system)
│   │   ├── utils/              # formatting helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── INTERVIEW_PREP.md        # 3–5 min pitch + likely Q&A
│   └── VERIFICATION_CHECKLIST.md # Verified end-to-end checklist
├── .gitignore
└── README.md
```

---

## Prerequisites
- **Node.js** 18+ (tested on Node 24)
- **MySQL Server** 8.x running locally
- npm

---

## Database Setup

You do **not** have to create tables by hand — the backend auto‑creates the
schema and seed data on startup. You only need a running MySQL server and
valid credentials.

1. Make sure MySQL is running and you know your `root` password (or a user
   with privileges to create a database).
2. Copy the env template and fill in your credentials:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

   Edit `backend/.env`:

   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=service_desk
   DB_NAME_TEST=service_desk_test
   ```

3. (Optional) Create schema / seed explicitly without starting the server:

   ```powershell
   npm run db:init   # create database + tables only
   npm run db:seed   # create tables AND load sample data
   ```

   You can also run the raw SQL directly if you prefer:

   ```powershell
   mysql -u root -p < sql/schema.sql
   mysql -u root -p < sql/seed.sql
   ```

---

## Backend Setup

```powershell
cd backend
npm install
npm run dev      # starts with nodemon on http://localhost:5000
# or
npm start
```

On boot the server ensures the database exists, seeds sample data, verifies
connectivity, then serves the API at `http://localhost:5000/api`.

---

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev      # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend at `http://localhost:5000`,
so no extra configuration is required. To point at a different backend, copy
`.env.example` to `.env` and set `VITE_API_BASE_URL`.

---

## Running the Application

1. Start MySQL.
2. Terminal 1: `cd backend && npm run dev`
3. Terminal 2: `cd frontend && npm run dev`
4. Open `http://localhost:5173`.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

All responses use an envelope: `{ "success": true, "data": ... }` on success,
or `{ "success": false, "error": { "message", "details?" } }` on failure.

**Every `/tickets` and `/dashboard` request must include an `X-User-Id`
header** identifying the signed-in user (the frontend's axios client attaches
this automatically from the identity picker). Missing/unknown ids get `401`;
requests outside the caller's role/department scope get `403`.

### Tickets

| Method | URL | Body | Purpose |
|--------|-----|------|---------|
| GET | `/tickets` | — (query: `status`, `priority`, `categoryId`, `assignedTo`, `createdBy`) | List tickets — results are always re-scoped server-side by the caller's role, regardless of query params |
| GET | `/tickets/:id` | — | Get one ticket (with comments) |
| POST | `/tickets` | `{ title, description, categoryId, priority, assignedTo? }` | Create a ticket. `createdBy` is always the signed-in user (not client-supplied). If no `assignedTo` is given (the normal case), it's auto-assigned to the least-busy Support agent in that department |
| PUT | `/tickets/:id` | `{ title?, description?, categoryId?, priority?, status?, resolutionNote? }` | Partial update (priority/status/notes) — Admin (own department) or the assigned Support agent only |
| PUT | `/tickets/:id/assign` | `{ assignedTo }` | Assign/reassign a ticket — **department Admin only**, and only to a Support agent in that same department |
| PUT | `/tickets/:id/close` | `{ resolutionNote? }` | Close a ticket — Admin (own department) or the assigned Support agent only |
| GET | `/tickets/:id/comments` | — | List a ticket's notes |
| POST | `/tickets/:id/comments` | `{ notes }` | Add a note/comment (author is always the signed-in user) |

### Categories

| Method | URL | Body | Purpose |
|--------|-----|------|---------|
| GET | `/categories` | — | List departments/categories |
| POST | `/categories` | `{ name }` | Create a category |

### Users

| Method | URL | Body | Purpose |
|--------|-----|------|---------|
| GET | `/users` | — (query: `role=Employee|Support|Admin`) | List users, including `department_id`/`department_name` |
| GET | `/users/:id` | — | Get a user |
| POST | `/users` | `{ name, email, role?, departmentId? }` | Create a user |

### Dashboard

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/dashboard` | Aggregated totals by status, priority, department — scoped to the caller (Admin: own department, Support: their assigned tickets, Employee: tickets they raised) |

### Health

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/health` | Liveness check |

#### Example: create a ticket (as Employee `user_id=1`)

Request `POST /api/tickets` with header `X-User-Id: 1`:
```json
{
  "title": "Unable to access VPN",
  "description": "VPN times out during authentication from home.",
  "categoryId": 1,
  "priority": "High"
}
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "ticketId": 19,
    "title": "Unable to access VPN",
    "categoryId": 1,
    "categoryName": "IT",
    "priority": "High",
    "status": "In Progress",
    "createdBy": 1,
    "createdByName": "Aarav Sharma",
    "assignedTo": 12,
    "assignedToName": "Karan Malhotra",
    "createdDate": "2026-09-02 10:15:00"
  }
}
```
Note the ticket is auto-assigned and already `In Progress` — no separate
assign call was needed.

---

## Database Design

### Tables

**categories** – departments tickets can belong to.
- `category_id` (PK), `name` (UNIQUE)

**users** – employees, support staff, and department admins.
- `user_id` (PK), `name`, `email` (UNIQUE), `role` ENUM(`Employee`,`Support`,`Admin`)
- `department_id` (FK → categories, nullable) — the department an Admin/Support
  user belongs to; `NULL` for Employees, who are department-agnostic

**tickets** – the core entity.
- `ticket_id` (PK)
- `title`, `description`
- `category_id` (FK → categories) — also determines which department's Admin/Support can act on it
- `priority` ENUM(`High`,`Medium`,`Low`)
- `status` ENUM(`Open`,`In Progress`,`Resolved`,`Closed`)
- `created_by` (FK → users)
- `assigned_to` (FK → users, nullable)
- `created_date`, `updated_date` (auto‑managed)

**comments** – resolution notes / comments on a ticket.
- `comment_id` (PK)
- `ticket_id` (FK → tickets, `ON DELETE CASCADE`)
- `author_id` (FK → users, nullable)
- `notes`, `created_date`

### Relationships
- A **category** has many **tickets** (1‑to‑many), and many **users** (its Admin + Support agents).
- A **user** can create many **tickets** (`created_by`).
- A **user** (support) can be assigned many **tickets** (`assigned_to`).
- A **ticket** has many **comments** (1‑to‑many, cascade delete).

### Design decisions
- `department_id` on `users` is what makes an Admin/Support agent
  department-scoped; it was added via an idempotent migration
  (`ensureDepartmentColumn` in `src/db/initialize.js`) since MySQL doesn't
  support `ADD COLUMN IF NOT EXISTS` the way this project's other schema
  statements are written.
- `assigned_to` is nullable because a department could (in theory) have zero
  Support agents; in practice every seeded department has two, so new
  tickets are always auto-assigned immediately.
- Indexes on `status`, `priority`, `category_id`, `assigned_to`, `created_date`,
  and `users.department_id` speed up dashboard aggregations, list filtering,
  and the auto-assignment "least busy agent" lookup.
- Enums enforce valid role/priority/status values at the database level, in
  addition to API validation.
- `ON UPDATE CURRENT_TIMESTAMP` keeps `updated_date` accurate automatically.

---

## Sample Data

Seeded users (18 total, no passwords — see [Roles, Departments & Authentication](#roles-departments--authentication)):
- **3 Employees** (department-agnostic): Aarav Sharma, Priya Nair, Rahul Verma
- **5 departments**, each with **1 Admin + 2 Support agents**:
  - IT — Admin: Meera Rao · Support: Sara Thomas, Karan Malhotra
  - HR — Admin: Kavita Singh · Support: Anjali Bose, Ritu Chawla
  - Facilities — Admin: Arjun Mehta · Support: Farah Khan, Suresh Pillai
  - Finance — Admin: Divya Kapoor · Support: Neha Gupta, Tanya Joshi
  - Access Management — Admin: Rohan Das · Support: Vikram Iyer, Imran Sheikh

Six sample tickets are seeded from the assignment scenarios (VPN access,
laptop not booting, leave policy, access request, air‑conditioning,
reimbursement), pre-assigned to the Support agent matching their department.

---

## Testing

The backend has a **27-test** Jest + Supertest integration suite covering:
authentication (missing/invalid `X-User-Id`), role- and department-scoped
visibility (Admin/Support/Employee, including cross-department rejection),
ticket CRUD, auto-assignment, admin-only assignment with department
validation, closing, comments, validation failures, and dashboard scoping.

```powershell
cd backend
npm test
```

> Tests run against a **separate** database (`service_desk_test`), which is
> fully **reset (truncated) and reseeded** before the suite runs — this
> guarantees deterministic results (e.g. the auto-assignment "least busy
> agent" check) no matter how many times you re-run the suite. Ensure your
> `.env` credentials are valid before running.

---

## Screenshots

_Add screenshots here:_
- Dashboard
- Ticket list
- Create ticket
- Ticket detail / support actions

---

## Additional Deliverables

- **[Interview Explanation](docs/INTERVIEW_PREP.md)** — a 3–5 minute pitch for
  presenting this project, plus concise answers to likely interviewer
  questions about React, Node/Express, REST APIs, MySQL, ORMs, architecture,
  validation, exception handling, database relationships, the dashboard, and
  key design decisions.
- **[Verification Checklist](docs/VERIFICATION_CHECKLIST.md)** — an honestly
  verified (not assumed) checklist of every deliverable requirement, noting
  exactly how each item was confirmed (automated tests, live API calls, or
  code review where a browser wasn't used to visually confirm the UI).

---

## Future Improvements
- Real password/JWT-based authentication to replace the no-password identity
  picker (the authorization rules themselves are already real and
  server-side — this would just add cryptographic identity verification).
- Pagination and full‑text search on tickets.
- Email notifications on assignment/close.
- File attachments on tickets.
- Audit log of status changes.
- Docker Compose for one‑command startup.
