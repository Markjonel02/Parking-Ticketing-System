// server/src/models/User.js
import { db } from '../config/database.js';

export class UserModel {
  static findAll(filter = {}) {
    return db.find('users', (u) => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.status && u.status !== filter.status) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.badgeNumber && u.badgeNumber.toLowerCase().includes(q));
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('users', id);
  }

  static findByEmail(email) {
    return db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  }

  static create(userData) {
    return db.insert('users', {
      ...userData,
      status: userData.status || 'ACTIVE'
    });
  }

  static update(id, updates) {
    return db.update('users', id, updates);
  }

  static delete(id) {
    return db.delete('users', id);
  }
}
