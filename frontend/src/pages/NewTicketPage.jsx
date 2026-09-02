import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TicketForm from '../components/TicketForm';

export default function NewTicketPage() {
  const navigate = useNavigate();
  return (
    <Layout title="Create Ticket" subtitle="Raise a new support request">
      <div className="card">
        <div className="card__body">
          <TicketForm onCreated={(ticket) => navigate(`/tickets/${ticket.ticketId}`)} />
        </div>
      </div>
    </Layout>
  );
}
