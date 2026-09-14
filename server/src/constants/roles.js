// server/src/constants/roles.js
export const ROLES = {
  ADMIN: 'ADMIN',
  OFFICER: 'OFFICER',
  SUPERVISOR: 'SUPERVISOR',
  CASHIER: 'CASHIER',
  CITIZEN: 'CITIZEN'
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['all'],
  SUPERVISOR: ['tickets:read', 'tickets:write', 'tickets:void', 'tickets:dispute', 'payments:read', 'reports:read', 'users:read', 'violations:read', 'violations:write'],
  OFFICER: ['tickets:read', 'tickets:create', 'vehicles:read', 'violations:read', 'reports:personal'],
  CASHIER: ['tickets:read', 'payments:read', 'payments:create', 'receipts:read'],
  CITIZEN: ['tickets:public_search', 'payments:pay_citation', 'tickets:dispute_request']
};
