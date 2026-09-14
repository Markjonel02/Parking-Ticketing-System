// client/src/utils/permissions.js
export const ROLE_HIERARCHY = {
  ADMIN: 5,
  SUPERVISOR: 4,
  OFFICER: 3,
  CASHIER: 2,
  CITIZEN: 1
};

export function hasRole(user, allowedRoles = []) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return allowedRoles.includes(user.role);
}

export function canIssueTicket(user) {
  return hasRole(user, ['ADMIN', 'OFFICER', 'SUPERVISOR']);
}

export function canVoidTicket(user) {
  return hasRole(user, ['ADMIN', 'SUPERVISOR']);
}

export function canAcceptPayment(user) {
  return hasRole(user, ['ADMIN', 'CASHIER', 'SUPERVISOR', 'CITIZEN']);
}

export function canManageUsers(user) {
  return hasRole(user, ['ADMIN']);
}
