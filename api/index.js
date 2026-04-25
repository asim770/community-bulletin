/**
 * Vercel Serverless Entry Point
 * 
 * This file serves as the main handler for Vercel.
 * It imports the Express app and ensures DB connectivity.
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const dbMiddleware = require('../middleware/db');

// Import routes
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');
const commentRoutes = require('../routes/commentRoutes');
const likeRoutes = require('../routes/likeRoutes');

const app = express();

// ─── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Database connection middleware (Only for API routes)
app.use('/api', dbMiddleware);

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/posts', likeRoutes);

// ─── Home Route ────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ─── SPA Fallback ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Export for Vercel ─────────────────────────────────
module.exports = app;
