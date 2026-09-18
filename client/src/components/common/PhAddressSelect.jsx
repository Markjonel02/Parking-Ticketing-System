// client/src/components/common/PhAddressSelect.jsx
import React, { useMemo } from 'react';
import { listProvinces, listMunicipalities, listBarangays } from '../../utils/phAddress.js';

/**
 * Cascading Province -> Municipality/City -> Barangay selects backed by the
 * official PSGC dataset. Controlled component: pass the current address and
 * an onChange that receives the merged patch.
 *
 * value shape:
 * {
 *   provinceCode, province,
 *   municipalityCode, municipality,
 *   barangayCode, barangay
 * }
 */
export function PhAddressSelect({ value = {}, onChange, size = 'md', labels = true }) {
  const provinces = useMemo(() => listProvinces(), []);
  const municipalities = useMemo(
    () => listMunicipalities(value.provinceCode),
    [value.provinceCode]
  );
  const barangays = useMemo(
    () => listBarangays(value.municipalityCode),
    [value.municipalityCode]
  );

  const inputClasses =
    size === 'sm'
      ? 'w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
      : 'w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  function handleProvinceChange(e) {
    const psgcCode = e.target.value;
    const found = provinces.find((p) => p.psgcCode === psgcCode);
    onChange({
      provinceCode: psgcCode || '',
      province: found?.name || '',
      // Changing the province invalidates the previously selected
      // municipality/barangay, since they belong to the old province.
      municipalityCode: '',
      municipality: '',
      barangayCode: '',
      barangay: ''
    });
  }

  function handleMunicipalityChange(e) {
    const psgcCode = e.target.value;
    const found = municipalities.find((m) => m.psgcCode === psgcCode);
    onChange({
      ...value,
      municipalityCode: psgcCode || '',
      municipality: found?.name || '',
      barangayCode: '',
      barangay: ''
    });
  }

  function handleBarangayChange(e) {
    const psgcCode = e.target.value;
    const found = barangays.find((b) => b.psgcCode === psgcCode);
    onChange({
      ...value,
      barangayCode: psgcCode || '',
      barangay: found?.name || ''
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        {labels && (
          <label className="block text-xs font-semibold text-slate-700 mb-1">Province</label>
        )}
        <select value={value.provinceCode || ''} onChange={handleProvinceChange} className={inputClasses}>
          <option value="">Select province…</option>
          {provinces.map((p) => (
            <option key={p.psgcCode} value={p.psgcCode}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        {labels && (
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Municipality / City
          </label>
        )}
        <select
          value={value.municipalityCode || ''}
          onChange={handleMunicipalityChange}
          disabled={!value.provinceCode}
          className={`${inputClasses} disabled:bg-slate-100 disabled:text-slate-400`}
        >
          <option value="">
            {value.provinceCode ? 'Select municipality/city…' : 'Select province first'}
          </option>
          {municipalities.map((m) => (
            <option key={m.psgcCode} value={m.psgcCode}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        {labels && (
          <label className="block text-xs font-semibold text-slate-700 mb-1">Barangay</label>
        )}
        <select
          value={value.barangayCode || ''}
          onChange={handleBarangayChange}
          disabled={!value.municipalityCode}
          className={`${inputClasses} disabled:bg-slate-100 disabled:text-slate-400`}
        >
          <option value="">
            {value.municipalityCode ? 'Select barangay…' : 'Select municipality/city first'}
          </option>
          {barangays.map((b) => (
            <option key={b.psgcCode} value={b.psgcCode}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default PhAddressSelect;
