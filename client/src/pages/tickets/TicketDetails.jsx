// client/src/pages/tickets/TicketDetails.jsx
import React, { useState, useEffect } from 'react';
import { TicketDetails as TicketDetailsModal } from '../../components/tickets/TicketDetails.jsx';
import { ticketApi } from '../../services/api/ticketApi.js';
import { useAppContext } from '../../context/AppContext.jsx';

export function TicketDetailsPage({ ticketId }) {
  const { selectedTicketId, navigateTo } = useAppContext();
  const [ticket, setTicket] = useState(null);

  const activeId = ticketId || selectedTicketId;

  useEffect(() => {
    async function load() {
      if (!activeId) return;
      try {
        const res = await ticketApi.getTicketById(activeId);
        if (res.success) setTicket(res.data);
      } catch (e) {
        console.error('Error fetching ticket', e);
      }
    }
    load();
  }, [activeId]);

  return (
    <TicketDetailsModal
      ticket={ticket}
      isOpen={!!ticket}
      onClose={() => navigateTo('tickets')}
      onTicketUpdated={(t) => setTicket(t)}
    />
  );
}

export default TicketDetailsPage;
