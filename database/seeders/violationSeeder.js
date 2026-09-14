// database/seeders/violationSeeder.js
export const seedViolations = [
  {
    id: 'vio-01',
    code: 'EXP_MTR_01',
    name: 'Expired Parking Meter',
    description: 'Vehicle parked at an on-street meter past paid duration limit.',
    baseFine: 45.00,
    lateFee: 25.00,
    severity: 'LOW',
    gracePeriodDays: 14,
    points: 0,
    isActive: true
  },
  {
    id: 'vio-02',
    code: 'NPZ_02',
    name: 'No Parking / Tow-Away Zone',
    description: 'Vehicle stopped or parked in clearly designated prohibited municipal zone.',
    baseFine: 85.00,
    lateFee: 40.00,
    severity: 'MEDIUM',
    gracePeriodDays: 14,
    points: 1,
    isActive: true
  },
  {
    id: 'vio-03',
    code: 'HND_03',
    name: 'Unauthorized Accessible Stall',
    description: 'Parking in disability-designated stall without valid state placard or permit.',
    baseFine: 320.00,
    lateFee: 90.00,
    severity: 'CRITICAL',
    gracePeriodDays: 10,
    points: 2,
    isActive: true
  },
  {
    id: 'vio-04',
    code: 'FHD_04',
    name: 'Fire Hydrant Clearance Violation',
    description: 'Stationary vehicle within 15 feet of operational emergency fire hydrant.',
    baseFine: 180.00,
    lateFee: 60.00,
    severity: 'HIGH',
    gracePeriodDays: 10,
    points: 2,
    isActive: true
  },
  {
    id: 'vio-05',
    code: 'DBL_05',
    name: 'Double Parking',
    description: 'Parking parallel to another parked vehicle in an active traffic transit lane.',
    baseFine: 110.00,
    lateFee: 50.00,
    severity: 'HIGH',
    gracePeriodDays: 14,
    points: 1,
    isActive: true
  },
  {
    id: 'vio-06',
    code: 'BLK_DW_06',
    name: 'Driveway / Ramp Obstruction',
    description: 'Blocking active residential or commercial vehicular ingress/egress ramp.',
    baseFine: 95.00,
    lateFee: 45.00,
    severity: 'MEDIUM',
    gracePeriodDays: 14,
    points: 1,
    isActive: true
  },
  {
    id: 'vio-07',
    code: 'ST_SWP_07',
    name: 'Scheduled Street Sweeping',
    description: 'Vehicle parked during designated municipal sanitation hours.',
    baseFine: 60.00,
    lateFee: 30.00,
    severity: 'LOW',
    gracePeriodDays: 14,
    points: 0,
    isActive: true
  },
  {
    id: 'vio-08',
    code: 'BUS_LN_09',
    name: 'Dedicated Transit / Bus Lane',
    description: 'Unauthorized stopping or idling in marked rapid transit corridor.',
    baseFine: 150.00,
    lateFee: 55.00,
    severity: 'HIGH',
    gracePeriodDays: 14,
    points: 1,
    isActive: true
  }
];
