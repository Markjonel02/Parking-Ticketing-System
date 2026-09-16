// client/src/pages/violations/Violations.jsx
import React, { useState, useEffect } from 'react';
import { violationApi } from '../../services/api/violationApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { AlertOctagon, PlusCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export function Violations() {
  const { showToast, triggerRefresh, refreshKey } = useAppContext();
  const { user } = useAuth();

  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    baseFine: 60,
    lateFee: 25,
    severity: 'MEDIUM',
    gracePeriodDays: 21,
    points: 0
  });

  async function loadViolations() {
    setIsLoading(true);
    try {
      const res = await violationApi.getViolations({ limit: 50 });
      if (res.success) {
        setViolations(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching violations', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadViolations();
  }, [refreshKey]);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  function openCreate() {
    setFormData({
      code: '',
      name: '',
      description: '',
      baseFine: 75,
      lateFee: 30,
      severity: 'MEDIUM',
      gracePeriodDays: 21,
      points: 0
    });
    setSelectedViolation(null);
    setIsEditing(true);
  }

  function openEdit(v) {
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description,
      baseFine: v.baseFine,
      lateFee: v.lateFee,
      severity: v.severity,
      gracePeriodDays: v.gracePeriodDays,
      points: v.points
    });
    setSelectedViolation(v);
    setIsEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (selectedViolation) {
        await violationApi.updateViolation(selectedViolation.id, formData);
        showToast({ title: 'Infraction Updated', description: `Code ${formData.code} updated.`, status: 'success' });
      } else {
        await violationApi.createViolation(formData);
        showToast({ title: 'Infraction Created', description: `Code ${formData.code} provisioned.`, status: 'success' });
      }
      setIsEditing(false);
      loadViolations();
    } catch (err) {
      showToast({ title: 'Operation Failed', description: err.message, status: 'error' });
    }
  }

  const severityColors = {
    LOW: 'bg-blue-50 text-blue-700 border-blue-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
     
            Municipal Infraction Codes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory violation schedules, standard penalty schedules, and grace periods
          </p>
        </div>

        {canManage && (
          <Button size="sm" colorScheme="brand" onClick={openCreate} leftIcon={<PlusCircle className="w-4 h-4" />}>
            Add Infraction Code
          </Button>
        )}
      </div>

      {/* Grid of Violations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {violations.map((v) => (
          <div
            key={v.id}
            onClick={() => canManage && openEdit(v)}
            className={`p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between transition-all ${
              canManage ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded">
                  {v.code}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${severityColors[v.severity] || severityColors.MEDIUM}`}>
                  {v.severity}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 leading-snug">{v.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{v.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Fine</span>
                <span className="font-bold text-base text-slate-900">{formatCurrency(v.baseFine)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Late Penalty</span>
                <span className="font-semibold text-red-600">+{formatCurrency(v.lateFee)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={selectedViolation ? `Edit Infraction ${selectedViolation.code}` : 'Add Municipal Infraction'}
        subtitle="Enforcement schedule and fine structure"
        size="md"
        footer={
          <>
            <Button variant="outline" colorScheme="gray" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" size="sm" onClick={handleSave}>
              Save Infraction
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Violation Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. METER-001"
                className="w-full font-mono uppercase p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Tier</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title / Infraction Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Expired Parking Meter"
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Ordinance Reference</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Fine ($)</label>
              <input
                type="number"
                required
                value={formData.baseFine}
                onChange={(e) => setFormData({ ...formData, baseFine: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Late Fee ($)</label>
              <input
                type="number"
                required
                value={formData.lateFee}
                onChange={(e) => setFormData({ ...formData, lateFee: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grace Period (Days)</label>
              <input
                type="number"
                value={formData.gracePeriodDays}
                onChange={(e) => setFormData({ ...formData, gracePeriodDays: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Violations;
