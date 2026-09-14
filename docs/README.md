# ParkGuard - Enterprise Parking Ticketing & Enforcement System

ParkGuard is a comprehensive municipal parking citation, enforcement patrol, vehicle tracking, payments collection, and adjudication platform.

## Architecture Highlights
- **Frontend (`/client`)**: React 19, TypeScript, Chakra UI design language tokens, Vite, Tailwind CSS, Lucide icons, Recharts, Motion animations.
- **Backend (`/server`)**: Node.js, Express, RESTful APIs, JWT session tokens, Role-based Access Control (RBAC), validation layers, audit trails, and automated overdue citation penalty batch jobs.
- **Data & Seeders (`/database`)**: Standardized violation schedules, municipal parking zones with rate multipliers, staff rosters, vehicle registries, and citation histories.

## Roles Supported
1. **ADMIN**: Full authority over citations, system configuration, user provisioning, municipal fee schedules, and audit trail analysis.
2. **SUPERVISOR**: Adjudication management, dispute reviews, citation dismissals/voids, and operational reporting.
3. **OFFICER**: Field citation issuance, license plate verification, violation logging, and evidence capture.
4. **CASHIER**: In-person counter payment settlement, digital receipt issuance, and transaction balancing.
5. **CITIZEN**: Self-service citation lookup, online card settlement, and dispute filing.
