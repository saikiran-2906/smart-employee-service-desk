// src/pages/TicketForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getCategories } from '../services/api';
import { useUser } from '../context/UserContext';

export default function TicketForm() {
    const navigate = useNavigate();
    const { currentUser } = useUser();

    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        getCategories().then((res) => {
            setCategories(res.data);
            if (res.data.length > 0) setCategoryId(res.data[0].CategoryId);
        });
    }, []);

    function validate() {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        else if (title.length > 200) newErrors.title = 'Title must be 200 characters or fewer';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!categoryId) newErrors.categoryId = 'Department/Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitError('');
        setSuccessMessage('');

        if (!validate()) return;

        try {
            const res = await createTicket({
                title,
                description,
                categoryId,
                priority,
                createdBy: currentUser.UserId
            });

            setSuccessMessage('Ticket created successfully!');
            setTitle('');
            setDescription('');
            setPriority('Medium');

            // Give the success message a moment to show, then go to the new ticket.
            setTimeout(() => navigate(`/tickets/${res.data.TicketId}`), 800);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Unable to create ticket. Please try again.');
        }
    }

    return (
        <div style={{ padding: '24px', maxWidth: '600px' }}>
            <h2>Create Ticket</h2>

            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

            <form onSubmit={handleSubmit}>
                <Field label="Title" error={errors.title}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle}
                    />
                </Field>

                <Field label="Description" error={errors.description}>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        style={inputStyle}
                    />
                </Field>

                <Field label="Department / Category" error={errors.categoryId}>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        style={inputStyle}
                    >
                        {categories.map((c) => (
                            <option key={c.CategoryId} value={c.CategoryId}>
                                {c.Name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Priority">
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </Field>

                <button type="submit" style={buttonStyle}>Create Ticket</button>
            </form>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>{label}</label>
            {children}
            {error && <div style={{ color: 'red', fontSize: '0.85rem' }}>{error}</div>}
        </div>
    );
}

const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};
