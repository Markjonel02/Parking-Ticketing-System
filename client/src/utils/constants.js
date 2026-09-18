// client/src/utils/constants.js
export const APP_NAME = "ParkGuard";
export const APP_VERSION = "2.4.0";

export const TICKET_STATUS = {
  ISSUED: "ISSUED",
  PAID: "PAID",
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
  VOID: "VOID",
};

export const TICKET_STATUS_COLORS = {
  ISSUED: "blue",
  PAID: "teal",
  PENDING: "yellow",
  OVERDUE: "red",
  DISPUTED: "red",
  CANCELLED: "red",
  VOID: "red",
};

export const PAYMENT_METHODS = [
  { id: "CREDIT_CARD", label: "Credit Card (Online / POS)" },
  { id: "DEBIT_CARD", label: "Debit Card (PIN Secured)" },
  { id: "CASH", label: "Cash (Municipal Counter Service)" },
  { id: "ONLINE_PORTAL", label: "Citizen Online Web Portal" },
  { id: "BANK_TRANSFER", label: "Municipal Electronic Wire (ACH)" },
];
