// server/src/utils/generateReferenceNumber.js
export function generateReferenceNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PAY-REF-${timestamp}${randomSuffix}`;
}
