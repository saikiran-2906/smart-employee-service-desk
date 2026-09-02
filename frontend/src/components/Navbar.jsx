// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import UserSelector from './UserSelector';

export default function Navbar() {
    const location = useLocation();

    function linkClass(path) {
        const isActive = path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(path);
        return `navbar-link${isActive ? ' active' : ''}`;
    }

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand-icon">🎫</span>
                    Service Desk
                </Link>
                <div className="navbar-links">
                    <Link to="/" className={linkClass('/')}>Dashboard</Link>
                    <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
                    <Link to="/create" className={linkClass('/create')}>Create Ticket</Link>
                </div>
            </div>
            <div className="navbar-right">
                <UserSelector />
            </div>
        </nav>
    );
}
