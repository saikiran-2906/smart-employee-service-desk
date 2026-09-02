import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { Loading, ErrorState } from '../components/States';
import { useToast } from '../components/Toast';
import { useCurrentUser } from '../context/CurrentUserContext';
import { ticketsApi, usersApi } from '../api/services';
import { formatDateTime } from '../utils/format';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['High', 'Medium', 'Low'];

// Ticket detail + support workflow: assign (admin-only), change
// priority/status, add resolution notes, and close the ticket (admin or the
// assigned support agent).
export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useCurrentUser();

  const [ticket, setTicket] = useState(null);
  const [supportUsers, setSupportUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    ticketsApi.get(id)
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  useEffect(() => {
    usersApi.list('Support').then(setSupportUsers).catch(() => {});
  }, []);

  // Generic partial-update helper used by the workflow controls.
  const patch = async (payload, successMsg) => {
    setSaving(true);
    try {
      const updated = await ticketsApi.update(id, payload);
      setTicket(updated);
      toast.success('Ticket updated', successMsg);
    } catch (err) {
      toast.error('Update failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (assignedTo) => {
    if (!assignedTo) return;
    setSaving(true);
    try {
      const updated = await ticketsApi.assign(id, Number(assignedTo));
      setTicket({ ...ticket, ...updated });
      load();
      toast.success('Ticket assigned', `Assigned to ${updated.assignedToName}.`);
    } catch (err) {
      toast.error('Assignment failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await ticketsApi.addComment(id, { notes: note.trim() });
      setNote('');
      load();
      toast.success('Note added', 'Resolution note saved.');
    } catch (err) {
      toast.error('Could not add note', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setSaving(true);
    try {
      const updated = await ticketsApi.close(id, note.trim() || undefined);
      setTicket(updated);
      setNote('');
      toast.success('Ticket closed', `Ticket #${updated.ticketId} was closed.`);
    } catch (err) {
      toast.error('Could not close ticket', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout title="Ticket"><Loading label="Loading ticket..." /></Layout>;
  }
  if (error) {
    return (
      <Layout title="Ticket">
        <Link to="/tickets" className="back-link">← Back to tickets</Link>
        <ErrorState message={error} onRetry={load} />
      </Layout>
    );
  }

  const isClosed = ticket.status === 'Closed';
  const isDeptAdmin = user?.role === 'Admin' && user.department_id === ticket.categoryId;
  const isOwningSupport = user?.role === 'Support' && ticket.assignedTo === user.user_id;
  const canManage = isDeptAdmin || isOwningSupport;
  // Only support agents in this ticket's own department are valid assignees.
  const deptSupportUsers = supportUsers.filter((u) => u.department_id === ticket.categoryId);

  return (
    <Layout title={`Ticket #${ticket.ticketId}`} subtitle={ticket.title}>
      <Link to="/tickets" className="back-link">← Back to tickets</Link>

      <div className="detail-grid">
        {/* Left: ticket content + workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{ticket.title}</span>
              <span style={{ display: 'flex', gap: 8 }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </span>
            </div>
            <div className="card__body">
              <div className="description-box">{ticket.description}</div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">Support Actions</div>
            <div className="card__body">
              {isClosed && (
                <div className="alert alert--success">This ticket is closed.</div>
              )}
              {!canManage && !isClosed && (
                <div className="alert alert--error">
                  You can view this ticket in read-only mode. Only this department's admin or the assigned support agent can manage it.
                </div>
              )}
              <div className="form-row">
                <div className="field">
                  <label>Assign To</label>
                  {isDeptAdmin ? (
                    <select
                      value={ticket.assignedTo || ''}
                      disabled={saving || isClosed}
                      onChange={(e) => handleAssign(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {deptSupportUsers.map((u) => (
                        <option key={u.user_id} value={u.user_id}>{u.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={ticket.assignedToName || 'Unassigned'} disabled />
                  )}
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select
                    value={ticket.priority}
                    disabled={saving || isClosed || !canManage}
                    onChange={(e) => patch({ priority: e.target.value }, `Priority set to ${e.target.value}.`)}
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <label>Status</label>
                <select
                  value={ticket.status}
                  disabled={saving || isClosed || !canManage}
                  onChange={(e) => patch({ status: e.target.value }, `Status set to ${e.target.value}.`)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <label>Resolution / Notes</label>
                <textarea
                  value={note}
                  placeholder="Add a resolution note or comment..."
                  disabled={saving || isClosed || !canManage}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  className="btn btn--secondary"
                  disabled={saving || isClosed || !canManage || !note.trim()}
                  onClick={handleAddNote}
                >
                  Add Note
                </button>
                <button
                  className="btn btn--danger"
                  disabled={saving || isClosed || !canManage}
                  onClick={handleClose}
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">Comments & Resolution Notes</div>
            <div className="card__body">
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <div style={{ color: 'var(--text-muted)' }}>No notes yet.</div>
              ) : (
                ticket.comments.map((c) => (
                  <div className="comment" key={c.commentId}>
                    <div className="comment__head">
                      <span className="comment__author">{c.authorName || 'System'}</span>
                      <span>{formatDateTime(c.createdDate)}</span>
                    </div>
                    <div>{c.notes}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="card">
          <div className="card__header">Details</div>
          <div className="card__body">
            <div className="meta-list">
              <div className="meta-item">
                <span className="label">Department</span>
                <span className="value">{ticket.categoryName}</span>
              </div>
              <div className="meta-item">
                <span className="label">Priority</span>
                <span className="value"><PriorityBadge priority={ticket.priority} /></span>
              </div>
              <div className="meta-item">
                <span className="label">Status</span>
                <span className="value"><StatusBadge status={ticket.status} /></span>
              </div>
              <div className="meta-item">
                <span className="label">Raised By</span>
                <span className="value">{ticket.createdByName}</span>
              </div>
              <div className="meta-item">
                <span className="label">Assigned To</span>
                <span className="value">{ticket.assignedToName || 'Unassigned'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Created</span>
                <span className="value">{formatDateTime(ticket.createdDate)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Last Updated</span>
                <span className="value">{formatDateTime(ticket.updatedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
