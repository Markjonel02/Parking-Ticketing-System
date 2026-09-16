// client/src/utils/formatCurrency.js
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
