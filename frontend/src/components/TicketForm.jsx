import React, { useEffect, useState } from 'react';
import { categoriesApi, ticketsApi } from '../api/services';
import { useToast } from './Toast';
import { useCurrentUser } from '../context/CurrentUserContext';

const PRIORITIES = ['High', 'Medium', 'Low'];

const EMPTY = {
  title: '',
  description: '',
  categoryId: '',
  priority: 'Medium',
};

// Ticket creation form with client-side validation, loading/error/success
// handling, and duplicate-submit prevention. The ticket is always raised in
// the name of the signed-in user (enforced server-side too).
export default function TicketForm({ onCreated }) {
  const toast = useToast();
  const { user } = useCurrentUser();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch((err) => setLoadError(err.message));
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Client-side validation mirrors the backend rules.
  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (!form.categoryId) next.categoryId = 'Category is required.';
    if (!form.priority) next.priority = 'Priority is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await ticketsApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        priority: form.priority,
      });
      toast.success('Ticket created', `Ticket #${created.ticketId} was submitted.`);
      setForm(EMPTY);
      setErrors({});
      if (onCreated) onCreated(created);
    } catch (err) {
      const fieldErrors = {};
      (err.details || []).forEach((d) => { fieldErrors[d.field] = d.message; });
      setErrors(fieldErrors);
      toast.error('Could not create ticket', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return <div className="alert alert--error">Failed to load form data: {loadError}</div>;
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label>Raised By</label>
        <input type="text" value={user ? `${user.name} (${user.role})` : ''} disabled />
      </div>

      <div className="field">
        <label htmlFor="title">Title <span className="req">*</span></label>
        <input
          id="title"
          type="text"
          value={form.title}
          maxLength={200}
          placeholder="Brief summary of the issue"
          className={errors.title ? 'invalid' : ''}
          onChange={(e) => setField('title', e.target.value)}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Description <span className="req">*</span></label>
        <textarea
          id="description"
          value={form.description}
          placeholder="Describe the problem in detail..."
          className={errors.description ? 'invalid' : ''}
          onChange={(e) => setField('description', e.target.value)}
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="categoryId">Department / Category <span className="req">*</span></label>
          <select
            id="categoryId"
            value={form.categoryId}
            className={errors.categoryId ? 'invalid' : ''}
            onChange={(e) => setField('categoryId', e.target.value)}
          >
            <option value="">Select a department</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
        </div>

        <div className="field">
          <label htmlFor="priority">Priority <span className="req">*</span></label>
          <select
            id="priority"
            value={form.priority}
            className={errors.priority ? 'invalid' : ''}
            onChange={(e) => setField('priority', e.target.value)}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.priority && <span className="error-text">{errors.priority}</span>}
        </div>
      </div>

      <div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
}
