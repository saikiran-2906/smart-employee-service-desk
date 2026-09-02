# Interview Explanation

## 3–5 Minute Pitch

"I built a **Smart Employee Service Desk & Ticket Management Portal** — a
full-stack app where employees raise IT/HR/Facilities/Finance/Access
Management support tickets, and each department's own support team triages,
assigns, and resolves them, with a live reporting dashboard.

The stack is **MySQL, Express, React and Node** — I chose MySQL over MongoDB
because the data is inherently relational (tickets belong to categories,
users, and have many comments), so a relational schema with foreign keys and
enums gives me data integrity for free instead of having to enforce it in
application code.

The backend is a **layered REST API**: routes → validators
(express-validator) → controllers → services (business rules) →
repositories (all raw parameterized SQL, no ORM). That separation makes it
easy to explain: repositories only know SQL, services only know business
rules like 'who can assign a ticket', controllers only shape HTTP
responses.

The most interesting design decision is the **role and department model**.
There's no password login — the assignment didn't require auth, so I used a
simple identity picker — but the authorization is still real and
server-side: every request carries the signed-in user's id in a header, and
the backend enforces that:
- **Employees** only ever see tickets they raised,
- **Support agents** only see tickets assigned to them,
- **Admins** are scoped to one department and are the only ones who can
  assign/reassign tickets, only to a Support agent in their own department.

On top of that, when a ticket is created it's **automatically assigned** to
the least-busy Support agent in that ticket's department (fewest Open/In
Progress tickets), so nothing sits unclaimed — the admin can still manually
reassign it afterward.

The frontend is React with a small design system (badges for priority/status,
a reusable card/table layout, toasts, loading/empty/error states) and
Recharts for the dashboard, which is also scoped — an admin sees stats for
their department only, others see stats for their own tickets."

---

## Likely Interviewer Questions & Concise Answers

### React
**Q: Why function components + hooks instead of class components?**
A: Simpler state/lifecycle management, less boilerplate, and it's the
current React standard. I used `useState`/`useEffect` for data fetching and
a `Context` (`CurrentUserContext`) for the cross-cutting "who's signed in"
state instead of prop-drilling.

**Q: How is routing handled?**
A: `react-router-dom` with a `RequireUser` wrapper component that redirects
to `/login` if no identity is chosen yet, similar to a protected-route
pattern in a real auth system.

### Node.js / Express
**Q: How do you avoid async/await error handling boilerplate in every route?**
A: An `asyncHandler` wrapper catches rejected promises and forwards them to
Express's centralized error-handling middleware, so a controller never needs
a try/catch — it just `await`s and throws `ApiError`s.

**Q: How are cross-cutting concerns (CORS, security headers, logging) handled?**
A: `helmet` for security headers, `cors` scoped to the frontend origin,
`morgan` for request logging, all wired once in `app.js`.

### REST APIs
**Q: Why not GraphQL?**
A: The API surface is small and the assignment specifically asked for REST
conventions. GraphQL would be over-engineering here.

**Q: How do you version or namespace the API?**
A: Everything is namespaced under `/api`; there's no `/v1` yet since it's a
single-version internal tool, but it would be a one-line change to add.

### SQL Server / MySQL
**Q: Why MySQL instead of the SQL Server the assignment mentioned?**
A: The user explicitly asked for MySQL + Express + React + Node, so I
followed that instruction over the original doc's suggestion — documented
as a design decision in the README.

**Q: How do you prevent SQL injection?**
A: Every query goes through `mysql2`'s parameterized `query(sql, params)` —
user input is never string-concatenated into SQL.

### Entity Framework / ORM
**Q: Why no ORM (Sequelize/Prisma)?**
A: The queries are simple enough that a thin repository layer with raw
parameterized SQL is more transparent and easier to explain in an interview
than an ORM's generated queries — and it avoids an extra dependency/learning
curve for a fresher-level project.

### Architecture
**Q: Walk me through a request end-to-end.**
A: `POST /api/tickets` → Express route → `requireCurrentUser` middleware
resolves the caller from `X-User-Id` → `validate(ticketValidators.create)`
checks the body → `ticketController.create` calls `ticketService.create` →
the service validates the category, auto-assigns via
`userRepository.findLeastBusySupportUser(categoryId)`, and calls
`ticketRepository.create` → repository runs the parameterized `INSERT` →
result flows back up as a `201` JSON response.

### Validation
**Q: Where is validation enforced?**
A: Both ends — React does client-side checks for instant feedback, but the
backend re-validates everything with `express-validator` and business-rule
checks in the service layer (e.g., "category must exist"), because you
should never trust the client.

### Exception Handling
**Q: How are errors surfaced consistently?**
A: A custom `ApiError` class carries an HTTP status code; a single
centralized `errorHandler` middleware (last in the chain) turns any thrown
error — operational (`ApiError`) or raw MySQL errors — into a clean
`{ success: false, error: { message } }` JSON response with the right status
code (400/401/403/404/409/500).

### Database Relationships
**Q: Explain the schema.**
A: `categories` (departments) 1-to-many `tickets`; `users` 1-to-many
`tickets` twice (creator via `created_by`, assignee via `assigned_to`);
`tickets` 1-to-many `comments` (cascade delete); and a newer `users.department_id`
self-relationship to `categories`, scoping Admin/Support to one department.

### Dashboard Implementation
**Q: How are the stats computed?**
A: SQL aggregation queries (`COUNT(*) ... GROUP BY status/priority`, and a
`LEFT JOIN` for per-category counts so departments with zero tickets still
show up), scoped by a `WHERE` clause that depends on the caller's role.

### Design Decisions
**Q: Why department-scoped admins instead of one global admin?**
A: It mirrors how a real IT service desk works — each department manages its
own queue — and it made the authorization logic satisfying to reason about
end-to-end (nobody can see or touch tickets outside their scope).

**Q: What would you add with more time?**
A: Real password/JWT-based authentication, pagination, file attachments, and
email notifications — see the README's Future Improvements section.
