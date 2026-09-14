# ParkGuard API Specifications

### Authentication
- `POST /api/auth/login`: Authenticate staff with email and password
- `POST /api/auth/forgot-password`: Password reset request
- `GET /api/auth/me`: Retrieve active session and roles
- `POST /api/auth/logout`: Invalidate token

### Tickets & Citations
- `GET /api/tickets`: Query citations with query filters (`status`, `search`, `zoneId`, `plateNumber`, `page`, `limit`)
- `GET /api/tickets/:id`: Retrieve citation details by ID or ticket number (`PKG-YYYY-XXXXX`)
- `POST /api/tickets`: Issue new parking ticket with evidence photo URLs and zone multipliers
- `POST /api/tickets/:id/dispute`: Submit citizen adjudication dispute rationale
- `POST /api/tickets/:id/resolve-dispute`: Supervisor adjudication decision (`UPHELD_VOID`, `REDUCED_FINE`, `REJECTED`)
- `POST /api/tickets/:id/void`: Administratively dismiss or void citation

### Vehicles
- `GET /api/vehicles`: Search vehicle registry with ticket counts & immobilization boot flags
- `GET /api/vehicles/:plate`: Retrieve history, open citations, and owner details for a plate
- `POST /api/vehicles`: Register new vehicle

### Payments & Receipts
- `GET /api/payments`: Query payment transactions
- `GET /api/payments/:id`: Get payment details
- `GET /api/payments/:id/receipt`: Generate structured receipt data
- `POST /api/payments`: Settle citation and mark ticket `PAID`

### Analytics & Reports
- `GET /api/reports/dashboard`: Executive KPI stats, daily revenue, violation counts, zone occupancy
- `GET /api/reports/tickets`: Ticket summary and breakdown
- `GET /api/reports/payments`: Financial collection summary
- `GET /api/reports/revenue`: Revenue projections and zone performance

### System & Staff
- `GET /api/users`: Staff member roster
- `POST /api/users`: Provision staff member
- `PATCH /api/users/:id/toggle-status`: Suspend or activate staff
- `GET /api/parking/zones`: Parking zones and rate multipliers
- `GET /api/audit-logs`: Municipal audit trail logs
