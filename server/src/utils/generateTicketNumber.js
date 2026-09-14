// server/src/utils/generateTicketNumber.js
export function generateTicketNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `PKG-${year}-${randomSuffix}`;
}
