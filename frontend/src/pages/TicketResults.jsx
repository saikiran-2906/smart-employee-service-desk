// src/pages/TicketResults.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getCategories } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

export default function TicketResults() {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '', categoryId: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories().then((res) => setCategories(res.data));
    }, []);

    useEffect(() => {
        loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    function loadTickets() {
        setLoading(true);
        setError('');
        // Drop empty filter values so we don't send "?status=" to the API
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));

        getTickets(activeFilters)
            .then((res) => setTickets(res.data))
            .catch(() => setError('Unable to load tickets. Please try again.'))
            .finally(() => setLoading(false));
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2>Tickets</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option>Open</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                </select>

                <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                    <option value="">All Priorities</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>

                <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
                    <option value="">All Departments</option>
                    {categories.map((c) => (
                        <option key={c.CategoryId} value={c.CategoryId}>{c.Name}</option>
                    ))}
                </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Loading tickets...</p>}

            {!loading && !error && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Title</th>
                            <th style={thStyle}>Department</th>
                            <th style={thStyle}>Priority</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Created</th>
                            <th style={thStyle}>Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((t) => (
                            <tr key={t.TicketId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={tdStyle}>
                                    <Link to={`/tickets/${t.TicketId}`}>#{t.TicketId}</Link>
                                </td>
                                <td style={tdStyle}>{t.Title}</td>
                                <td style={tdStyle}>{t.CategoryName}</td>
                                <td style={tdStyle}><PriorityBadge priority={t.Priority} /></td>
                                <td style={tdStyle}><StatusBadge status={t.Status} /></td>
                                <td style={tdStyle}>{new Date(t.CreatedDate).toLocaleDateString()}</td>
                                <td style={tdStyle}>{t.AssignedToName || '—'}</td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
                            <tr>
                                <td style={tdStyle} colSpan={7}>No tickets match these filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle = { padding: '8px' };
const tdStyle = { padding: '8px' };
