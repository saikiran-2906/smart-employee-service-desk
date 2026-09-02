import React from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'Admin';

  return (
    <Layout
      title="Dashboard"
      subtitle={isAdmin
        ? `Overview of tickets in the ${user.department_name || ''} department`
        : 'Overview of your tickets'}
    >
      <Dashboard />
    </Layout>
  );
}
