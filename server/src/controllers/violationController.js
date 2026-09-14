// server/src/controllers/violationController.js
import { ViolationService } from '../services/violationService.js';

export class ViolationController {
  static async getViolations(req, res, next) {
    try {
      const { severity, activeOnly, search } = req.query;
      const violations = ViolationService.getAllViolations({
        severity,
        activeOnly: activeOnly === 'true',
        search
      });
      return res.json({ success: true, data: violations });
    } catch (err) {
      next(err);
    }
  }

  static async getViolationById(req, res, next) {
    try {
      const violation = ViolationService.getViolationById(req.params.id) || ViolationService.getViolationByCode(req.params.id);
      if (!violation) {
        return res.status(404).json({ success: false, message: 'Violation code not found' });
      }
      return res.json({ success: true, data: violation });
    } catch (err) {
      next(err);
    }
  }

  static async createViolation(req, res, next) {
    try {
      const created = ViolationService.createViolation(req.body);
      return res.status(201).json({
        success: true,
        message: 'Violation code registered in municipal fee schedule',
        data: created
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateViolation(req, res, next) {
    try {
      const updated = ViolationService.updateViolation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Violation record not found' });
      }
      return res.json({ success: true, message: 'Violation schedule updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
