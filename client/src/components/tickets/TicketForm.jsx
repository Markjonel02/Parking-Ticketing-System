// client/src/components/tickets/TicketForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button.jsx';
import { Modal } from '../common/Modal.jsx';
import { violationApi } from '../../services/api/violationApi.js';
import { ticketApi } from '../../services/api/ticketApi.js';
import { vehicleApi } from '../../services/api/vehicleApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { PhAddressSelect } from '../common/PhAddressSelect.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Search, Camera, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

export function TicketForm({ isOpen, onClose, onSuccess }) {
  const { showToast, triggerRefresh } = useAppContext();
  const { user } = useAuth();

  const [violations, setViolations] = useState([]);
const [zones, setZones] = useState([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [address, setAddress] = useState({
    province: '',
    provinceCode: '',
    municipality: '',
    municipalityCode: '',
    barangay: '',
    barangayCode: ''
  });
  const [violationId, setViolationId] = useState('');
  const [zoneId, setZoneId] = useState('zn-downtown-01');
  const [locationDescription, setLocationDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState('https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80');

  // Plate lookup feedback
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [violRes] = await Promise.all([
          violationApi.getViolations({ limit: 50 })
        ]);
        if (violRes.success) {
          setViolations(violRes.data || []);
          if (violRes.data?.[0]) {
            setViolationId(violRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load violation catalogue', err);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Handle vehicle lookup
  async function handlePlateSearch() {
    if (!plateNumber.trim()) return;
    setIsLookingUp(true);
    setLookupResult(null);
    try {
      const res = await vehicleApi.getVehicleByPlate(plateNumber.trim());
      if (res.success && res.data) {
        setLookupResult(res.data);
        if (res.data.province) {
          setAddress({
            province: res.data.province || '',
            provinceCode: res.data.provinceCode || '',
            municipality: res.data.municipality || '',
            municipalityCode: res.data.municipalityCode || '',
            barangay: res.data.barangay || '',
            barangayCode: res.data.barangayCode || ''
          });
        }
        showToast({
          title: 'Vehicle Recognized',
          description: `${res.data.year || ''} ${res.data.make} ${res.data.model} found in DMV registry.`,
          status: 'info'
        });
      }
    } catch {
      setLookupResult({ notFound: true });
    } finally {
      setIsLookingUp(false);
    }
  }

  // Selected violation preview
  const selectedViolation = violations.find((v) => v.id === violationId);
  const baseFine = selectedViolation?.baseFine || 65;
  const zoneMultiplier = zoneId === 'zn-downtown-01' ? 1.25 : 1.0;
  const calculatedFine = Math.round(baseFine * zoneMultiplier);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!plateNumber.trim() || !violationId) {
      showToast({ title: 'Validation Error', description: 'License plate and violation code are required.', status: 'error' });
      return;
    }
    if (!address.province) {
      showToast({ title: 'Validation Error', description: 'Province is required for the citation record.', status: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        plateNumber: plateNumber.trim().toUpperCase(),
        ...address,
        violationId,
        zoneId,
        locationDescription: locationDescription || 'Curbside Meter Bay',
        notes,
        evidencePhotos: evidencePhoto ? [evidencePhoto] : []
      };

      const res = await ticketApi.createTicket(payload);
      if (res.success) {
        showToast({
          title: 'Citation Issued',
          description: `Citation ${res.data.ticketNumber} for ${res.data.plateNumber} recorded.`,
          status: 'success'
        });
        triggerRefresh();
        onSuccess?.(res.data);
        onClose();
        // Reset form
        setPlateNumber('');
        setLookupResult(null);
        setLocationDescription('');
        setNotes('');
      }
    } catch (err) {
      showToast({
        title: 'Issuance Failed',
        description: err.message || 'Could not issue citation',
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Parking Citation"
      subtitle="Authorized Officer Field Citation Terminal"
      size="lg"
      footer={
        <>
          <Button variant="outline" colorScheme="gray" size="sm" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Shield className="w-4 h-4" />}
          >
            Issue Citation ({formatCurrency(calculatedFine)})
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plate Lookup */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Vehicle License Plate <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 7XYZ890"
              className="flex-1 font-mono uppercase text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={handlePlateSearch}
              isLoading={isLookingUp}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            >
              Scan Plate
            </Button>
          </div>
        </div>

        {/* Address / Jurisdiction */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Registered Address (Province / Municipality / Barangay) <span className="text-red-500">*</span>
          </label>
          <PhAddressSelect value={address} onChange={setAddress} size="sm" labels={false} />
        </div>

        {/* DMV match banner */}
        {lookupResult && !lookupResult.notFound && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>{lookupResult.year} {lookupResult.make} {lookupResult.model}</strong> ({lookupResult.color}) · Owner: {lookupResult.ownerName}
              </span>
            </div>
            {lookupResult.unpaidTicketsCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                {lookupResult.unpaidTicketsCount} Prior Unpaid Citations
              </span>
            )}
          </div>
        )}

        {lookupResult?.notFound && (
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
            Plate not found in local registry. Standard municipal citation will be created.
          </div>
        )}

        {/* Infraction Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Violation Infraction <span className="text-red-500">*</span>
          </label>
          <select
            value={violationId}
            onChange={(e) => setViolationId(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {violations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.code} - {v.name} ({formatCurrency(v.baseFine)})
              </option>
            ))}
          </select>
          {selectedViolation && (
            <p className="text-[11px] text-slate-500 mt-1">{selectedViolation.description}</p>
          )}
        </div>

        {/* Zone & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Enforcement Zone</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="zn-downtown-01">Zone A: Downtown Financial District (1.25x High Demand)</option>
              <option value="zn-arts-02">Zone B: Arts & Theatre District (1.0x)</option>
              <option value="zn-residential-03">Zone C: Uptown Residential Grid (1.0x)</option>
              <option value="zn-waterfront-04">Zone D: Harbor & Waterfront Boardwalk (1.15x)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Bay #</label>
            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. 450 Montgomery St, Meter #42"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Photo Evidence URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Photo Evidence URL / Camera Capture
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={evidencePhoto}
              onChange={(e) => setEvidencePhoto(e.target.value)}
              placeholder="https://..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {evidencePhoto && (
              <a
                href={evidencePhoto}
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center text-slate-600"
                title="Preview capture"
              >
                <Camera className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Officer Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Field Observations / Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Vehicle parked across red curb for over 15 minutes. Hazard lights flashing."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fine Calculation Summary */}
        <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Total Statutory Assessment:</span>
            <div className="text-base font-bold text-white">
              {formatCurrency(calculatedFine)}
              <span className="text-[11px] font-normal text-slate-400 ml-2">
                (Base {formatCurrency(baseFine)} × Zone {zoneMultiplier}x)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block">Issuing Badge</span>
            <span className="text-blue-400 font-mono font-semibold">{user?.badgeNumber || 'EO-4421'}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default TicketForm;
