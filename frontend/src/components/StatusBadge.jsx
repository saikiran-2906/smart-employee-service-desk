// src/components/StatusBadge.jsx
//
// Colored badge for ticket status.

export default function StatusBadge({ status }) {
    const classMap = {
        'Open': 'badge badge-open',
        'Assigned': 'badge badge-assigned',
        'In Progress': 'badge badge-in-progress',
        'Resolved': 'badge badge-resolved',
        'Closed': 'badge badge-closed'
    };

    return (
        <span className={classMap[status] || 'badge'}>
            <span className="badge-dot" />
            {status}
        </span>
    );
}
