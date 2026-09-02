// src/components/UserSelector.jsx
//
// Dropdown that lets you pick "who you are" since real login
// was intentionally left out. The selected user's UserId is
// used as createdBy/assignedTo/userId in API calls.

import { useUser } from '../context/UserContext';

export default function UserSelector() {
    const { users, currentUser, selectUser } = useUser();

    if (!currentUser) return null;

    function handleChange(e) {
        const user = users.find((u) => String(u.UserId) === e.target.value);
        if (user) selectUser(user);
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>Current User:</label>
            <select value={currentUser.UserId} onChange={handleChange}>
                {users.map((u) => (
                    <option key={u.UserId} value={u.UserId}>
                        {u.Name} - {u.Department}
                    </option>
                ))}
            </select>
        </div>
    );
}
