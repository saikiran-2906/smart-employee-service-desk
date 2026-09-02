import React from 'react';

// Renders a colored badge for ticket status.
const CLASS_MAP = {
  Open: 'badge badge--open',
  'In Progress': 'badge badge--in-progress',
  Resolved: 'badge badge--resolved',
  Closed: 'badge badge--closed',
};

export default function StatusBadge({ status }) {
  const className = CLASS_MAP[status] || 'badge';
  return (
    <span className={className}>
      <span className="badge__dot" />
      {status}
    </span>
  );
}
