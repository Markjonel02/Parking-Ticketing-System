// server/src/validators/authValidator.js
export function validateLogin(data) {
  const errors = {};
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Please provide a valid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
