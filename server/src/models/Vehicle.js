// server/src/models/Vehicle.js
import { db, Vehicle } from '../config/database.js';

export { Vehicle };

export class VehicleModel {
  static findAll(filter = {}) {
    return db.find('vehicles', (v) => {
      if (filter.state && v.state.toLowerCase() !== filter.state.toLowerCase()) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          v.plateNumber.toLowerCase().includes(q) ||
          (v.vin && v.vin.toLowerCase().includes(q)) ||
          (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
          (v.make && v.make.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('vehicles', id);
  }

  static findByPlate(plateNumber, state = null) {
    const cleanPlate = plateNumber.trim().toUpperCase();
    return db.findOne('vehicles', v => {
      const matchPlate = v.plateNumber.toUpperCase() === cleanPlate;
      if (state) {
        return matchPlate && v.state.toUpperCase() === state.trim().toUpperCase();
      }
      return matchPlate;
    });
  }

  static create(vehicleData) {
    return db.insert('vehicles', {
      ...vehicleData,
      plateNumber: vehicleData.plateNumber.trim().toUpperCase(),
      state: (vehicleData.state || 'CA').trim().toUpperCase()
    });
  }

  static update(id, updates) {
    return db.update('vehicles', id, updates);
  }
}
