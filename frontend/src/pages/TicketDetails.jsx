// src/pages/TicketDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketById, updateTicket, closeTicket, addComment } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { useUser } from '../context/UserContext';

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function TicketDetails() {
    const { id } = useParams();
    const { currentUser } = useUser();

    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');

    const [statusChoice, setStatusChoice] = useState('');
    const [priorityChoice, setPriorityChoice] = useState('');
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        loadTicket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function loadTicket() {
        getTicketById(id)
            .then((res) => {
                setTicket(res.data);
                setStatusChoice(res.data.Status);
                setPriorityChoice(res.data.Priority);
            })
            .catch(() => setError('Ticket not found or unable to load.'));
    }

    async function runAction(promiseFn) {
        setActionError('');
        try {
            const res = await promiseFn();
            setTicket(res.data);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Action failed. Please try again.');
        }
    }

    if (error) return <p style={{ color: 'red', padding: '24px' }}>{error}</p>;
    if (!ticket) return <p style={{ padding: '24px' }}>Loading ticket...</p>;

    const isClosed = ticket.Status === 'Closed';

    return (
        <div style={{ padding: '24px', maxWidth: '700px' }}>
            <h2>#{ticket.TicketId} - {ticket.Title}</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <PriorityBadge priority={ticket.Priority} />
                <StatusBadge status={ticket.Status} />
            </div>

            <p><strong>Description:</strong> {ticket.Description}</p>
            <p><strong>Department:</strong> {ticket.CategoryName}</p>
            <p><strong>Created by:</strong> {ticket.CreatedByName} ({ticket.CreatedByEmail})</p>
            <p><strong>Assigned to:</strong> {ticket.AssignedToName || 'Unassigned'}</p>
            <p><strong>Created:</strong> {new Date(ticket.CreatedDate).toLocaleString()}</p>
            {ticket.ClosedDate && <p><strong>Closed:</strong> {new Date(ticket.ClosedDate).toLocaleString()}</p>}

            {actionError && <p style={{ color: 'red' }}>{actionError}</p>}

            {isClosed ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    This ticket is closed and can no longer be modified.
                </p>
            ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h4>Support Actions</h4>

                    <div style={{ marginBottom: '12px' }}>
                        <button
                            style={buttonStyle}
                            onClick={() => runAction(() => updateTicket(ticket.TicketId, {
                                assignedTo: currentUser.UserId,
                                status: ticket.Status === 'Open' ? 'Assigned' : undefined
                            }))}
                        >
                            Assign to Myself
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <select value={statusChoice} onChange={(e) => setStatusChoice(e.target.value)}>
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button style={buttonStyle} onClick={() => runAction(() => updateTicket(ticket.TicketId, { status: statusChoice }))}>
                            Update Status
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <select value={priorityChoice} onChange={(e) => setPriorityChoice(e.target.value)}>
                            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                        <button style={buttonStyle} onClick={() => runAction(() => updateTicket(ticket.TicketId, { priority: priorityChoice }))}>
                            Update Priority
                        </button>
                    </div>

                    <div>
                        <button
                            style={{ ...buttonStyle, backgroundColor: '#b42318' }}
                            onClick={() => runAction(() => closeTicket(ticket.TicketId))}
                        >
                            Close Ticket
                        </button>
                    </div>
                </div>
            )}

            <h4>Comments / Resolution Notes</h4>
            <div style={{ marginBottom: '16px' }}>
                {ticket.Comments.length === 0 && <p style={{ color: '#6b7280' }}>No comments yet.</p>}
                {ticket.Comments.map((c) => (
                    <div key={c.CommentId} style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            {c.UserName} - {new Date(c.CreatedDate).toLocaleString()}
                        </div>
                        <div>{c.Notes}</div>
                    </div>
                ))}
            </div>

            {!isClosed && (
                <div>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment or resolution note..."
                        rows={3}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
                    />
                    <button
                        style={{ ...buttonStyle, marginTop: '8px' }}
                        onClick={async () => {
                            if (!commentText.trim()) return;
                            await runAction(() => addComment(ticket.TicketId, {
                                userId: currentUser.UserId,
                                notes: commentText
                            }));
                            setCommentText('');
                        }}
                    >
                        Add Comment
                    </button>
                </div>
            )}
        </div>
    );
}

const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};
