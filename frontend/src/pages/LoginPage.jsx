import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usersApi, categoriesApi } from '../api/services';
import { useCurrentUser } from '../context/CurrentUserContext';
import { Loading, ErrorState } from '../components/States';

// Simple "sign in as" picker — no password, since the assignment does not
// require authentication. Selecting a person just personalizes the portal
// and is remembered across reloads. Admin/Support are grouped by the
// department they belong to; Employees are listed separately since they are
// department-agnostic (can raise tickets for any department).
export default function LoginPage() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const handleSelect = (user) => {
    login(user);
    const redirectTo = location.state?.from || '/';
    navigate(redirectTo, { replace: true });
  };

  const employees = users.filter((u) => u.role === 'Employee');

  return (
    <div className="login-shell">
      <div className="login-card card">
        <div className="card__header">
          <span className="logo" style={{ display: 'inline-flex', marginRight: 10 }}>SD</span>
          Sign in to Service Desk
        </div>
        <div className="card__body">
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
            Select who you are to continue. No password is required for this demo portal.
          </p>

          {loading && <Loading label="Loading people..." />}
          {error && <ErrorState message={error} />}

          {!loading && !error && (
            <>
              {categories.map((c) => {
                const deptUsers = users.filter((u) => u.department_id === c.category_id);
                const admin = deptUsers.find((u) => u.role === 'Admin');
                const support = deptUsers.filter((u) => u.role === 'Support');
                if (!admin && support.length === 0) return null;

                return (
                  <div className="login-group" key={c.category_id}>
                    <div className="login-group__title">{c.name} Department</div>
                    <div className="login-list">
                      {admin && (
                        <button className="login-item" onClick={() => handleSelect(admin)}>
                          <span className="login-item__avatar">{admin.name.charAt(0)}</span>
                          <span>
                            <div className="login-item__name">{admin.name} <span className="login-item__tag">Admin</span></div>
                            <div className="login-item__meta">{admin.email}</div>
                          </span>
                        </button>
                      )}
                      {support.map((u) => (
                        <button key={u.user_id} className="login-item" onClick={() => handleSelect(u)}>
                          <span className="login-item__avatar">{u.name.charAt(0)}</span>
                          <span>
                            <div className="login-item__name">{u.name} <span className="login-item__tag">Support</span></div>
                            <div className="login-item__meta">{u.email}</div>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="login-group">
                <div className="login-group__title">Employees</div>
                <div className="login-list">
                  {employees.map((u) => (
                    <button key={u.user_id} className="login-item" onClick={() => handleSelect(u)}>
                      <span className="login-item__avatar">{u.name.charAt(0)}</span>
                      <span>
                        <div className="login-item__name">{u.name}</div>
                        <div className="login-item__meta">{u.email}</div>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
