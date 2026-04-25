/**
 * Middleware to ensure database connection before processing requests.
 * Especially important for serverless functions on Vercel.
 */
const connectDB = require('../config/db');

async function dbMiddleware(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(500).json({ error: 'Database connection failed. Please try again later.' });
  }
}

module.exports = dbMiddleware;
