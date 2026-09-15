// client/src/pages/payments/Payments.jsx
import React, { useState, useEffect } from 'react';
import { PaymentTable } from '../../components/payments/PaymentTable.jsx';
import { PaymentForm } from '../../components/payments/PaymentForm.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { paymentApi } from '../../services/api/paymentApi.js';
import { Button } from '../../components/common/Button.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAppContext } from '../../context/AppContext.jsx';
import { CreditCard, Printer, RotateCw, PlusCircle, DollarSign } from 'lucide-react';

export function Payments() {
  const { isQuickPayOpen, setIsQuickPayOpen, quickPayTicket, setQuickPayTicket, refreshKey } = useAppContext();

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  async function loadPayments(page = 1) {
    setIsLoading(true);
    try {
      const res = await paymentApi.getPayments({ page, limit: 10 });
      if (res.success) {
        setPayments(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching payments', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [refreshKey]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" />
            Citation Fee Collections
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Municipal treasury deposits, payment reconciliation, and audit receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPayments(pagination.currentPage)}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Reload payments"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => {
              setQuickPayTicket(null);
              setIsQuickPayOpen(true);
            }}
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            Process Settlement
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <PaymentTable
        payments={payments}
        isLoading={isLoading}
        onViewReceipt={(p) => setSelectedReceipt(p)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={10}
        onPageChange={(page) => loadPayments(page)}
      />

      {/* Checkout / Payment Modal */}
      <PaymentForm
        isOpen={isQuickPayOpen}
        initialTicket={quickPayTicket}
        onClose={() => {
          setIsQuickPayOpen(false);
          setQuickPayTicket(null);
        }}
        onSuccess={() => loadPayments(1)}
      />

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Payment Settlement Receipt"
          subtitle={`Ref: ${selectedReceipt.referenceNumber}`}
          size="md"
          footer={
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
              <Button size="sm" colorScheme="brand" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs font-mono">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-bold text-slate-900 text-sm">METROPOLITAN PARKING AUTHORITY</h4>
              <p className="text-[11px] text-slate-500 font-sans">Official Municipal Receipt</p>
            </div>

            <div className="space-y-1.5 py-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Citation Number:</span>
                <span className="font-bold text-blue-700">{selectedReceipt.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Vehicle Plate:</span>
                <span className="font-bold">{selectedReceipt.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payment Tender:</span>
                <span>{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Transaction Date:</span>
                <span>{formatDate(selectedReceipt.transactionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Processed By:</span>
                <span>{selectedReceipt.cashierName || 'Online Portal'}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-dashed border-slate-300 font-bold text-sm text-slate-900">
              <span className="font-sans">Settled Amount:</span>
              <span className="text-emerald-700">{formatCurrency(selectedReceipt.amount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Payments;
