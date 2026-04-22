/**
 * Like Routes
 */
const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { toggleLike, getLikes } = require('../controllers/likeController');

router.post('/:id/like', requireAuth, toggleLike);
router.get('/:id/likes', optionalAuth, getLikes);

module.exports = router;
