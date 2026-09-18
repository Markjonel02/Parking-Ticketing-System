// client/src/utils/phAddress.js
//
// Thin wrapper around @aivangogh/ph-address (official PSGC dataset) for the
// Province -> Municipality/City -> Barangay cascading selects used on the
// vehicle registration and citation ("issue citation") forms. Replaces the
// old US_STATES list now that the app is scoped to Philippine jurisdictions.
import {
  getAllProvinces,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality
} from '@aivangogh/ph-address';

/** All provinces (and NCR/HUC-style top-level entries), sorted alphabetically. */
export function listProvinces() {
  return getAllProvinces();
}

/** Municipalities/cities that belong to the given province PSGC code. */
export function listMunicipalities(provinceCode) {
  if (!provinceCode) return [];
  return getMunicipalitiesByProvince(provinceCode);
}

/** Barangays that belong to the given municipality/city PSGC code. */
export function listBarangays(municipalityCode) {
  if (!municipalityCode) return [];
  return getBarangaysByMunicipality(municipalityCode);
}
