/**
 * Post Routes
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { 
  MAX_FILE_SIZE, 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} = require('../config/config');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPublicStats
} = require('../controllers/postController');

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});
let storage;
const hasCloudinary = CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  console.log('☁️ Using Cloudinary storage (Buffer Mode)');
  storage = multer.memoryStorage();
} else {
  // Use local disk storage only if NOT on Vercel
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: Cloudinary configuration is missing for production/Vercel deployment.');
    storage = multer.memoryStorage();
  } else {
    console.log('📁 Using local disk storage (Cloudinary credentials missing)');
    const fs = require('fs');
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
      }
    });
  }
}

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
        return res.status(400).json({ error: 'Image must be smaller than 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('📤 Upload Error:', err.message);
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
