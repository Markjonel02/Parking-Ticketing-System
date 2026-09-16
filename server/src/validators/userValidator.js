// server/src/validators/userValidator.js
import { ROLES } from '../constants/roles.js';

export function validateUser(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full staff name is required';
  }

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Valid institutional email is required';
  }

  if (!data.role || !Object.values(ROLES).includes(data.role)) {
    errors.role = 'Valid authorization role must be specified';
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'A temporary password of at least 8 characters is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
