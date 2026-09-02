import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TicketResults from '../components/TicketResults';
import { Loading, ErrorState } from '../components/States';
import { ticketsApi, categoriesApi } from '../api/services';
import { useCurrentUser } from '../context/CurrentUserContext';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['High', 'Medium', 'Low'];

// Ticket listing page with status/priority/department filters. Visibility is
// scoped server-side: Admin sees tickets in their own department, Support
// sees tickets assigned to them, Employee sees tickets they raised.
export default function TicketsPage() {
  const { user } = useCurrentUser();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', categoryId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.categoryId) params.categoryId = filters.categoryId;

    ticketsApi.list(params)
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters]);

  const setFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  const isAdmin = user?.role === 'Admin';

  return (
    <Layout
      title={isAdmin ? `${user.department_name || 'Department'} Tickets` : 'My Tickets'}
      subtitle={isAdmin
        ? `View, filter and manage tickets in the ${user.department_name || ''} department`
        : (user?.role === 'Support' ? 'Tickets assigned to you' : 'Tickets you raised')}
      actions={<Link to="/tickets/new" className="btn">+ New Ticket</Link>}
    >
      <div className="toolbar">
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {!isAdmin && (
          <select value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
            <option value="">All Departments</option>
            {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <Loading label="Loading tickets..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <TicketResults tickets={tickets} />
      )}
    </Layout>
  );
}
