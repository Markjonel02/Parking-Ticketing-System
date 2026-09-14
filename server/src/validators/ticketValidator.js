// server/src/validators/ticketValidator.js
export function validateCreateTicket(data) {
  const errors = {};

  if (!data.plateNumber || !data.plateNumber.trim()) {
    errors.plateNumber = 'License plate number is required';
  } else if (data.plateNumber.trim().length < 2 || data.plateNumber.trim().length > 10) {
    errors.plateNumber = 'Plate must be between 2 and 10 characters';
  }

  if (!data.state || !data.state.trim()) {
    errors.state = 'Vehicle registration state/province is required';
  }

  if (!data.violationId && !data.violationCode) {
    errors.violationId = 'A violation infraction code must be selected';
  }

  if (!data.zoneId) {
    errors.zoneId = 'Parking zone must be specified';
  }

  if (!data.locationDescription || !data.locationDescription.trim()) {
    errors.locationDescription = 'Specific street address or stall location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDisputeTicket(data) {
  const errors = {};
  if (!data.disputeReason || data.disputeReason.trim().length < 10) {
    errors.disputeReason = 'Dispute rationale must be at least 10 characters in length';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
