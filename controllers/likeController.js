/**
 * Like Controller
 * Handles toggling likes and getting like counts
 */
const Like = require('../models/Like');
const Post = require('../models/Post');

/**
 * POST /api/posts/:id/like
 * Toggle like on a post (requires auth)
 */
async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Check if already liked
    const existing = await Like.findOne({ postId: req.params.id, userId: req.user.id });

    let liked;
    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      liked = false;
    } else {
      await Like.create({ postId: req.params.id, userId: req.user.id });
      liked = true;
    }

    const likeCount = await Like.countDocuments({ postId: req.params.id });

    res.json({
      liked,
      likeCount,
      message: liked ? 'Post liked!' : 'Post unliked.'
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
}

/**
 * GET /api/posts/:id/likes
 * Get like count and user's like status for a post
 */
async function getLikes(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const likeCount = await Like.countDocuments({ postId: req.params.id });
    const liked = req.user
      ? !!(await Like.exists({ postId: req.params.id, userId: req.user.id }))
      : false;

    res.json({ likeCount, liked });
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ error: 'Failed to get likes.' });
  }
}

module.exports = { toggleLike, getLikes };
