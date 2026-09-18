// server/src/utils/badgeNumber.js
//
// Auto-assigns badge/shield IDs by role: ADMIN -> AD-0001, OFFICER (field
// enforcement) -> EO-0001, SUPERVISOR -> SV-0001, CASHIER -> CS-0001, and
// CITIZEN -> CI-0001. Numbering is sequential per role, in creation order,
// and zero-padded to 4 digits. Any badge number supplied by the client is
// ignored on create — the server is always the source of truth so the
// scheme can never be bypassed or collide.
import { User } from '../models/User.js';
import { BADGE_PREFIXES } from '../constants/roles.js';

const PAD_WIDTH = 4;

/**
 * Returns the next badge number for the given role, e.g. "EO-0007".
 * Looks at the highest existing sequence number already issued under that
 * role's prefix (regardless of who currently holds it) and increments it,
 * so numbers are never reused even if a user is later renamed/removed.
 */
export async function generateBadgeNumber(role) {
  const prefix = BADGE_PREFIXES[role];
  if (!prefix) return undefined;

  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  const existing = await User.find({ badgeNumber: pattern }).select('badgeNumber').lean();

  let highest = 0;
  for (const { badgeNumber } of existing) {
    const match = badgeNumber?.match(pattern);
    if (!match) continue;
    const seq = parseInt(match[1], 10);
    if (seq > highest) highest = seq;
  }

  const next = highest + 1;
  return `${prefix}-${String(next).padStart(PAD_WIDTH, '0')}`;
}

export default generateBadgeNumber;
