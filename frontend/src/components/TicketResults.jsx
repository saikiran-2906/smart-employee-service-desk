import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { EmptyState } from './States';
import { formatDate } from '../utils/format';

// Displays a list of tickets in a table: id, title, category, priority,
// status, assignment and creation date. Clicking a row opens the detail.
export default function TicketResults({ tickets }) {
  const navigate = useNavigate();

  if (!tickets || tickets.length === 0) {
    return (
      <EmptyState
        icon="🎫"
        title="No tickets found"
        message="Try changing the filters or create a new ticket."
      />
    );
  }

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.ticketId} onClick={() => navigate(`/tickets/${t.ticketId}`)}>
                <td className="ticket-id">#{t.ticketId}</td>
                <td>{t.title}</td>
                <td>{t.categoryName}</td>
                <td><PriorityBadge priority={t.priority} /></td>
                <td><StatusBadge status={t.status} /></td>
                <td>{t.assignedToName || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                <td>{formatDate(t.createdDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
