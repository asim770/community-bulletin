/**
 * Application configuration
 * Centralized config for easy management
 */
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/bulletin-board',
  JWT_SECRET: process.env.JWT_SECRET || 'bulletin-board-secret-key-2024',
  JWT_EXPIRES_IN: '7d',
  UPLOAD_DIR: 'uploads',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  POSTS_PER_PAGE: 8,
  CATEGORIES: ['Events', 'Announcements', 'General', 'Jobs', 'Lost & Found']
};
