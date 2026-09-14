// server/src/services/violationService.js
import { ViolationModel } from '../models/Violation.js';

export class ViolationService {
  static getAllViolations(filter = {}) {
    return ViolationModel.findAll(filter);
  }

  static getViolationById(id) {
    return ViolationModel.findById(id);
  }

  static getViolationByCode(code) {
    return ViolationModel.findByCode(code);
  }

  static createViolation(data) {
    return ViolationModel.create(data);
  }

  static updateViolation(id, updates) {
    return ViolationModel.update(id, updates);
  }
}
