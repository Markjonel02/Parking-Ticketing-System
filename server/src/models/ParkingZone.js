// server/src/models/ParkingZone.js
import { db, ParkingZone } from '../config/database.js';

export { ParkingZone };

export class ParkingZoneModel {
  static findAll(filter = {}) {
    return db.find('parkingZones', (z) => {
      if (filter.activeOnly && !z.isActive) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return z.name.toLowerCase().includes(q) || z.code.toLowerCase().includes(q) || (z.city && z.city.toLowerCase().includes(q));
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('parkingZones', id);
  }

  static findByCode(code) {
    return db.findOne('parkingZones', z => z.code.toUpperCase() === code.trim().toUpperCase());
  }

  static create(zoneData) {
    return db.insert('parkingZones', {
      ...zoneData,
      isActive: zoneData.isActive !== undefined ? zoneData.isActive : true
    });
  }

  static update(id, updates) {
    return db.update('parkingZones', id, updates);
  }
}
