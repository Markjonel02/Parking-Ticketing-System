# Real MongoDB Backend — Setup Guide

This project's backend now runs on a real MongoDB database via Mongoose,
with real JWT + bcrypt authentication. The previous in-memory "simulated
database" and fake login have been removed entirely.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` — point this at a local MongoDB instance or a MongoDB
  Atlas connection string.
- `JWT_SECRET` — generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

## 3. Seed initial accounts and reference data

```bash
node database/seeders/seed.js
```

This creates:
- Five staff accounts (Admin, 2× Officer, Supervisor, Cashier) with the
  password `ChangeMe123!` (hashed with bcrypt before being stored — never
  saved in plaintext). **Change these passwords immediately in a real
  deployment.**
- The violation fee schedule and parking zone reference data.

It does **not** create any tickets, payments, or vehicles — that data
comes from actually using the system, not from a canned demo dataset.

## 4. Run the app

```bash
npm run dev
```

This starts the combined Express + Vite dev server on
`http://localhost:3000`. Log in with any of the seeded accounts.

## What changed from the original scaffold

- **Removed**: the in-memory `db` object pretending to be MongoDB, fake
  JWT-shaped tokens with no real verification, unauthenticated password
  checks, a hardcoded fake revenue chart, a fabricated "monthly
  projection" statistic, and the frontend's demo-role-switcher /
  auto-login-as-admin fallback.
- **Added**: real Mongoose schemas for every entity (`User`, `Vehicle`,
  `Ticket`, `Violation`, `Payment`, `ParkingZone`, `AuditLog`) with
  proper relations, indexes, and validation; bcrypt password hashing;
  real JWT issuance/verification with account lockout after repeated
  failed logins; a global error handler that translates Mongoose
  errors cleanly; real aggregation-based reporting instead of static
  numbers.
- **Notification delivery** (email/SMS receipts) is not wired to a
  provider in this deployment. Rather than faking delivery, those calls
  log what *would* be sent and return `delivered: false` — plug in a
  real provider (SendGrid, Twilio, etc.) in
  `server/src/services/notificationService.js` when ready.
