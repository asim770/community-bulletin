/**
 * Application configuration
 * Validates and exports environment variables
 */

// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
  POSTS_PER_PAGE: 8,
  CATEGORIES: ['Events', 'Announcements', 'General', 'Jobs', 'Lost & Found']
};

// Required variables for production
const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// Check for missing variables in production
if (process.env.NODE_ENV === 'production') {
  const missing = requiredVars.filter(key => !config[key]);
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing production environment variables:', missing.join(', '));
    // We don't throw error here to allow the app to start and return 500s 
    // with clear messages instead of crashing the deployment entirely.
  }
} else {
  // In development, provide safe fallbacks for easy testing
  if (!config.MONGO_URI) {
    config.MONGO_URI = 'mongodb://localhost:27017/bulletin-board';
    console.log('ℹ️ No MONGO_URI found, using local fallback.');
  }
  if (!config.JWT_SECRET) {
    config.JWT_SECRET = 'dev-secret-key-12345';
    console.log('ℹ️ No JWT_SECRET found, using development fallback.');
  }
}

module.exports = config;
