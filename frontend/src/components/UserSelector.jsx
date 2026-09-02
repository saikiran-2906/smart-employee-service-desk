// src/components/UserSelector.jsx
//
// Dropdown that lets you pick "who you are" since real login
// was intentionally left out. Shows avatar initial + role badge.

import { useUser } from '../context/UserContext';

export default function UserSelector() {
    const { users, currentUser, selectUser } = useUser();

    if (!currentUser) return null;

    function handleChange(e) {
        const user = users.find((u) => String(u.UserId) === e.target.value);
        if (user) selectUser(user);
    }

    const initial = currentUser.Name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="user-selector">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
                <span className="user-name">{currentUser.Name}</span>
                <span className="user-role">{currentUser.Role || currentUser.Department}</span>
            </div>
            <select
                className="user-select"
                value={currentUser.UserId}
                onChange={handleChange}
                id="user-selector-dropdown"
            >
                {users.map((u) => (
                    <option key={u.UserId} value={u.UserId}>
                        {u.Name} — {u.Role || u.Department}
                    </option>
                ))}
            </select>
        </div>
    );
}
