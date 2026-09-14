// client/src/pages/payments/PaymentDetails.jsx
import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../services/api/paymentApi.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Printer } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';

export function PaymentDetailsPage({ paymentId }) {
  const { navigateTo } = useAppContext();
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    async function load() {
      if (!paymentId) return;
      try {
        const res = await paymentApi.getPaymentById(paymentId);
        if (res.success) setPayment(res.data);
      } catch (e) {
        console.error('Error fetching payment details', e);
      }
    }
    load();
  }, [paymentId]);

  if (!payment) return null;

  return (
    <Modal
      isOpen={!!payment}
      onClose={() => navigateTo('payments')}
      title="Payment Record"
      subtitle={`Reference: ${payment.referenceNumber}`}
      size="sm"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
            Print
          </Button>
          <Button size="sm" colorScheme="teal" onClick={() => navigateTo('payments')}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-slate-500 font-sans">Citation:</span>
          <span className="font-bold">{payment.ticketNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-sans">Amount:</span>
          <span className="font-bold text-emerald-600">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-sans">Date:</span>
          <span>{formatDate(payment.transactionDate)}</span>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentDetailsPage;
