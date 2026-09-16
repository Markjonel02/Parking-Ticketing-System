// server/src/services/violationService.js
import { Violation } from '../models/Violation.js';
import { ApiError } from '../utils/ApiError.js';

function buildFilter({ severity, activeOnly, search }) {
  const filter = {};
  if (severity) filter.severity = severity;
  if (activeOnly) filter.isActive = true;
  if (search) filter.$text = { $search: search };
  return filter;
}

export class ViolationService {
  static async getAllViolations(query = {}) {
    return Violation.find(buildFilter(query)).sort({ name: 1 });
  }

  static async getViolationById(id) {
    if (!id) return null;
    return Violation.findById(id).catch(() => null);
  }

  static async getViolationByCode(code) {
    if (!code) return null;
    return Violation.findOne({ code: code.trim().toUpperCase() });
  }

  static async resolveViolation(idOrCode) {
    const byId = await this.getViolationById(idOrCode);
    if (byId) return byId;
    return this.getViolationByCode(idOrCode);
  }

  static async createViolation(data) {
    const existing = await Violation.findOne({ code: data.code?.trim().toUpperCase() });
    if (existing) {
      throw ApiError.conflict(`Violation code ${data.code} already exists.`);
    }
    return Violation.create(data);
  }

  static async updateViolation(id, updates) {
    const violation = await Violation.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!violation) throw ApiError.notFound('Violation record not found.');
    return violation;
  }
}

export default ViolationService;
