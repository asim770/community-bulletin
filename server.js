/**
 * Community Bulletin Board — Server Entry Point
 * 
 * A full-stack web application for community posts, events, and announcements.
 * Built with Express.js and MongoDB.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const { PORT, UPLOAD_DIR, MONGO_URI } = require('./config/config');

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

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);  // /api/posts/:id/comments
app.use('/api/posts', likeRoutes);     // /api/posts/:id/like

// ─── SPA Fallback ──────────────────────────────────────
// For any non-API route, serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Connect to MongoDB & Start Server ─────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`\n🏛️  Community Bulletin Board`);
      console.log(`   Server running at http://localhost:${PORT}`);
      console.log(`   Database: ${MONGO_URI}`);
      console.log(`   Press Ctrl+C to stop\n`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
