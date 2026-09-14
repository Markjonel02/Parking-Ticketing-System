// database/seeders/userSeeder.js
export const seedUsers = [
  {
    id: 'usr-admin-01',
    name: 'Marcus Vance',
    email: 'admin@parkguard.gov',
    role: 'ADMIN',
    badgeNumber: 'AD-9001',
    phone: '+1 (555) 234-5678',
    department: 'Metropolitan Parking Authority',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'usr-officer-01',
    name: 'Elena Rostova',
    email: 'elena.rostova@parkguard.gov',
    role: 'OFFICER',
    badgeNumber: 'EO-4421',
    phone: '+1 (555) 876-5432',
    department: 'Downtown Enforcement Patrol',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T09:30:00.000Z'
  },
  {
    id: 'usr-officer-02',
    name: 'David Chen',
    email: 'david.chen@parkguard.gov',
    role: 'OFFICER',
    badgeNumber: 'EO-4422',
    phone: '+1 (555) 345-9876',
    department: 'Harbor & Commercial District',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15T11:00:00.000Z'
  },
  {
    id: 'usr-supervisor-01',
    name: 'Sarah Sterling',
    email: 'sarah.sterling@parkguard.gov',
    role: 'SUPERVISOR',
    badgeNumber: 'SV-1020',
    phone: '+1 (555) 678-1234',
    department: 'Citations & Adjudication Board',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'usr-cashier-01',
    name: 'Julian Perez',
    email: 'julian.perez@parkguard.gov',
    role: 'CASHIER',
    badgeNumber: 'CS-8890',
    phone: '+1 (555) 901-2345',
    department: 'Treasury & Counter Services',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T14:20:00.000Z'
  }
];
