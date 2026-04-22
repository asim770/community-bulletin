/**
 * In-Memory Data Store
 * 
 * Structured like a database so it can be easily replaced with MongoDB.
 * Each "collection" has CRUD helper methods.
 */
const { v4: uuidv4 } = require('uuid');

// ─── Data Collections ──────────────────────────────────
const users = [];
const posts = [];
const comments = [];
const likes = []; // { postId, userId }

// ─── User Methods ──────────────────────────────────────
const UserStore = {
  create(data) {
    const user = {
      id: uuidv4(),
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: users.length === 0 ? 'admin' : 'user', // First user is admin
      createdAt: new Date().toISOString()
    };
    users.push(user);
    return user;
  },

  findByEmail(email) {
    return users.find(u => u.email === email);
  },

  findByUsername(username) {
    return users.find(u => u.username === username);
  },

  findById(id) {
    return users.find(u => u.id === id);
  },

  toSafeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
};

// ─── Post Methods ──────────────────────────────────────
const PostStore = {
  create(data) {
    const post = {
      id: uuidv4(),
      userId: data.userId,
      username: data.username,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    posts.push(post);
    return post;
  },

  findAll({ category, search, sort, page, limit }) {
    let filtered = [...posts];

    // Filter by category
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    // Search by title or description
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: latest first
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return { posts: paged, total, totalPages, page };
  },

  findById(id) {
    return posts.find(p => p.id === id);
  },

  update(id, data) {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;
    posts[index] = {
      ...posts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return posts[index];
  },

  delete(id) {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    // Also remove related comments and likes
    CommentStore.deleteByPostId(id);
    LikeStore.deleteByPostId(id);
    return true;
  }
};

// ─── Comment Methods ───────────────────────────────────
const CommentStore = {
  create(data) {
    const comment = {
      id: uuidv4(),
      postId: data.postId,
      userId: data.userId,
      username: data.username,
      text: data.text,
      createdAt: new Date().toISOString()
    };
    comments.push(comment);
    return comment;
  },

  findByPostId(postId) {
    return comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  deleteByPostId(postId) {
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].postId === postId) {
        comments.splice(i, 1);
      }
    }
  }
};

// ─── Like Methods ──────────────────────────────────────
const LikeStore = {
  toggle(postId, userId) {
    const index = likes.findIndex(l => l.postId === postId && l.userId === userId);
    if (index === -1) {
      likes.push({ postId, userId });
      return true; // liked
    } else {
      likes.splice(index, 1);
      return false; // unliked
    }
  },

  getCount(postId) {
    return likes.filter(l => l.postId === postId).length;
  },

  hasLiked(postId, userId) {
    return likes.some(l => l.postId === postId && l.userId === userId);
  },

  deleteByPostId(postId) {
    for (let i = likes.length - 1; i >= 0; i--) {
      if (likes[i].postId === postId) {
        likes.splice(i, 1);
      }
    }
  }
};

module.exports = { UserStore, PostStore, CommentStore, LikeStore };
