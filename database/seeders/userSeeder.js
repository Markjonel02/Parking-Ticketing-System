// database/seeders/userSeeder.js
//
// Seed accounts for a fresh deployment. Passwords are real plaintext here
// ONLY because they pass through User.create(), whose pre-save hook hashes
// them with bcrypt before anything touches the database — nothing is ever
// persisted or transmitted unhashed. These are bootstrap credentials:
// change them immediately after first login in a real deployment.
export const DEFAULT_SEED_PASSWORD = 'ChangeMe123!';

export const seedUsers = [
  {
    name: 'Marcus Vance',
    email: 'admin@parkguard.gov',
    password: DEFAULT_SEED_PASSWORD,
    role: 'ADMIN',
    badgeNumber: 'AD-9001',
    phone: '+1 (555) 234-5678',
    department: 'Metropolitan Parking Authority',
    status: 'ACTIVE',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@parkguard.gov',
    password: DEFAULT_SEED_PASSWORD,
    role: 'OFFICER',
    badgeNumber: 'EO-4421',
    phone: '+1 (555) 876-5432',
    department: 'Downtown Enforcement Patrol',
    status: 'ACTIVE',
  },
  {
    name: 'David Chen',
    email: 'david.chen@parkguard.gov',
    password: DEFAULT_SEED_PASSWORD,
    role: 'OFFICER',
    badgeNumber: 'EO-4422',
    phone: '+1 (555) 345-9876',
    department: 'Harbor & Commercial District',
    status: 'ACTIVE',
  },
  {
    name: 'Sarah Sterling',
    email: 'sarah.sterling@parkguard.gov',
    password: DEFAULT_SEED_PASSWORD,
    role: 'SUPERVISOR',
    badgeNumber: 'SV-1020',
    phone: '+1 (555) 678-1234',
    department: 'Citations & Adjudication Board',
    status: 'ACTIVE',
  },
  {
    name: 'Julian Perez',
    email: 'julian.perez@parkguard.gov',
    password: DEFAULT_SEED_PASSWORD,
    role: 'CASHIER',
    badgeNumber: 'CS-8890',
    phone: '+1 (555) 901-2345',
    department: 'Treasury & Counter Services',
    status: 'ACTIVE',
  },
];
