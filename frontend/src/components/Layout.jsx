import React from 'react';
import Sidebar from './Sidebar';

// Page shell: fixed sidebar + top bar with a title/subtitle and actions.
export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar__title">{title}</div>
            {subtitle && <div className="topbar__subtitle">{subtitle}</div>}
          </div>
          {actions}
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
