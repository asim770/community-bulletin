/**
 * Community Bulletin Board — Server Entry Point (Vercel Optimized)
 * 
 * A full-stack web application for community posts, events, and announcements.
 * Built with Express.js and MongoDB.
 * 
 * Refactored for Vercel Serverless:
 * - Removed local file system 'uploads' dependency.
 * - Removed app.listen() for serverless compatibility.
 * - Exported app for Vercel.
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');

const app = express();

// ─── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);  // /api/posts/:id/comments
app.use('/api/posts', likeRoutes);     // /api/posts/:id/like

// ─── Home Route ────────────────────────────────────────
// Explicitly serve index.html on the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── SPA Fallback ──────────────────────────────────────
// For any other non-API route, serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Connect to MongoDB & Start Server ──────────────
// In a serverless environment (like Vercel), we export the app.
// For local development, we start the server.
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start local server only if not in production/Vercel
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// ─── Export for Vercel ─────────────────────────────────
module.exports = app;
