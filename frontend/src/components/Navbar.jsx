// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import UserSelector from './UserSelector';

export default function Navbar() {
    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 24px',
                backgroundColor: '#1e3a8a',
                color: 'white'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <strong>Service Desk</strong>
                <Link to="/" style={linkStyle}>Dashboard</Link>
                <Link to="/tickets" style={linkStyle}>Tickets</Link>
                <Link to="/create" style={linkStyle}>Create Ticket</Link>
            </div>
            <UserSelector />
        </nav>
    );
}

const linkStyle = { color: 'white', textDecoration: 'none' };
