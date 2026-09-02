// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getDashboard()
            .then((res) => setData(res.data))
            .catch(() => setError('Unable to load dashboard. Please try again.'));
    }, []);

    if (error) return <p style={{ color: 'red', padding: '24px' }}>{error}</p>;
    if (!data) return <p style={{ padding: '24px' }}>Loading dashboard...</p>;

    const statusCount = (name) => data.byStatus.find((s) => s.status === name)?.count || 0;

    return (
        <div style={{ padding: '24px' }}>
            <h2>Dashboard</h2>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Card label="Total Tickets" value={data.totalTickets} color="#1e3a8a" />
                <Card label="Open" value={statusCount('Open')} color="#075985" />
                <Card label="In Progress" value={statusCount('In Progress')} color="#92400e" />
                <Card label="Closed" value={statusCount('Closed')} color="#374151" />
                <Card
                    label="High Priority"
                    value={data.byPriority.find((p) => p.priority === 'High')?.count || 0}
                    color="#b42318"
                />
            </div>

            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                <BarSection title="Tickets by Category" rows={data.byCategory} labelKey="category" />
                <BarSection title="Tickets by Priority" rows={data.byPriority} labelKey="priority" />
                <BarSection title="Tickets by Status" rows={data.byStatus} labelKey="status" />
            </div>
        </div>
    );
}

function Card({ label, value, color }) {
    return (
        <div
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px 24px',
                minWidth: '140px',
                borderTop: `4px solid ${color}`
            }}
        >
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{label}</div>
        </div>
    );
}

// Simple horizontal bar chart built with plain divs - no charting
// library needed for a handful of categories.
function BarSection({ title, rows, labelKey }) {
    const max = Math.max(1, ...rows.map((r) => r.count));

    return (
        <div style={{ minWidth: '260px' }}>
            <h4>{title}</h4>
            {rows.map((row) => (
                <div key={row[labelKey]} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}>
                        {row[labelKey]} ({row.count})
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '10px' }}>
                        <div
                            style={{
                                width: `${(row.count / max) * 100}%`,
                                background: '#1e3a8a',
                                height: '10px',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
