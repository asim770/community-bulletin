/**
 * Post Controller
 * Handles CRUD operations for bulletin board posts
 */
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const { CATEGORIES, POSTS_PER_PAGE } = require('../config/config');
const cloudinary = require('cloudinary').v2;

/**
 * Helper to upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'community-bulletin' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * GET /api/posts
 * List posts with filtering, search, sort, and pagination
 */
async function getPosts(req, res) {
  try {
    const {
      category,
      search,
      sort = 'latest',
      page = 1,
      limit = POSTS_PER_PAGE
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate category
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
    }

    // Build query filter
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Sort direction
    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    // Get total count for pagination
    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Fetch posts
    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Enrich posts with like and comment counts
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const postId = post._id.toString();
      const likeCount = await Like.countDocuments({ postId: post._id });
      const commentCount = await Comment.countDocuments({ postId: post._id });
      const liked = req.user
        ? await Like.exists({ postId: post._id, userId: req.user.id })
        : false;

      return {
        ...post,
        id: postId,
        likeCount,
        commentCount,
        liked: !!liked
      };
    }));

    res.json({
      posts: enrichedPosts,
      total,
      totalPages,
      page: pageNum
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
}

/**
 * GET /api/posts/:id
 * Get a single post by ID
 */
async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const likeCount = await Like.countDocuments({ postId: post._id });
    const commentCount = await Comment.countDocuments({ postId: post._id });
    const liked = req.user
      ? await Like.exists({ postId: post._id, userId: req.user.id })
      : false;

    const enriched = {
      ...post,
      id: post._id.toString(),
      likeCount,
      commentCount,
      liked: !!liked
    };

    res.json({ post: enriched });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
}

/**
 * POST /api/posts
 * Create a new post (requires auth)
 */
async function createPost(req, res) {
  try {
    const { title, description, category } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    if (title.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters long.' });
    }

    if (description.length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters long.' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      if (req.file.buffer) {
        // Cloudinary manual upload from memory buffer
        console.log('☁️ Uploading buffer to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } else {
        // Local disk storage fallback
        imageUrl = `/uploads/${req.file.filename}`;
      }
      console.log('🖼️ Post Image:', imageUrl);
    }

    const post = await Post.create({
      userId: req.user.id,
      username: req.user.username,
      title,
      description,
      category,
      imageUrl
    });

    res.status(201).json({
      message: 'Post created successfully!',
      post: {
        ...post.toObject(),
        id: post._id.toString(),
        likeCount: 0,
        commentCount: 0,
        liked: false
      }
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
}

/**
 * PUT /api/posts/:id
 * Update a post (owner only)
 */
async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Only the owner can edit
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts.' });
    }

    const { title, description, category } = req.body;

    // Validate provided fields
    if (title && title.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters long.' });
    }

    if (description && description.length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters long.' });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
    }

    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;
    if (req.file) {
      if (req.file.buffer) {
        console.log('☁️ Updating image on Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        post.imageUrl = result.secure_url;
      } else {
        post.imageUrl = `/uploads/${req.file.filename}`;
      }
      console.log('🖼️ Image updated to:', post.imageUrl);
    }

    await post.save();

    const likeCount = await Like.countDocuments({ postId: post._id });
    const commentCount = await Comment.countDocuments({ postId: post._id });
    const liked = await Like.exists({ postId: post._id, userId: req.user.id });

    res.json({
      message: 'Post updated successfully!',
      post: {
        ...post.toObject(),
        id: post._id.toString(),
        likeCount,
        commentCount,
        liked: !!liked
      }
    });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'Failed to update post.' });
  }
}

/**
 * DELETE /api/posts/:id
 * Delete a post (owner or admin)
 */
async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Owner or admin can delete
    console.log('🗑️ Delete attempt:', { 
      postId: req.params.id, 
      userId: req.user.id, 
      role: req.user.role, 
      postOwner: post.userId.toString() 
    });
    
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    // Delete the post and its related comments and likes
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    await Like.deleteMany({ postId: req.params.id });

    res.json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
}

/**
 * GET /api/posts/stats/public
 * Returns aggregate stats for the public homepage
 */
async function getPublicStats(req, res) {
  try {
    const User = require('../models/User');

    const [totalPosts, totalUsers, totalComments, categories] = await Promise.all([
      Post.countDocuments(),
      User.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({ totalPosts, totalUsers, totalComments, categories });
  } catch (err) {
    console.error('Public stats error:', err);
    res.status(500).json({ error: 'Failed to load stats.' });
  }
}

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, getPublicStats };
