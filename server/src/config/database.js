// server/src/config/database.js
import mongoose from 'mongoose';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);

let connectionPromise = null;

function maskUri(uri) {
  if (!uri) return 'Not configured';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
}

/**
 * Establishes (or reuses) the single Mongoose connection for the process.
 * There is no in-memory fallback: if MongoDB is unreachable, the caller
 * gets a rejected promise and the server refuses to accept traffic that
 * depends on data it does not actually have.
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  logger.info(`Connecting to MongoDB at ${maskUri(ENV.MONGODB_URI)} ...`);

  connectionPromise = mongoose
    .connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    })
    .then((conn) => {
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      logger.error('MongoDB connection failed', err);
      throw err;
    });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', err);
  });

  return connectionPromise;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  connectionPromise = null;
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    connectionState: states[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1,
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}

export default mongoose;
