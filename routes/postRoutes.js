/**
 * Post Routes — Cloudinary + Multer for image uploads
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { MAX_FILE_SIZE } = require('../config/config');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPublicStats
} = require('../controllers/postController');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Always use memory storage (works on Vercel + local)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

// Multer error handler wrapper
function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be smaller than 4MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Upload Error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

// Routes
router.get('/', optionalAuth, getPosts);
router.get('/stats/public', getPublicStats);
router.get('/:id', optionalAuth, getPost);
router.post('/', requireAuth, handleUpload, createPost);
router.put('/:id', requireAuth, handleUpload, updatePost);
router.delete('/:id', requireAuth, deletePost);

module.exports = router;
