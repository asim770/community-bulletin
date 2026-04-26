/**
 * Vercel Serverless Entry Point
 * All /api/* requests are handled here
 */
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

// Import routes
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');
const commentRoutes = require('../routes/commentRoutes');
const likeRoutes = require('../routes/likeRoutes');

const app = express();

// ─── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

// ─── Connect DB before every request ───────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/posts', likeRoutes);

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

module.exports = app;
