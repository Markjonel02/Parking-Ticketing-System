// database/seeders/parkingZoneSeeder.js
export const seedParkingZones = [
  {
    id: 'zone-01',
    code: 'DWTN-A',
    name: 'Downtown Core Financial District',
    city: 'Metropolis',
    hourlyRate: 4.50,
    maxDurationHours: 2,
    totalSpots: 450,
    occupiedSpots: 382,
    enforcementHours: '08:00 - 20:00',
    multiplier: 1.25,
    isActive: true
  },
  {
    id: 'zone-02',
    code: 'COMM-B',
    name: 'Waterfront Commercial Wharf',
    city: 'Metropolis',
    hourlyRate: 3.50,
    maxDurationHours: 4,
    totalSpots: 320,
    occupiedSpots: 215,
    enforcementHours: '08:00 - 22:00',
    multiplier: 1.0,
    isActive: true
  },
  {
    id: 'zone-03',
    code: 'MED-C',
    name: 'General Medical Center Campus',
    city: 'Metropolis',
    hourlyRate: 2.50,
    maxDurationHours: 8,
    totalSpots: 600,
    occupiedSpots: 512,
    enforcementHours: '24/7',
    multiplier: 1.1,
    isActive: true
  },
  {
    id: 'zone-04',
    code: 'UNIV-D',
    name: 'University Campus Perimeter',
    city: 'Metropolis',
    hourlyRate: 2.00,
    maxDurationHours: 3,
    totalSpots: 280,
    occupiedSpots: 240,
    enforcementHours: '07:00 - 19:00',
    multiplier: 1.0,
    isActive: true
  },
  {
    id: 'zone-05',
    code: 'RES-E',
    name: 'Historic Hill Residential District',
    city: 'Metropolis',
    hourlyRate: 2.00,
    maxDurationHours: 2,
    totalSpots: 350,
    occupiedSpots: 180,
    enforcementHours: '09:00 - 18:00',
    multiplier: 0.9,
    isActive: true
  }
];
