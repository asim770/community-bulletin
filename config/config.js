/**
 * Application configuration
 * Centralized config for easy management
 */
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/bulletin-board',
  JWT_SECRET: process.env.JWT_SECRET || 'bulletin-board-secret-key-2024',
  JWT_EXPIRES_IN: '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  POSTS_PER_PAGE: 8,
  CATEGORIES: ['Events', 'Announcements', 'General', 'Jobs', 'Lost & Found']
};
