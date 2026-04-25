/**
 * API Module
 * Centralized fetch wrapper for all backend API calls
 */
const API = {
  BASE: '/api',

  // Get stored auth token
  getToken() {
    return localStorage.getItem('bb_token');
  },

  // Build headers with optional auth
  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Generic request handler
  async request(method, endpoint, body = null, isFormData = false) {
    const options = {
      method,
      headers: this.getHeaders(isFormData),
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${this.BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  },

  // ─── Auth ───────────────────────────────────────────────
  register(username, email, password) {
    return this.request('POST', '/auth/register', { username, email, password });
  },

  login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  },

  getMe() {
    return this.request('GET', '/auth/me');
  },

  // ─── Posts ──────────────────────────────────────────────
  getPublicStats() {
    return this.request('GET', '/posts/stats/public');
  },

  getPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request('GET', `/posts?${query.toString()}`);
  },

  getPost(id) {
    return this.request('GET', `/posts/${id}`);
  },

  createPost(formData) {
    return this.request('POST', '/posts', formData, true);
  },

  updatePost(id, formData) {
    return this.request('PUT', `/posts/${id}`, formData, true);
  },

  deletePost(id) {
    return this.request('DELETE', `/posts/${id}`);
  },

  // ─── Comments ───────────────────────────────────────────
  getComments(postId) {
    return this.request('GET', `/posts/${postId}/comments`);
  },

  addComment(postId, text) {
    return this.request('POST', `/posts/${postId}/comments`, { text });
  },

  // ─── Likes ──────────────────────────────────────────────
  toggleLike(postId) {
    return this.request('POST', `/posts/${postId}/like`);
  },

  getLikes(postId) {
    return this.request('GET', `/posts/${postId}/likes`);
  }
};
