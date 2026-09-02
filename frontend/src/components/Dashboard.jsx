import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../api/services';
import { Loading, ErrorState } from './States';

const PRIORITY_COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };
const STATUS_COLORS = {
  Open: '#2563eb',
  'In Progress': '#7c3aed',
  Resolved: '#0891b2',
  Closed: '#6b7280',
};

// Reporting dashboard: totals + charts for status, priority and category.
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    dashboardApi.summary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const statusData = Object.entries(data.byStatus).map(([label, count]) => ({ label, count }));
  const priorityData = Object.entries(data.byPriority).map(([label, count]) => ({ label, count }));
  const categoryData = data.byCategory.map((c) => ({ label: c.category, count: c.count }));

  const openCount = data.byStatus.Open || 0;
  const inProgressCount = data.byStatus['In Progress'] || 0;
  const closedCount = data.byStatus.Closed || 0;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__icon">🎫</div>
          <div>
            <div className="stat-card__value">{data.totalTickets}</div>
            <div className="stat-card__label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#dbeafe' }}>📥</div>
          <div>
            <div className="stat-card__value">{openCount}</div>
            <div className="stat-card__label">Open</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#ede9fe' }}>⚙️</div>
          <div>
            <div className="stat-card__value">{inProgressCount}</div>
            <div className="stat-card__label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#f3f4f6' }}>✅</div>
          <div>
            <div className="stat-card__value">{closedCount}</div>
            <div className="stat-card__label">Closed</div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card__header">Tickets by Status</div>
          <div className="card__body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="label" outerRadius={90} label>
                  {statusData.map((entry) => (
                    <Cell key={entry.label} fill={STATUS_COLORS[entry.label] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card__header">Tickets by Priority</div>
          <div className="card__body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.label} fill={PRIORITY_COLORS[entry.label] || '#9ca3af'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card__header">Tickets by Department</div>
          <div className="card__body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
