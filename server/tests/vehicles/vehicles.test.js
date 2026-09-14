// server/tests/vehicles/vehicles.test.js
import { VehicleModel } from '../../src/models/Vehicle.js';
import { validateVehicle } from '../../src/validators/vehicleValidator.js';

export function testVehicleLogic() {
  const invalid = validateVehicle({ make: 'Honda' });
  console.assert(!invalid.isValid, 'Missing plate should fail validation');

  const veh = VehicleModel.findByPlate('7XYZ890');
  console.assert(veh !== null, 'Seeded vehicle 7XYZ890 should be found');
  console.assert(veh.make === 'Tesla', 'Vehicle make should be Tesla');
}

testVehicleLogic();
console.log('✅ Vehicle tests passed successfully');
