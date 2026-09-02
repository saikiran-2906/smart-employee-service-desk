// src/components/PriorityBadge.jsx
//
// Small colored label for ticket priority.
// Usage: <PriorityBadge priority="High" />

const COLORS = {
    High: { bg: '#fde2e2', text: '#b42318' },
    Medium: { bg: '#fef3c7', text: '#92400e' },
    Low: { bg: '#dcfce7', text: '#166534' }
};

export default function PriorityBadge({ priority }) {
    const colors = COLORS[priority] || { bg: '#e5e7eb', text: '#374151' };

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
            {priority}
        </span>
    );
}
