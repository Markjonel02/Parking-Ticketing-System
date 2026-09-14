// client/src/components/payments/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { paymentApi } from '../../services/api/paymentApi.js';
import { ticketApi } from '../../services/api/ticketApi.js';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Receipt,
  Building
} from 'lucide-react';

export function PaymentForm({
  isOpen,
  onClose,
  initialTicket = null,
  onSuccess
}) {
  const { showToast, triggerRefresh } = useAppContext();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(initialTicket);
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);

  // Form
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paidBy, setPaidBy] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cashTendered, setCashTendered] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState(null);

  useEffect(() => {
    if (initialTicket) {
      setTicket(initialTicket);
      setPaidBy(initialTicket.ownerName || '');
    } else {
      setTicket(null);
    }
    setCompletedPayment(null);
  }, [initialTicket, isOpen]);

  async function handleLookupCitation(e) {
    e?.preventDefault();
    if (!ticketSearchInput.trim()) return;
    setIsSearchingTicket(true);
    try {
      const res = await ticketApi.getTicketById(ticketSearchInput.trim().toUpperCase());
      if (res.success && res.data) {
        if (res.data.status === 'PAID') {
          showToast({ title: 'Already Settled', description: 'This citation has already been paid in full.', status: 'warning' });
        }
        setTicket(res.data);
      }
    } catch (err) {
      showToast({ title: 'Citation Not Found', description: 'Verify ticket number or license plate.', status: 'error' });
    } finally {
      setIsSearchingTicket(false);
    }
  }

  async function handleProcessPayment(e) {
    e.preventDefault();
    if (!ticket) return;

    setIsProcessing(true);
    try {
      const payload = {
        ticketId: ticket.id,
        amount: ticket.totalDue,
        paymentMethod,
        paidBy: paidBy || user?.name || 'Citizen Driver',
        cardBrand: 'Visa',
        lastFour: paymentMethod === 'CASH' ? null : '4242'
      };

      const res = await paymentApi.processPayment(payload);
      if (res.success) {
        setCompletedPayment(res.data);
        showToast({
          title: 'Payment Confirmed',
          description: `Receipt ${res.data.referenceNumber} generated for ${formatCurrency(res.data.amount)}.`,
          status: 'success'
        });
        triggerRefresh();
        onSuccess?.(res.data);
      }
    } catch (err) {
      showToast({ title: 'Payment Processing Failed', description: err.message, status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }

  const isCashier = user?.role === 'ADMIN' || user?.role === 'CASHIER';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCompletedPayment(null);
        onClose();
      }}
      title={completedPayment ? 'Settlement Receipt' : 'Settle Parking Citation'}
      subtitle={completedPayment ? 'Official Municipal Record' : 'Secure Online & Counter Terminal'}
      size={completedPayment ? 'md' : 'lg'}
      footer={
        completedPayment ? (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Receipt
            </Button>
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => {
                setCompletedPayment(null);
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <Button variant="outline" colorScheme="gray" size="sm" onClick={onClose} isDisabled={isProcessing}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              size="sm"
              isDisabled={!ticket || ticket.status === 'PAID'}
              isLoading={isProcessing}
              onClick={handleProcessPayment}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Authorize Payment {ticket ? `(${formatCurrency(ticket.totalDue)})` : ''}
            </Button>
          </>
        )
      }
    >
      {completedPayment ? (
        /* Printable Digital Receipt Card */
        <div className="space-y-4 text-xs font-mono">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">METROPOLITAN PARKING AUTHORITY</h3>
            <p className="text-[11px] text-slate-500 font-sans">Official Citation Payment Receipt</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
              TRANSACTION APPROVED
            </span>
          </div>

          <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Receipt Ref:</span>
              <span className="font-bold text-slate-900">{completedPayment.referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Citation Number:</span>
              <span className="font-bold text-blue-700">{completedPayment.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">License Plate:</span>
              <span className="font-bold text-slate-900">{completedPayment.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Date & Time:</span>
              <span className="text-slate-700 font-sans">{formatDate(completedPayment.transactionDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Payment Method:</span>
              <span className="text-slate-900">{completedPayment.paymentMethod.replace('_', ' ')} (··4242)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Payer:</span>
              <span className="text-slate-900 font-sans">{completedPayment.paidBy}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold pt-1 text-slate-900">
            <span className="font-sans">Total Amount Paid:</span>
            <span className="text-emerald-700 text-base">{formatCurrency(completedPayment.amount)}</span>
          </div>

          <p className="text-[10px] text-slate-400 font-sans text-center pt-3">
            Keep this receipt for your records. The citation hold on DMV vehicle registration is now removed.
          </p>
        </div>
      ) : (
        /* Payment Checkout Form */
        <div className="space-y-4 text-xs">
          {/* Citation Lookup Bar if not provided */}
          {!ticket && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Look up Citation by Number or License Plate
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketSearchInput}
                  onChange={(e) => setTicketSearchInput(e.target.value)}
                  placeholder="e.g. PKG-2026-00101 or 7XYZ890"
                  className="flex-1 uppercase font-mono p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" colorScheme="brand" onClick={handleLookupCitation} isLoading={isSearchingTicket}>
                  Lookup
                </Button>
              </div>
            </div>
          )}

          {/* Selected Citation Card */}
          {ticket && (
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 font-mono font-bold text-xs text-white">
                    {ticket.plateNumber}
                  </span>
                  <span className="font-mono text-xs text-slate-300">{ticket.ticketNumber}</span>
                </div>
                <p className="font-medium text-xs text-slate-200 mt-1">{ticket.violationTitle}</p>
                <span className="text-[10px] text-slate-400">Due {formatDate(ticket.dueDate, false)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Total Due</span>
                <span className="text-xl font-bold text-emerald-400">{formatCurrency(ticket.totalDue)}</span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Select Tender Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'DEBIT_CARD', label: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'ONLINE_PORTAL', label: 'Web Portal', icon: <ShieldCheck className="w-4 h-4" /> },
                ...(isCashier ? [{ id: 'CASH', label: 'Counter Cash', icon: <Banknote className="w-4 h-4" /> }] : [])
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card / Cash Form */}
          {paymentMethod === 'CASH' ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <label className="block font-semibold text-emerald-900">Municipal Cash Register Tender</label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  step="0.01"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={`Exact Due: ${formatCurrency(ticket?.totalDue || 0)}`}
                  className="flex-1 p-2 bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-emerald-700">Cashier drawer balances will be credited immediately.</p>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cardholder Full Name</label>
                <input
                  type="text"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="Name on card"
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number (PCI Compliant)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full font-mono p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expires (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CVC Security Code</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default PaymentForm;
