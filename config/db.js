/**
 * Database connection utility for serverless environments
 * Uses global caching to reuse connections across invocations
 */

const mongoose = require('mongoose');

let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Get URI from environment
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  // Create new connection if none exists
  if (!cached.promise) {
    console.log('📡 Connecting to MongoDB...');
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((m) => {
      console.log('✅ Connected to MongoDB');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
