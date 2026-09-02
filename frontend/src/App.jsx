import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/NewTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';

// Redirects to the identity picker until a user has "signed in".
function RequireUser({ children }) {
  const { user } = useCurrentUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <CurrentUserProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireUser><DashboardPage /></RequireUser>} />
          <Route path="/tickets" element={<RequireUser><TicketsPage /></RequireUser>} />
          <Route path="/tickets/new" element={<RequireUser><NewTicketPage /></RequireUser>} />
          <Route path="/tickets/:id" element={<RequireUser><TicketDetailPage /></RequireUser>} />
        </Routes>
      </ToastProvider>
    </CurrentUserProvider>
  );
}
