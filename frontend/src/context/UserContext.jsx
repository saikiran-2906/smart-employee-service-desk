// src/context/UserContext.jsx
//
// Since real authentication is intentionally out of scope,
// we simulate "who is logged in" with a simple dropdown.
// This context makes the selected user available to every
// page without passing it down as props everywhere.

import { createContext, useContext, useEffect, useState } from 'react';
import { getUsers } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Load the list of users once, then restore whichever one
    // was last selected (stored in localStorage) or default to the first.
    useEffect(() => {
        getUsers().then((res) => {
            setUsers(res.data);
            const savedId = localStorage.getItem('currentUserId');
            const restored = res.data.find((u) => String(u.UserId) === savedId);
            setCurrentUser(restored || res.data[0] || null);
        });
    }, []);

    function selectUser(user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.UserId);
    }

    return (
        <UserContext.Provider value={{ users, currentUser, selectUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
