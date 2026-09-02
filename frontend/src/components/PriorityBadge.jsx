// src/components/PriorityBadge.jsx
//
// Colored badge for ticket priority. High gets a pulsing glow.

export default function PriorityBadge({ priority }) {
    const classMap = {
        High: 'badge badge-high pulse',
        Medium: 'badge badge-medium',
        Low: 'badge badge-low'
    };

    const iconMap = {
        High: '🔴',
        Medium: '🟡',
        Low: '🟢'
    };

    return (
        <span className={classMap[priority] || 'badge'}>
            <span className="badge-dot" />
            {priority}
        </span>
    );
}
