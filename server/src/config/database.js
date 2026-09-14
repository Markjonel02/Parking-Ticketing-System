// server/src/config/database.js
import mongoose from 'mongoose';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';
import { seedUsers } from '../../../database/seeders/userSeeder.js';
import { seedViolations } from '../../../database/seeders/violationSeeder.js';
import { seedParkingZones } from '../../../database/seeders/parkingZoneSeeder.js';
import {
  User,
  Vehicle,
  Violation,
  Ticket,
  Payment,
  ParkingZone,
  AuditLog
} from '../models/schemas.js';

export { User, Vehicle, Violation, Ticket, Payment, ParkingZone, AuditLog };

// Realistic vehicle seeds
export const seedVehicles = [
  {
    id: 'veh-01',
    plateNumber: '7XYZ890',
    state: 'CA',
    make: 'Tesla',
    model: 'Model Y',
    year: 2023,
    color: 'Pearl White',
    vin: '5YJ3E1EB8NF129840',
    ownerName: 'Alexander Hayes',
    ownerEmail: 'alex.hayes@example.com',
    ownerPhone: '+1 (555) 341-2091',
    registeredCity: 'Metropolis',
    createdAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'veh-02',
    plateNumber: '9ABC123',
    state: 'NY',
    make: 'Ford',
    model: 'F-150 Lightning',
    year: 2024,
    color: 'Oxford White',
    vin: '1FTFW1ED8NFB77123',
    ownerName: 'Jordan Vance',
    ownerEmail: 'jordan.vance@example.com',
    ownerPhone: '+1 (555) 890-1234',
    registeredCity: 'Metropolis',
    createdAt: '2026-02-04T12:00:00.000Z'
  },
  {
    id: 'veh-03',
    plateNumber: '4KLM567',
    state: 'CA',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2022,
    color: 'Magnetic Gray Metallic',
    vin: '2T3P1RFV5NW019284',
    ownerName: 'Maya Lin',
    ownerEmail: 'maya.lin@example.com',
    ownerPhone: '+1 (555) 678-4321',
    registeredCity: 'Metropolis',
    createdAt: '2026-02-18T14:30:00.000Z'
  },
  {
    id: 'veh-04',
    plateNumber: '3TRP441',
    state: 'TX',
    make: 'BMW',
    model: '330i xDrive',
    year: 2021,
    color: 'Phytonic Blue',
    vin: 'WBA5R7C57MFA99210',
    ownerName: 'Lucas Bennett',
    ownerEmail: 'lucas.b@example.com',
    ownerPhone: '+1 (555) 456-7890',
    registeredCity: 'Metropolis',
    createdAt: '2026-03-01T09:15:00.000Z'
  },
  {
    id: 'veh-05',
    plateNumber: '8QWE902',
    state: 'CA',
    make: 'Honda',
    model: 'Civic Sport',
    year: 2020,
    color: 'Rallye Red',
    vin: '19XFC2F77LE091823',
    ownerName: 'Samantha Green',
    ownerEmail: 'sam.green@example.com',
    ownerPhone: '+1 (555) 912-3847',
    registeredCity: 'Metropolis',
    createdAt: '2026-03-05T16:00:00.000Z'
  }
];

// Realistic ticket citations
export const seedTickets = [
  {
    id: 'tkt-2026-00101',
    ticketNumber: 'PKG-2026-00101',
    plateNumber: '7XYZ890',
    state: 'CA',
    vehicleId: 'veh-01',
    violationId: 'vio-01',
    violationCode: 'EXP_MTR_01',
    violationTitle: 'Expired Parking Meter',
    zoneId: 'zone-01',
    zoneName: 'Downtown Core Financial District',
    locationDescription: 'Stall #142, outside 450 Montgomery St',
    officerId: 'usr-officer-01',
    officerName: 'Elena Rostova',
    officerBadge: 'EO-4421',
    fineAmount: 45.00,
    lateFee: 25.00,
    totalDue: 45.00,
    status: 'ISSUED',
    issuedAt: '2026-03-10T11:42:00.000Z',
    dueDate: '2026-03-24T23:59:59.000Z',
    notes: 'Meter meter expired by 42 minutes. Vehicle unoccupied.',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tkt-2026-00102',
    ticketNumber: 'PKG-2026-00102',
    plateNumber: '9ABC123',
    state: 'NY',
    vehicleId: 'veh-02',
    violationId: 'vio-03',
    violationCode: 'HND_03',
    violationTitle: 'Unauthorized Accessible Stall',
    zoneId: 'zone-03',
    zoneName: 'General Medical Center Campus',
    locationDescription: 'Medical Tower Blue Lot, Row B, Bay 4',
    officerId: 'usr-officer-02',
    officerName: 'David Chen',
    officerBadge: 'EO-4422',
    fineAmount: 320.00,
    lateFee: 90.00,
    totalDue: 320.00,
    status: 'DISPUTED',
    disputeReason: 'Emergency medical consultation placard was placed on passenger seat floorboard by accident.',
    disputeDate: '2026-03-12T14:10:00.000Z',
    issuedAt: '2026-03-08T09:15:00.000Z',
    dueDate: '2026-03-18T23:59:59.000Z',
    notes: 'No disability permit displayed on rearview mirror or dashboard.',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tkt-2026-00103',
    ticketNumber: 'PKG-2026-00103',
    plateNumber: '4KLM567',
    state: 'CA',
    vehicleId: 'veh-03',
    violationId: 'vio-04',
    violationCode: 'FHD_04',
    violationTitle: 'Fire Hydrant Clearance Violation',
    zoneId: 'zone-02',
    zoneName: 'Waterfront Commercial Wharf',
    locationDescription: 'In front of Pier 14, within 6 feet of hydrant',
    officerId: 'usr-officer-01',
    officerName: 'Elena Rostova',
    officerBadge: 'EO-4421',
    fineAmount: 180.00,
    lateFee: 60.00,
    totalDue: 0.00,
    status: 'PAID',
    issuedAt: '2026-03-02T16:05:00.000Z',
    paidAt: '2026-03-04T10:20:00.000Z',
    dueDate: '2026-03-12T23:59:59.000Z',
    paymentId: 'pay-2026-00088',
    notes: 'Vehicle parked directly obstructing fire hydrant clearance cone.',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tkt-2026-00104',
    ticketNumber: 'PKG-2026-00104',
    plateNumber: '3TRP441',
    state: 'TX',
    vehicleId: 'veh-04',
    violationId: 'vio-02',
    violationCode: 'NPZ_02',
    violationTitle: 'No Parking / Tow-Away Zone',
    zoneId: 'zone-01',
    zoneName: 'Downtown Core Financial District',
    locationDescription: 'Red curb zone corner of 3rd and Market St',
    officerId: 'usr-officer-02',
    officerName: 'David Chen',
    officerBadge: 'EO-4422',
    fineAmount: 85.00,
    lateFee: 40.00,
    totalDue: 125.00,
    status: 'OVERDUE',
    issuedAt: '2026-02-14T08:20:00.000Z',
    dueDate: '2026-02-28T23:59:59.000Z',
    notes: 'Ignored red curb and morning rush hour tow-away sign.',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tkt-2026-00105',
    ticketNumber: 'PKG-2026-00105',
    plateNumber: '8QWE902',
    state: 'CA',
    vehicleId: 'veh-05',
    violationId: 'vio-07',
    violationCode: 'ST_SWP_07',
    violationTitle: 'Scheduled Street Sweeping',
    zoneId: 'zone-05',
    zoneName: 'Historic Hill Residential District',
    locationDescription: 'Opposite 812 Chestnut Avenue',
    officerId: 'usr-officer-01',
    officerName: 'Elena Rostova',
    officerBadge: 'EO-4421',
    fineAmount: 60.00,
    lateFee: 30.00,
    totalDue: 0.00,
    status: 'PAID',
    issuedAt: '2026-03-06T08:45:00.000Z',
    paidAt: '2026-03-07T11:15:00.000Z',
    dueDate: '2026-03-20T23:59:59.000Z',
    paymentId: 'pay-2026-00089',
    notes: 'Parked during Friday 08:00 - 10:00 sanitation sweep route.',
    evidencePhotos: []
  },
  {
    id: 'tkt-2026-00106',
    ticketNumber: 'PKG-2026-00106',
    plateNumber: '7XYZ890',
    state: 'CA',
    vehicleId: 'veh-01',
    violationId: 'vio-05',
    violationCode: 'DBL_05',
    violationTitle: 'Double Parking',
    zoneId: 'zone-01',
    zoneName: 'Downtown Core Financial District',
    locationDescription: 'In front of 120 Sutter St',
    officerId: 'usr-officer-02',
    officerName: 'David Chen',
    officerBadge: 'EO-4422',
    fineAmount: 110.00,
    lateFee: 50.00,
    totalDue: 110.00,
    status: 'ISSUED',
    issuedAt: '2026-03-13T10:15:00.000Z',
    dueDate: '2026-03-27T23:59:59.000Z',
    notes: 'Double parked causing blockage to Muni transit lane.',
    evidencePhotos: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

// Realistic payments
export const seedPayments = [
  {
    id: 'pay-2026-00088',
    referenceNumber: 'PAY-REF-992014',
    ticketId: 'tkt-2026-00103',
    ticketNumber: 'PKG-2026-00103',
    plateNumber: '4KLM567',
    amount: 180.00,
    paymentMethod: 'CREDIT_CARD',
    cardBrand: 'Visa',
    lastFour: '4242',
    status: 'COMPLETED',
    paidBy: 'Maya Lin',
    cashierId: 'usr-cashier-01',
    receiptUrl: '/uploads/receipts/receipt-pay-2026-00088.pdf',
    transactionDate: '2026-03-04T10:20:00.000Z',
    notes: 'Online citizen payment portal payment confirmed.'
  },
  {
    id: 'pay-2026-00089',
    referenceNumber: 'PAY-REF-883102',
    ticketId: 'tkt-2026-00105',
    ticketNumber: 'PKG-2026-00105',
    plateNumber: '8QWE902',
    amount: 60.00,
    paymentMethod: 'DEBIT_CARD',
    cardBrand: 'MasterCard',
    lastFour: '8819',
    status: 'COMPLETED',
    paidBy: 'Samantha Green',
    cashierId: 'usr-cashier-01',
    receiptUrl: '/uploads/receipts/receipt-pay-2026-00089.pdf',
    transactionDate: '2026-03-07T11:15:00.000Z',
    notes: 'In-person counter service payment.'
  }
];

// Audit trail
export const seedAuditLogs = [
  {
    id: 'aud-001',
    timestamp: '2026-03-13T10:15:00.000Z',
    userId: 'usr-officer-02',
    userName: 'David Chen',
    userRole: 'OFFICER',
    action: 'TICKET_CREATED',
    entityType: 'TICKET',
    entityId: 'tkt-2026-00106',
    ipAddress: '192.168.1.104',
    details: 'Issued citation PKG-2026-00106 to plate 7XYZ890 for Double Parking.'
  },
  {
    id: 'aud-002',
    timestamp: '2026-03-12T14:10:00.000Z',
    userId: 'usr-supervisor-01',
    userName: 'Sarah Sterling',
    userRole: 'SUPERVISOR',
    action: 'DISPUTE_FILED',
    entityType: 'TICKET',
    entityId: 'tkt-2026-00102',
    ipAddress: '192.168.1.55',
    details: 'Citizen dispute logged for citation PKG-2026-00102.'
  },
  {
    id: 'aud-003',
    timestamp: '2026-03-10T11:42:00.000Z',
    userId: 'usr-officer-01',
    userName: 'Elena Rostova',
    userRole: 'OFFICER',
    action: 'TICKET_CREATED',
    entityType: 'TICKET',
    entityId: 'tkt-2026-00101',
    ipAddress: '192.168.1.101',
    details: 'Issued citation PKG-2026-00101 to plate 7XYZ890 for Expired Meter.'
  },
  {
    id: 'aud-004',
    timestamp: '2026-03-07T11:15:00.000Z',
    userId: 'usr-cashier-01',
    userName: 'Julian Perez',
    userRole: 'CASHIER',
    action: 'PAYMENT_PROCESSED',
    entityType: 'PAYMENT',
    entityId: 'pay-2026-00089',
    ipAddress: '192.168.1.80',
    details: 'Processed $60.00 citation payment for PKG-2026-00105.'
  }
];

class MongoDatabase {
  constructor() {
    this.isConnecting = false;
    this.connected = false;
    this.connectionError = null;
    this.mongoUri = ENV.MONGODB_URI;

    // In-memory synchronized store for instant responsive operations and fallback
    this.collections = {
      users: [...seedUsers],
      vehicles: [...seedVehicles],
      tickets: [...seedTickets],
      violations: [...seedViolations],
      payments: [...seedPayments],
      parkingZones: [...seedParkingZones],
      auditLogs: [...seedAuditLogs]
    };

    // Initialize MongoDB connection asynchronously
    this.connectMongo();
  }

  getMaskedUri() {
    if (!this.mongoUri) return 'Not configured';
    try {
      return this.mongoUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
    } catch {
      return this.mongoUri;
    }
  }

  async connectMongo() {
    if (this.isConnecting || this.connected) return;
    this.isConnecting = true;

    try {
      // Connect to MongoDB using Mongoose
      logger.info(`Connecting to MongoDB at: ${this.getMaskedUri()}`);
      
      // Configure connection with short timeout so failure does not block server startup
      await mongoose.connect(this.mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500
      });

      this.connected = true;
      this.connectionError = null;
      logger.info('Successfully connected to MongoDB via Mongoose!');

      // Auto-seed and sync data into MongoDB
      await this.syncAndSeedMongo();
    } catch (err) {
      this.connected = false;
      this.connectionError = err.message;
      logger.warn(`MongoDB connection standby: ${err.message}. Ready for external MONGODB_URI or Atlas connection.`);
    } finally {
      this.isConnecting = false;
    }

    // Monitor future connection lifecycle
    mongoose.connection.on('connected', () => {
      this.connected = true;
      this.connectionError = null;
      logger.info('MongoDB connection established.');
      this.syncAndSeedMongo().catch(e => logger.warn('Mongo seed error', e));
    });

    mongoose.connection.on('error', (err) => {
      this.connected = false;
      this.connectionError = err.message;
      logger.warn(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      this.connected = false;
      logger.info('MongoDB disconnected.');
    });
  }

  async syncAndSeedMongo() {
    if (mongoose.connection.readyState !== 1) return;

    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Seeding MongoDB initial collections...');
        await Promise.all([
          User.insertMany(this.collections.users),
          Vehicle.insertMany(this.collections.vehicles),
          Violation.insertMany(this.collections.violations),
          Ticket.insertMany(this.collections.tickets),
          Payment.insertMany(this.collections.payments),
          ParkingZone.insertMany(this.collections.parkingZones),
          AuditLog.insertMany(this.collections.auditLogs)
        ]);
        logger.info('MongoDB database seeding completed successfully.');
      } else {
        // Hydrate local cache from MongoDB to ensure parity
        const [users, vehicles, violations, tickets, payments, zones, logs] = await Promise.all([
          User.find().lean(),
          Vehicle.find().lean(),
          Violation.find().lean(),
          Ticket.find().lean(),
          Payment.find().lean(),
          ParkingZone.find().lean(),
          AuditLog.find().lean()
        ]);

        if (users.length > 0) this.collections.users = users;
        if (vehicles.length > 0) this.collections.vehicles = vehicles;
        if (violations.length > 0) this.collections.violations = violations;
        if (tickets.length > 0) this.collections.tickets = tickets;
        if (payments.length > 0) this.collections.payments = payments;
        if (zones.length > 0) this.collections.parkingZones = zones;
        if (logs.length > 0) this.collections.auditLogs = logs;

        logger.info(`Hydrated cache from MongoDB (${tickets.length} tickets, ${vehicles.length} vehicles).`);
      }
    } catch (err) {
      logger.warn(`MongoDB synchronization note: ${err.message}`);
    }
  }

  getModelForCollection(name) {
    switch (name) {
      case 'users': return User;
      case 'vehicles': return Vehicle;
      case 'tickets': return Ticket;
      case 'violations': return Violation;
      case 'payments': return Payment;
      case 'parkingZones': return ParkingZone;
      case 'auditLogs': return AuditLog;
      default: return null;
    }
  }

  get(collectionName) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = [];
    }
    return this.collections[collectionName];
  }

  find(collectionName, predicate = () => true) {
    const list = this.get(collectionName);
    return list.filter(predicate);
  }

  findOne(collectionName, predicate) {
    const list = this.get(collectionName);
    return list.find(predicate) || null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, item => item.id === id);
  }

  insert(collectionName, doc) {
    const list = this.get(collectionName);
    const newDoc = {
      ...doc,
      id: doc.id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString()
    };
    list.unshift(newDoc);

    // Asynchronously persist to MongoDB via Mongoose if connected
    if (mongoose.connection.readyState === 1) {
      const Model = this.getModelForCollection(collectionName);
      if (Model) {
        Model.create(newDoc).catch(err => {
          logger.warn(`Mongoose write error for ${collectionName}: ${err.message}`);
        });
      }
    }

    return newDoc;
  }

  update(collectionName, id, updates) {
    const list = this.get(collectionName);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;

    // Asynchronously update MongoDB via Mongoose if connected
    if (mongoose.connection.readyState === 1) {
      const Model = this.getModelForCollection(collectionName);
      if (Model) {
        Model.findOneAndUpdate({ id }, { $set: updates }, { new: true }).catch(err => {
          logger.warn(`Mongoose update error for ${collectionName}: ${err.message}`);
        });
      }
    }

    return updated;
  }

  delete(collectionName, id) {
    const list = this.get(collectionName);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);

    // Asynchronously delete in MongoDB via Mongoose if connected
    if (mongoose.connection.readyState === 1) {
      const Model = this.getModelForCollection(collectionName);
      if (Model) {
        Model.deleteOne({ id }).catch(err => {
          logger.warn(`Mongoose delete error for ${collectionName}: ${err.message}`);
        });
      }
    }

    return true;
  }

  count(collectionName, predicate = () => true) {
    return this.find(collectionName, predicate).length;
  }

  getDatabaseStatus() {
    const isMongooseConnected = mongoose.connection.readyState === 1;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const connectionState = states[mongoose.connection.readyState] || 'disconnected';

    return {
      database: 'MongoDB',
      orm: 'Mongoose ODM (v' + mongoose.version + ')',
      connectionState,
      isConnected: isMongooseConnected,
      activeDatabase: mongoose.connection.name || 'parkguard',
      configuredUri: this.getMaskedUri(),
      storageMode: isMongooseConnected ? 'MongoDB Server / Atlas Cluster' : 'MongoDB Schema Engine (Live Fallback Cache)',
      collections: {
        users: this.collections.users.length,
        tickets: this.collections.tickets.length,
        vehicles: this.collections.vehicles.length,
        violations: this.collections.violations.length,
        payments: this.collections.payments.length,
        parkingZones: this.collections.parkingZones.length,
        auditLogs: this.collections.auditLogs.length
      },
      models: ['User', 'Vehicle', 'Ticket', 'Violation', 'Payment', 'ParkingZone', 'AuditLog']
    };
  }
}

export const db = new MongoDatabase();
