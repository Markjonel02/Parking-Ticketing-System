// server/src/controllers/violationController.js
import { ViolationService } from '../services/violationService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ViolationController {
  static getViolations = asyncHandler(async (req, res) => {
    const { severity, activeOnly, search } = req.query;
    const violations = await ViolationService.getAllViolations({
      severity,
      activeOnly: activeOnly === 'true',
      search,
    });
    return res.json({ success: true, data: violations });
  });

  static getViolationById = asyncHandler(async (req, res) => {
    const violation = await ViolationService.resolveViolation(req.params.id);
    if (!violation) throw ApiError.notFound('Violation code not found.');
    return res.json({ success: true, data: violation });
  });

  static createViolation = asyncHandler(async (req, res) => {
    const created = await ViolationService.createViolation(req.body);
    return res.status(201).json({
      success: true,
      message: 'Violation code registered in municipal fee schedule.',
      data: created,
    });
  });

  static updateViolation = asyncHandler(async (req, res) => {
    const updated = await ViolationService.updateViolation(req.params.id, req.body);
    return res.json({ success: true, message: 'Violation schedule updated.', data: updated });
  });
}

export default ViolationController;
