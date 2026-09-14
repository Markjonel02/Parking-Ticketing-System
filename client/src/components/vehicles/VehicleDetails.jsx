// client/src/components/vehicles/VehicleDetails.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { vehicleApi } from '../../services/api/vehicleApi.js';
import { TicketStatusBadge } from '../tickets/TicketStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Car, User, ShieldAlert, CreditCard, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';

export function VehicleDetails({ plateNumber, isOpen, onClose, onSelectTicket }) {
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsCreateTicketOpen, setQuickPayTicket, setIsQuickPayOpen } = useAppContext();

  useEffect(() => {
    async function loadVehicle() {
      if (!plateNumber || !isOpen) return;
      setIsLoading(true);
      try {
        const res = await vehicleApi.getVehicleByPlate(plateNumber);
        if (res.success) {
          setVehicle(res.data);
        }
      } catch (err) {
        console.error('Error fetching vehicle', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVehicle();
  }, [plateNumber, isOpen]);

  if (!isOpen) return null;

  const totalUnpaidAmount = (vehicle?.tickets || [])
    .filter((t) => t.status !== 'PAID' && t.status !== 'VOID')
    .reduce((acc, t) => acc + (t.totalDue || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? `Plate ${vehicle.plateNumber}` : 'Vehicle Details'}
      subtitle="Municipal Vehicle Master Registry & Citation Record"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {vehicle?.tickets?.length || 0} Total Lifetime Citations Recorded
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" colorScheme="gray" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              onClick={() => {
                onClose();
                setIsCreateTicketOpen(true);
              }}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Issue Citation
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading vehicle registry...</div>
      ) : vehicle ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-lg bg-blue-600 text-white font-mono font-bold text-lg tracking-wider border border-blue-400">
                {vehicle.plateNumber}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                <p className="text-xs text-slate-400">
                  State: <span className="text-white font-semibold">{vehicle.state}</span> · Color: {vehicle.color} · VIN: {vehicle.vin}
                </p>
              </div>
            </div>

            {totalUnpaidAmount > 0 ? (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800/80 text-right">
                <span className="text-[10px] uppercase font-bold text-red-400 block flex items-center justify-end gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" /> Outstanding Fines
                </span>
                <span className="text-lg font-black text-red-200">{formatCurrency(totalUnpaidAmount)}</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Clean Record
                </span>
                <span className="text-xs text-emerald-200">No Fines Due</span>
              </div>
            )}
          </div>

          {/* Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-400 block">Registered Owner</span>
              <span className="font-semibold text-slate-800 text-sm">{vehicle.ownerName || 'State Records'}</span>
              <p className="text-slate-500 mt-0.5">{vehicle.registeredCity || 'San Francisco, CA'}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Owner Contact</span>
              <span className="font-medium text-slate-800 block">{vehicle.ownerEmail || 'registry@dmv.gov'}</span>
              <span className="text-slate-500">{vehicle.ownerPhone || '(555) 019-2834'}</span>
            </div>
          </div>

          {/* Citation History Table */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Citation History ({vehicle.tickets?.length || 0})</span>
            </h5>

            {(!vehicle.tickets || vehicle.tickets.length === 0) ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No citations issued to this plate.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {vehicle.tickets.map((t) => (
                  <div key={t.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-blue-700">{t.ticketNumber}</span>
                      <p className="font-medium text-slate-800 mt-0.5">{t.violationTitle}</p>
                      <span className="text-[10px] text-slate-400">Issued {formatDate(t.issuedAt, false)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{formatCurrency(t.totalDue)}</span>
                        <TicketStatusBadge status={t.status} size="sm" />
                      </div>
                      {t.status !== 'PAID' && t.status !== 'VOID' && (
                        <Button
                          size="xs"
                          colorScheme="teal"
                          onClick={() => {
                            onClose();
                            setQuickPayTicket(t);
                            setIsQuickPayOpen(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-red-500">Vehicle not found.</div>
      )}
    </Modal>
  );
}

export default VehicleDetails;
