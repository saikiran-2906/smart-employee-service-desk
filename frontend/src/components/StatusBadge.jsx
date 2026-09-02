// src/components/StatusBadge.jsx
//
// Small colored label for ticket status.
// Usage: <StatusBadge status="In Progress" />

const COLORS = {
    Open: { bg: '#e0f2fe', text: '#075985' },
    Assigned: { bg: '#ede9fe', text: '#5b21b6' },
    'In Progress': { bg: '#fef3c7', text: '#92400e' },
    Resolved: { bg: '#dcfce7', text: '#166534' },
    Closed: { bg: '#e5e7eb', text: '#374151' }
};

export default function StatusBadge({ status }) {
    const colors = COLORS[status] || { bg: '#e5e7eb', text: '#374151' };

    return (
        <span
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-block'
            }}
        >
            {status}
        </span>
    );
}
