/**
 * Application configuration
 * All values come from process.env (set in Vercel dashboard or .env locally)
 */
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-12345',
  JWT_EXPIRES_IN: '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
  POSTS_PER_PAGE: 8,
  CATEGORIES: ['Events', 'Announcements', 'General', 'Jobs', 'Lost & Found']
};
