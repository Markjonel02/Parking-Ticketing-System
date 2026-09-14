// client/src/pages/tickets/CreateTicket.jsx
import React from 'react';
import { TicketForm } from '../../components/tickets/TicketForm.jsx';
import { useAppContext } from '../../context/AppContext.jsx';

export function CreateTicket() {
  const { navigateTo } = useAppContext();

  return (
    <div className="max-w-2xl mx-auto py-4">
      <TicketForm
        isOpen={true}
        onClose={() => navigateTo('tickets')}
        onSuccess={() => navigateTo('tickets')}
      />
    </div>
  );
}

export default CreateTicket;
