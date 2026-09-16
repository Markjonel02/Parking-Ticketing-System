// database/seeders/seed.js
//
// One-time / idempotent bootstrap script. Run with `npm run seed` (from
// /server) or `node database/seeders/seed.js` from the project root.
//
// This seeds only reference data and initial staff accounts — the
// violation fee schedule, parking zones, and a starter user for each
// role. It deliberately does NOT fabricate tickets, payments, vehicles,
// or audit history: that data should come from real use of the system,
// not from a canned demo dataset pretending to be activity that never
// happened.
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../server/src/config/database.js';
import { User } from '../../server/src/models/User.js';
import { Violation } from '../../server/src/models/Violation.js';
import { ParkingZone } from '../../server/src/models/ParkingZone.js';
import { seedUsers, DEFAULT_SEED_PASSWORD } from './userSeeder.js';
import { seedViolations } from './violationSeeder.js';
import { seedParkingZones } from './parkingZoneSeeder.js';
import { logger } from '../../server/src/utils/logger.js';

async function seedCollection(Model, label, docs, { useCreate = false } = {}) {
  const existing = await Model.countDocuments();
  if (existing > 0) {
    logger.info(`Skipping ${label}: ${existing} document(s) already present.`);
    return;
  }

  if (useCreate) {
    // Use .create() one at a time (not insertMany) so each document runs
    // through its schema's pre-save hooks — critical for User, whose
    // hook hashes the password.
    for (const doc of docs) {
      // eslint-disable-next-line no-await-in-loop
      await Model.create(doc);
    }
  } else {
    await Model.insertMany(docs);
  }
  logger.info(`Seeded ${docs.length} ${label}.`);
}

async function run() {
  await connectDB();

  await seedCollection(User, 'users', seedUsers, { useCreate: true });
  await seedCollection(Violation, 'violations', seedViolations);
  await seedCollection(ParkingZone, 'parking zones', seedParkingZones);

  const userCount = await User.countDocuments();
  if (userCount === seedUsers.length) {
    logger.info(
      `Bootstrap accounts created. Default password for all seeded accounts: "${DEFAULT_SEED_PASSWORD}" — change these immediately.`,
    );
  }

  await disconnectDB();
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
}

run().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});
