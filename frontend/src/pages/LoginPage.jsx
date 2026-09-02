import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usersApi, categoriesApi } from '../api/services';
import { useCurrentUser } from '../context/CurrentUserContext';
import { Loading, ErrorState } from '../components/States';

// Visual identity per department: an icon + accent gradient for its card.
const DEPT_META = {
  IT: { icon: '💻', color: 'linear-gradient(135deg, #6d5bf6, #8b7bff)' },
  HR: { icon: '🤝', color: 'linear-gradient(135deg, #ff6f91, #ff9a76)' },
  Facilities: { icon: '🏢', color: 'linear-gradient(135deg, #21d4c9, #17b26a)' },
  Finance: { icon: '💰', color: 'linear-gradient(135deg, #f7b733, #fc4a1a)' },
  'Access Management': { icon: '🔐', color: 'linear-gradient(135deg, #5b6dfa, #21a3d4)' },
};
const DEFAULT_META = { icon: '🏬', color: 'linear-gradient(135deg, #6d5bf6, #9b6bff)' };

// Two-step "sign in as" picker — no password, since the assignment does not
// require authentication. Step 1: pick a department (or Employees). Step 2:
// pick the specific person. The choice is remembered across reloads.
export default function LoginPage() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState(null); // { type: 'department', category } | { type: 'employees' } | null
  const { login } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    Promise.all([usersApi.list(), categoriesApi.list()])
      .then(([u, c]) => {
        setUsers(u);
        setCategories(c);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPerson = (user) => {
    login(user);
    const redirectTo = location.state?.from || '/';
    navigate(redirectTo, { replace: true });
  };

  const employees = users.filter((u) => u.role === 'Employee');

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-hero__logo">SD</div>
        <h1>Smart Service Desk</h1>
        <p>Select your department, then pick who you are. No password needed for this demo portal.</p>
      </div>

      <div className="login-panel">
        {loading && <Loading label="Loading people..." />}
        {error && <ErrorState message={error} />}

        {!loading && !error && !selection && (
          <>
            <div className="login-panel__header">
              <div>
                <div className="login-panel__title">Choose your department</div>
                <div className="login-panel__subtitle">Each department has its own admin and support team</div>
              </div>
            </div>
            <div className="dept-grid">
              {categories.map((c) => {
                const meta = DEPT_META[c.name] || DEFAULT_META;
                const count = users.filter((u) => u.department_id === c.category_id).length;
                return (
                  <button
                    key={c.category_id}
                    className="dept-card"
                    style={{ '--dept-color': meta.color }}
                    onClick={() => setSelection({ type: 'department', category: c })}
                  >
                    <div className="dept-card__icon">{meta.icon}</div>
                    <div className="dept-card__name">{c.name}</div>
                    <div className="dept-card__count">{count} team member{count === 1 ? '' : 's'}</div>
                  </button>
                );
              })}
              <button
                className="dept-card dept-card--employees"
                style={{ '--dept-color': 'linear-gradient(135deg, #21d4c9, #17b26a)' }}
                onClick={() => setSelection({ type: 'employees' })}
              >
                <div className="dept-card__icon">🧑‍💻</div>
                <div className="dept-card__name">Employees</div>
                <div className="dept-card__count">{employees.length} people</div>
              </button>
            </div>
          </>
        )}

        {!loading && !error && selection?.type === 'department' && (
          <>
            <div className="login-panel__header">
              <div>
                <div className="login-panel__title">{selection.category.name} Department</div>
                <div className="login-panel__subtitle">Choose who you are signing in as</div>
              </div>
              <button className="login-back" onClick={() => setSelection(null)}>← Departments</button>
            </div>
            {(() => {
              const deptUsers = users.filter((u) => u.department_id === selection.category.category_id);
              const admin = deptUsers.find((u) => u.role === 'Admin');
              const support = deptUsers.filter((u) => u.role === 'Support');
              return (
                <>
                  {admin && (
                    <>
                      <div className="login-section-label">Department Admin</div>
                      <div className="people-grid">
                        <button className="people-card" onClick={() => handleSelectPerson(admin)}>
                          <span className="people-card__avatar">{admin.name.charAt(0)}</span>
                          <span>
                            <div className="people-card__name">{admin.name}<span className="people-card__tag">Admin</span></div>
                            <div className="people-card__meta">{admin.email}</div>
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                  {support.length > 0 && (
                    <>
                      <div className="login-section-label">Support Team</div>
                      <div className="people-grid">
                        {support.map((u) => (
                          <button key={u.user_id} className="people-card" onClick={() => handleSelectPerson(u)}>
                            <span className="people-card__avatar">{u.name.charAt(0)}</span>
                            <span>
                              <div className="people-card__name">{u.name}<span className="people-card__tag">Support</span></div>
                              <div className="people-card__meta">{u.email}</div>
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}

        {!loading && !error && selection?.type === 'employees' && (
          <>
            <div className="login-panel__header">
              <div>
                <div className="login-panel__title">Employees</div>
                <div className="login-panel__subtitle">Choose who you are signing in as</div>
              </div>
              <button className="login-back" onClick={() => setSelection(null)}>← Departments</button>
            </div>
            <div className="people-grid">
              {employees.map((u) => (
                <button key={u.user_id} className="people-card" onClick={() => handleSelectPerson(u)}>
                  <span className="people-card__avatar">{u.name.charAt(0)}</span>
                  <span>
                    <div className="people-card__name">{u.name}</div>
                    <div className="people-card__meta">{u.email}</div>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
