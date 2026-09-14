# Database Schema & Data Models

### Entity Relationship Model

1. **User**: `id`, `name`, `email`, `role` (ADMIN, SUPERVISOR, OFFICER, CASHIER, CITIZEN), `badgeNumber`, `phone`, `department`, `status`, `avatar`, `createdAt`.
2. **Vehicle**: `id`, `plateNumber`, `state`, `make`, `model`, `year`, `color`, `vin`, `ownerName`, `ownerEmail`, `ownerPhone`, `registeredCity`.
3. **Ticket**: `id`, `ticketNumber`, `plateNumber`, `state`, `vehicleId`, `violationId`, `violationCode`, `violationTitle`, `zoneId`, `zoneName`, `locationDescription`, `officerId`, `officerName`, `officerBadge`, `fineAmount`, `lateFee`, `totalDue`, `status` (ISSUED, PAID, OVERDUE, DISPUTED, VOID, CANCELLED), `issuedAt`, `dueDate`, `paidAt`, `paymentId`, `notes`, `evidencePhotos`.
4. **Violation**: `id`, `code`, `name`, `description`, `baseFine`, `lateFee`, `severity` (LOW, MEDIUM, HIGH, CRITICAL), `gracePeriodDays`, `points`, `isActive`.
5. **Payment**: `id`, `referenceNumber`, `ticketId`, `ticketNumber`, `plateNumber`, `amount`, `paymentMethod`, `cardBrand`, `lastFour`, `status`, `paidBy`, `cashierId`, `cashierName`, `receiptUrl`, `transactionDate`.
6. **ParkingZone**: `id`, `code`, `name`, `city`, `hourlyRate`, `maxDurationHours`, `totalSpots`, `occupiedSpots`, `enforcementHours`, `multiplier`, `isActive`.
7. **AuditLog**: `id`, `timestamp`, `userId`, `userName`, `userRole`, `action`, `entityType`, `entityId`, `ipAddress`, `details`.
