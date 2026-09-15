// server/src/models/Ticket.js
import { db, Ticket } from '../config/database.js';

export { Ticket };

export class TicketModel {
  static findAll(filter = {}) {
    return db.find('tickets', (t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.zoneId && t.zoneId !== filter.zoneId) return false;
      if (filter.officerId && t.officerId !== filter.officerId) return false;
      if (filter.plateNumber && t.plateNumber.toUpperCase() !== filter.plateNumber.toUpperCase()) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          t.ticketNumber.toLowerCase().includes(q) ||
          t.plateNumber.toLowerCase().includes(q) ||
          t.violationTitle.toLowerCase().includes(q) ||
          (t.zoneName && t.zoneName.toLowerCase().includes(q)) ||
          (t.locationDescription && t.locationDescription.toLowerCase().includes(q)) ||
          (t.officerName && t.officerName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('tickets', id);
  }

  static findByNumber(ticketNumber) {
    return db.findOne('tickets', t => t.ticketNumber.toUpperCase() === ticketNumber.trim().toUpperCase());
  }

  static findByPlate(plateNumber) {
    const cleanPlate = plateNumber.trim().toUpperCase();
    return db.find('tickets', t => t.plateNumber.toUpperCase() === cleanPlate);
  }

  static create(ticketData) {
    return db.insert('tickets', {
      ...ticketData,
      status: ticketData.status || 'ISSUED',
      issuedAt: ticketData.issuedAt || new Date().toISOString()
    });
  }

  static update(id, updates) {
    return db.update('tickets', id, updates);
  }

  static delete(id) {
    return db.delete('tickets', id);
  }
}
