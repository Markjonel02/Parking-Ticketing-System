// server/src/utils/calculateFine.js
/**
 * Calculates fine based on violation base rate, zone multiplier, and overdue days.
 */
export function calculateFine({
  baseFine = 50,
  zoneMultiplier = 1.0,
  isOverdue = false,
  lateFee = 25,
  points = 0
}) {
  const adjustedBase = Math.round(baseFine * (zoneMultiplier || 1.0) * 100) / 100;
  const applicableLateFee = isOverdue ? lateFee : 0;
  const total = adjustedBase + applicableLateFee;

  return {
    baseFine: adjustedBase,
    lateFee: applicableLateFee,
    totalDue: total,
    points
  };
}
