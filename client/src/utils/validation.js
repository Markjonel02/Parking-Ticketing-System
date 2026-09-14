// client/src/utils/validation.js
export function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidPlate(plate) {
  if (!plate) return false;
  const clean = plate.trim();
  return clean.length >= 2 && clean.length <= 10;
}

export function isValidPhone(phone) {
  if (!phone) return true; // optional
  return /^[\d\+\-\(\)\s]{7,20}$/.test(phone);
}
