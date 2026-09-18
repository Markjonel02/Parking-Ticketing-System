// server/src/validators/vehicleValidator.js
export function validateVehicle(data) {
  const errors = {};

  if (!data.plateNumber || !data.plateNumber.trim()) {
    errors.plateNumber = 'License plate number is required';
  }

  if (!data.province || !data.province.trim()) {
    errors.province = 'Province is required';
  }

  if (!data.make || !data.make.trim()) {
    errors.make = 'Vehicle manufacturer/make is required';
  }

  if (!data.model || !data.model.trim()) {
    errors.model = 'Vehicle model is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
