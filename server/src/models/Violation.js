// server/src/models/Violation.js
import { db } from '../config/database.js';

export class ViolationModel {
  static findAll(filter = {}) {
    return db.find('violations', (v) => {
      if (filter.severity && v.severity !== filter.severity) return false;
      if (filter.activeOnly && !v.isActive) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q));
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('violations', id);
  }

  static findByCode(code) {
    return db.findOne('violations', v => v.code === code);
  }

  static create(violationData) {
    return db.insert('violations', {
      ...violationData,
      isActive: violationData.isActive !== undefined ? violationData.isActive : true
    });
  }

  static update(id, updates) {
    return db.update('violations', id, updates);
  }
}
