
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getComments, addComment } = require('../controllers/commentController');

router.get('/:id/comments', getComments);
router.post('/:id/comments', requireAuth, addComment);

module.exports = router;
