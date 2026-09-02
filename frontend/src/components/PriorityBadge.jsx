import React from 'react';

// Renders a colored badge for ticket priority.
// High -> Red, Medium -> Yellow/Amber, Low -> Green (per assignment).
const CLASS_MAP = {
  High: 'badge badge--high',
  Medium: 'badge badge--medium',
  Low: 'badge badge--low',
};

export default function PriorityBadge({ priority }) {
  const className = CLASS_MAP[priority] || 'badge';
  return (
    <span className={className}>
      <span className="badge__dot" />
      {priority}
    </span>
  );
}
