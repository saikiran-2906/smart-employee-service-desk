import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function Sidebar() {
  const { user, logout } = useCurrentUser();
  const navigate = useNavigate();

  const handleSwitch = () => {
    logout();
    navigate('/login');
  };

  // Tickets link auto-scopes server-side (Admin: their own department,
  // Support: assigned to them, Employee: raised by them). Anyone signed in
  // can raise a new ticket, regardless of role.
  const nav = [
    { to: '/', label: 'Dashboard', icon: '📊', end: true },
    {
      to: '/tickets',
      label: user?.role === 'Admin' ? `${user.department_name || 'Department'} Tickets` : 'My Tickets',
      icon: '🎫',
    },
    { to: '/tickets/new', label: 'New Ticket', icon: '➕' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="logo">SD</span>
        <span>Service Desk</span>
      </div>

      {user && (
        <div className="sidebar__user">
          <span className="sidebar__user-avatar">{user.name.charAt(0)}</span>
          <span>
            <div className="sidebar__user-name">{user.name}</div>
            <div className="sidebar__user-role">
              {user.role}{user.department_name ? ` · ${user.department_name}` : ''}
            </div>
            <button className="sidebar__switch" onClick={handleSwitch}>Switch user</button>
          </span>
        </div>
      )}

      <nav className="sidebar__nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">Employee Service Desk Portal v1.0</div>
    </aside>
  );
}
