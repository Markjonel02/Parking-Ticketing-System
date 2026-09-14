// server/src/validators/paymentValidator.js
export function validatePayment(data) {
  const errors = {};

  if (!data.ticketId && !data.ticketNumber) {
    errors.ticket = 'Ticket reference is required';
  }

  if (data.amount === undefined || data.amount === null || Number(data.amount) <= 0) {
    errors.amount = 'Valid positive payment amount is required';
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Payment tender method is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
