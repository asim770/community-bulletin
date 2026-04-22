/**
 * Comment Controller
 * Handles adding and retrieving comments for posts
 */
const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * GET /api/posts/:id/comments
 * Get all comments for a post
 */
async function getComments(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const comments = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    // Add id field for frontend compatibility
    const mapped = comments.map(c => ({ ...c, id: c._id.toString() }));

    res.json({ comments: mapped });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
}

/**
 * POST /api/posts/:id/comments
 * Add a comment to a post (requires auth)
 */
async function addComment(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Comment must be under 500 characters.' });
    }

    const comment = await Comment.create({
      postId: req.params.id,
      userId: req.user.id,
      username: req.user.username,
      text: text.trim()
    });

    res.status(201).json({
      message: 'Comment added!',
      comment: { ...comment.toObject(), id: comment._id.toString() }
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
}

module.exports = { getComments, addComment };
