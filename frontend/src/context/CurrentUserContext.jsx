import React, { createContext, useContext, useEffect, useState } from 'react';

// Lightweight "who am I" identity, since the assignment has no auth
// requirement. The user just picks themselves from the seeded people list;
// the choice is remembered in localStorage across reloads.
const STORAGE_KEY = 'service-desk.currentUser';
const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const logout = () => setUser(null);

  return (
    <CurrentUserContext.Provider value={{ user, login: setUser, logout }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  return ctx;
}
