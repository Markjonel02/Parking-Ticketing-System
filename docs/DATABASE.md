# Database Architecture: MongoDB & Mongoose ODM

ParkGuard uses **MongoDB** as its primary document database, structured and validated using **Mongoose ODM**.

---

### MongoDB Connection Configuration

The application connects to MongoDB using the standard `MONGODB_URI` or `DATABASE_URL` environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/parkguard
# Or MongoDB Atlas cluster:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/parkguard?retryWrites=true&w=majority
```

---

### Mongoose Schemas & Collections

Defined in `/server/src/models/schemas.js`:

1. **`users` (`User`)**:
   - `id`: Unique String identifier
   - `name`: Full staff or admin name
   - `email`: Normalized unique email address
   - `role`: Staff role (`ADMIN`, `SUPERVISOR`, `OFFICER`, `CASHIER`)
   - `badgeNumber`: Municipal enforcement badge ID
   - `department`: Division/department name
   - `status`: Account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`)

2. **`vehicles` (`Vehicle`)**:
   - `id`: Unique vehicle ID
   - `plateNumber`: Registered license plate (indexed)
   - `state`: State or jurisdiction code (e.g., `CA`, `NY`)
   - `make`, `model`, `year`, `color`: Vehicle attributes
   - `vin`: Vehicle Identification Number
   - `ownerName`, `ownerEmail`, `ownerPhone`: Registrant contact details

3. **`tickets` (`Ticket`)**:
   - `id`: Internal citation ID
   - `ticketNumber`: Official municipal citation number (e.g., `PKG-2026-00101`)
   - `plateNumber`: Vehicle plate reference
   - `violationCode`, `violationTitle`, `violationSeverity`: Citation classification
   - `baseFine`, `lateFee`, `totalDue`, `amountPaid`: Financial figures
   - `zoneId`, `zoneName`, `locationDescription`: Location details
   - `officerId`, `officerName`, `officerBadge`: Issuing officer
   - `status`: `ISSUED`, `PAID`, `DISPUTED`, `DISMISSED`, `VOID`, `OVERDUE`
   - `disputeReason`, `disputeDecision`: Adjudication flow fields
   - `evidencePhotos`: Photographic evidence array

4. **`violations` (`Violation`)**:
   - `code`: Municipal ordinance code (e.g., `EXP_MTR_01`, `FHD_04`)
   - `name`, `description`: Description and ordinance text
   - `baseFine`, `lateFee`: Baseline penalty structure
   - `gracePeriodDays`: Appeal/payment grace window
   - `severity`: Severity classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)

5. **`payments` (`Payment`)**:
   - `referenceNumber`: Transaction confirmation reference (e.g., `PAY-REF-992014`)
   - `ticketId`, `ticketNumber`, `plateNumber`: Citation linkage
   - `amount`: Collected payment total
   - `paymentMethod`: `CREDIT_CARD`, `DEBIT_CARD`, `CASH`, `ONLINE_PORTAL`, `CHECK`
   - `paidBy`, `payerEmail`: Payer contact information
   - `status`: `COMPLETED`, `PENDING`, `FAILED`, `REFUNDED`

6. **`parkingZones` (`ParkingZone`)**:
   - `code`, `name`: Zone code and area name
   - `hourlyRate`, `multiplier`: Pricing multipliers
   - `totalSpots`, `occupiedSpots`: Capacity analytics
   - `enforcementHours`: Active enforcement hours

7. **`auditLogs` (`AuditLog`)**:
   - Immutable audit trail recording user logins, ticket issuances, adjudication disputes, and payment settlements.

---

### Resilience & Offline Readiness

- The MongoDB integration is resilient: If `MONGODB_URI` points to a local or Atlas cluster, Mongoose establishes live persistent collections and auto-seeds initial data on first connection.
- If a remote database is temporarily unreachable during local dev/preview mode, the schema engine uses a synchronized live cache to ensure zero startup crash or preview freeze.
