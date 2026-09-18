// client/src/components/vehicles/VehicleForm.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { vehicleApi } from '../../services/api/vehicleApi.js';
import { PhAddressSelect } from '../common/PhAddressSelect.jsx';
import { useAppContext } from '../../context/AppContext.jsx';

export function VehicleForm({ isOpen, onClose, onSuccess }) {
  const { showToast, triggerRefresh } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    plateNumber: '',
    province: '',
    provinceCode: '',
    municipality: '',
    municipalityCode: '',
    barangay: '',
    barangayCode: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    registeredCity: ''
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddressChange(patch) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.plateNumber.trim() || !formData.make.trim()) {
      showToast({ title: 'Validation Error', description: 'License plate and vehicle make are required.', status: 'error' });
      return;
    }
    if (!formData.province) {
      showToast({ title: 'Validation Error', description: 'Province is required.', status: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await vehicleApi.registerVehicle({
        ...formData,
        plateNumber: formData.plateNumber.trim().toUpperCase()
      });
      if (res.success) {
        showToast({ title: 'Vehicle Registered', description: `Plate ${formData.plateNumber} added to registry.`, status: 'success' });
        triggerRefresh();
        onSuccess?.(res.data);
        onClose();
        setFormData({
          plateNumber: '',
          province: '',
          provinceCode: '',
          municipality: '',
          municipalityCode: '',
          barangay: '',
          barangayCode: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          vin: '',
          ownerName: '',
          ownerEmail: '',
          ownerPhone: '',
          registeredCity: ''
        });
      }
    } catch (err) {
      showToast({ title: 'Registration Failed', description: err.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Vehicle in Municipal Database"
      subtitle="DMV Cross-Indexing & Resident Parking Permit"
      size="md"
      footer={
        <>
          <Button variant="outline" colorScheme="gray" size="sm" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="brand" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Save Vehicle Record
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">License Plate *</label>
          <input
            type="text"
            required
            value={formData.plateNumber}
            onChange={(e) => handleChange('plateNumber', e.target.value.toUpperCase())}
            placeholder="e.g. 8ABC123"
            className="w-full font-mono uppercase font-bold p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Registered Address (Province / Municipality / Barangay) *
          </label>
          <PhAddressSelect value={formData} onChange={handleAddressChange} labels={false} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Make *</label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => handleChange('make', e.target.value)}
              placeholder="e.g. Toyota"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g. Camry"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              placeholder="e.g. Silver"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">VIN (Vehicle Identification)</label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
              placeholder="17 character VIN"
              className="w-full font-mono p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <label className="block font-semibold text-slate-700 mb-1">Owner Full Name</label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            placeholder="e.g. Danielle Vance"
            className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owner Email</label>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleChange('ownerEmail', e.target.value)}
              placeholder="driver@example.com"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owner Phone</label>
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleChange('ownerPhone', e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default VehicleForm;
