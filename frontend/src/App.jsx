// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TicketForm from './pages/TicketForm';
import TicketResults from './pages/TicketResults';
import TicketDetails from './pages/TicketDetails';

export default function App() {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<TicketForm />} />
                <Route path="/tickets" element={<TicketResults />} />
                <Route path="/tickets/:id" element={<TicketDetails />} />
            </Routes>
        </div>
    );
}
