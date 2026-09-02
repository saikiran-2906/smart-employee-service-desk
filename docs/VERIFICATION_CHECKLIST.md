# Verification Checklist

> **Stack note:** the original assignment doc suggested ASP.NET Core + SQL
> Server + EF Core. The user explicitly requested **MySQL + Express + React
> + Node** instead, so every item below is verified against that stack.
> Backend tests were run twice in a row to confirm results are deterministic
> (not order/state-dependent), and a bug where the test database accumulated
> data across runs (skewing auto-assignment) was found and fixed.

| # | Item | Status | How it was verified |
|---|------|--------|----------------------|
| 1 | React application runs | ✅ Verified | `npm run build` succeeds (no errors); `npm run dev` served the app on `:5173` and the Vite proxy correctly forwarded `/api` calls to the backend |
| 2 | Backend API runs | ✅ Verified | `npm start` boots the Express server, auto-initializes the DB, and serves `GET /api/health` → `{"status":"ok"}` |
| 3 | MySQL connection works | ✅ Verified | Server boot runs a `SELECT 1` connectivity check before accepting traffic; confirmed live |
| 4 | Database can be created | ✅ Verified | `npm run db:init` / `npm run db:seed` ran successfully; schema (incl. the `users.department_id` migration) applies idempotently on repeat runs |
| 5 | Sample data loads | ✅ Verified | Live check: `GET /api/users` → 18 users (3 employees + 5 departments × [1 admin + 2 support]); `GET /api/categories` → 5 departments |
| 6 | Ticket creation works | ✅ Verified | Tested via API for Employee, Support, and Admin callers; auto-assignment confirmed (ticket lands on the least-busy Support agent in its own department, status → `In Progress`) |
| 7 | Ticket listing works | ✅ Verified | Role-scoped lists confirmed: Admin sees only their department, Support sees only tickets assigned to them, Employee sees only tickets they raised |
| 8 | Ticket details work | ✅ Verified | `GET /api/tickets/:id` returns full ticket + comments; cross-department/cross-user access correctly returns `403` |
| 9 | Ticket update works | ✅ Verified | Priority/status/notes update tested via automated tests and live API calls |
| 10 | Ticket assignment works | ✅ Verified | Admin-only assignment enforced; cross-department admin/assignee combinations correctly rejected (`403`/`400`) |
| 11 | Comments / resolution notes work | ✅ Verified | Adding a note via `POST /api/tickets/:id/comments` and via the `resolutionNote` field on update, both tested |
| 12 | Ticket closing works | ✅ Verified | `PUT /api/tickets/:id/close` tested; double-close correctly rejected (`409`) |
| 13 | Priority indicators work | ⚠️ Code-reviewed, not visually screenshotted | `PriorityBadge.jsx` maps High→red, Medium→yellow, Low→green; not confirmed with an actual browser screenshot in this session |
| 14 | Dashboard works | ✅ Verified (API) / ⚠️ not screenshotted | Scoped stats confirmed live for Admin/Support/Employee via `GET /api/dashboard`; the chart rendering itself wasn't visually screenshotted this session |
| 15 | Validation works | ✅ Verified | Missing-field ticket creation correctly returns `400` with field-level `details` (automated test + manual check) |
| 16 | Error handling works | ✅ Verified | `400` (validation), `401` (missing/invalid identity), `403` (out-of-scope access), `404` (unknown ticket), `409` (duplicate close) all exercised by tests |
| 17 | Responsive UI works | ⚠️ Code-reviewed only | Media queries exist in `index.css` for the sidebar/detail grid; not device/viewport tested this session |
| 18 | README is complete | ✅ Verified | Updated to match the current department-scoped architecture, API surface, and schema |
| 19 | No secrets are committed | ✅ Verified | `backend/.env` and `frontend/.env` are git-ignored; only `.env.example` (placeholder values) is tracked |
| 20 | Project is GitHub-ready | ✅ Verified | Root `.gitignore`, clean folder structure, no build artifacts committed |

## Automated Test Results (most recent run)

```
Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
```

Run twice consecutively to confirm determinism after fixing the test-database
reset bug (`backend/src/db/initialize.js` now supports a `reset: true` option
that truncates all tables before reseeding, used by the test suite's
`beforeAll`).

## How to Re-run This Verification Yourself

```powershell
# Backend tests
cd backend
npm test

# Frontend build
cd ../frontend
npm run build

# Live smoke test (with backend running on :5000)
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/users | Select-Object -ExpandProperty data | Measure-Object
```
