// client/src/components/tickets/TicketDetails.jsx
import React, { useState } from 'react';
import { TicketStatusBadge } from './TicketStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../common/Button.jsx';
import { Modal } from '../common/Modal.jsx';
import {
  Printer,
  CreditCard,
  AlertTriangle,
  XCircle,
  FileCheck2,
  MapPin,
  Camera,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ticketApi } from '../../services/api/ticketApi.js';
import { useAppContext } from '../../context/AppContext.jsx';

export function TicketDetails({
  ticket,
  isOpen,
  onClose,
  onPaymentSuccess,
  onTicketUpdated
}) {
  const { user } = useAuth();
  const { showToast, setQuickPayTicket, setIsQuickPayOpen } = useAppContext();
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const [isVoiding, setIsVoiding] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

  if (!ticket) return null;

  const canVoid = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const canDispute = ticket.status === 'ISSUED' || ticket.status === 'OVERDUE';
  const canPay = ticket.status === 'ISSUED' || ticket.status === 'OVERDUE' || ticket.status === 'DISPUTED';

  async function handleDisputeSubmit(e) {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setIsSubmittingDispute(true);
    try {
      const res = await ticketApi.disputeTicket(ticket.id, {
        reason: disputeReason,
        disputedBy: user?.name || 'Citizen Driver'
      });
      if (res.success) {
        showToast({
          title: 'Dispute Filed',
          description: 'Citation has been placed in adjudication review.',
          status: 'success'
        });
        setIsDisputing(false);
        onTicketUpdated?.(res.data);
      }
    } catch (err) {
      showToast({ title: 'Error Filing Dispute', description: err.message, status: 'error' });
    } finally {
      setIsSubmittingDispute(false);
    }
  }

  async function handleVoidSubmit(e) {
    e.preventDefault();
    if (!voidReason.trim()) return;
    setIsSubmittingVoid(true);
    try {
      const res = await ticketApi.voidTicket(ticket.id, voidReason);
      if (res.success) {
        showToast({
          title: 'Citation Voided',
          description: 'The citation was dismissed successfully.',
          status: 'success'
        });
        setIsVoiding(false);
        onTicketUpdated?.(res.data);
      }
    } catch (err) {
      showToast({ title: 'Error Voiding Citation', description: err.message, status: 'error' });
    } finally {
      setIsSubmittingVoid(false);
    }
  }

  function handlePrintCitation() {
    window.print();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Citation ${ticket.ticketNumber}`}
      subtitle={`Enforcement Record · Issued ${formatDate(ticket.issuedAt)}`}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <Button variant="outline" colorScheme="gray" size="sm" onClick={handlePrintCitation} leftIcon={<Printer className="w-4 h-4" />}>
            Print Citation
          </Button>
          <div className="flex items-center gap-2">
            {canDispute && !isDisputing && (
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                onClick={() => setIsDisputing(true)}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                File Dispute
              </Button>
            )}
            {canVoid && !isVoiding && ticket.status !== 'VOID' && ticket.status !== 'PAID' && (
              <Button
                variant="outline"
                colorScheme="gray"
                size="sm"
                onClick={() => setIsVoiding(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Void Citation
              </Button>
            )}
            {canPay && (
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() => {
                  onClose();
                  setQuickPayTicket(ticket);
                  setIsQuickPayOpen(true);
                }}
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                Process Payment ({formatCurrency(ticket.totalDue)})
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-base tracking-wider border border-blue-400">
              {ticket.plateNumber}
            </div>
            <div>
              <p className="text-xs text-slate-400">Vehicle State: <span className="text-white font-semibold">{ticket.state || 'CA'}</span></p>
              <h4 className="text-sm font-bold text-white">{ticket.violationTitle}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <span className="text-xs text-slate-400 block">Total Due</span>
              <span className="text-2xl font-black text-white">{formatCurrency(ticket.totalDue)}</span>
            </div>
            <TicketStatusBadge status={ticket.status} size="lg" />
          </div>
        </div>

        {/* Dispute Form overlay if active */}
        {isDisputing && (
          <form onSubmit={handleDisputeSubmit} className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Submit Citation Adjudication Rationale
            </div>
            <textarea
              required
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="State reason for contesting this parking citation (e.g., broken parking meter, valid residential permit displayed, emergency stop)..."
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => setIsDisputing(false)}>
                Cancel
              </Button>
              <Button size="xs" colorScheme="amber" type="submit" isLoading={isSubmittingDispute}>
                Submit to Adjudication Board
              </Button>
            </div>
          </form>
        )}

        {/* Void Form overlay if active */}
        {isVoiding && (
          <form onSubmit={handleVoidSubmit} className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-xs">
              <XCircle className="w-4 h-4 text-red-600" />
              Administrative Dismissal / Void Confirmation
            </div>
            <textarea
              required
              rows={2}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Provide official supervisor dismissal rationale (e.g. Officer entry error, meter malfunction validated)..."
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => setIsVoiding(false)}>
                Cancel
              </Button>
              <Button size="xs" colorScheme="red" type="submit" isLoading={isSubmittingVoid}>
                Authorize Void
              </Button>
            </div>
          </form>
        )}

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Infraction & Pricing */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" /> Citation Breakdown
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Violation Code:</span>
                <span className="font-mono font-semibold text-slate-800">{ticket.violationCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Base Fine:</span>
                <span className="font-medium text-slate-800">{formatCurrency(ticket.fineAmount)}</span>
              </div>
              {ticket.lateFee > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200/60 text-red-600">
                  <span>Assessed Late Penalty:</span>
                  <span className="font-semibold">+{formatCurrency(ticket.lateFee)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Payment Due Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(ticket.dueDate, false)}</span>
              </div>
              {ticket.paidAt && (
                <div className="flex justify-between py-1 text-teal-700 bg-teal-50 px-2 rounded">
                  <span>Paid On:</span>
                  <span className="font-semibold">{formatDate(ticket.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Officer */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Incident Location & Patrol
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Parking Zone:</span>
                <span className="font-medium text-slate-800">{ticket.zoneName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Address / Location:</span>
                <span className="font-medium text-slate-800 text-right">{ticket.locationDescription || 'Curbside Metered Stall'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Issuing Officer:</span>
                <span className="font-semibold text-slate-800">{ticket.officerName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Officer Badge #:</span>
                <span className="font-mono font-medium text-slate-800">{ticket.officerBadge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Photos */}
        {ticket.evidencePhotos && ticket.evidencePhotos.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" /> Photo & Sensor Evidence ({ticket.evidencePhotos.length})
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ticket.evidencePhotos.map((photo, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group aspect-video">
                  <img
                    src={photo}
                    alt={`Evidence ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-slate-900/80 text-[10px] text-white rounded font-mono">
                    Cam #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Officer Notes */}
        {ticket.notes && (
          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block mb-0.5">Field Officer Observation:</span>
            {ticket.notes}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TicketDetails;
