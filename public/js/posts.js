/**
 * Posts Module
 * Handles post feed, creation, editing, deletion, and detail view
 */
const Posts = {
  // State
  currentCategory: '',
  currentSearch: '',
  currentSort: 'latest',
  currentPage: 1,
  totalPages: 1,
  allRenderedPosts: [],
  selectedFile: null,

  // ─── Load Posts ─────────────────────────────────────────
  async loadPosts(append = false) {
    const grid = document.getElementById('posts-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    const emptyState = document.getElementById('empty-state');

    if (!append) {
      this.currentPage = 1;
      this.allRenderedPosts = [];
      grid.innerHTML = renderSkeletons(6);
      emptyState.style.display = 'none';
    }

    try {
      const data = await API.getPosts({
        category: this.currentCategory,
        search: this.currentSearch,
        sort: this.currentSort,
        page: this.currentPage,
        limit: 8
      });

      this.totalPages = data.totalPages;

      if (!append) {
        grid.innerHTML = '';
      }

      if (data.posts.length === 0 && !append) {
        emptyState.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';

      // Append new cards
      data.posts.forEach((post, i) => {
        this.allRenderedPosts.push(post);
        const card = this.renderCard(post, append ? i : i);
        grid.insertAdjacentHTML('beforeend', card);
      });

      // Setup card event listeners for newly added cards
      this.bindCardEvents();

      // Show/hide load more
      loadMoreContainer.style.display = this.currentPage < this.totalPages ? 'block' : 'none';

    } catch (err) {
      console.error('Failed to load posts:', err);
      if (!append) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Failed to load posts</h3>
            <p>${escapeHtml(err.message)}</p>
          </div>
        `;
      }
      showToast('Failed to load posts. Please try again.', 'error');
    }
  },

  // ─── Render a Post Card ─────────────────────────────────
  renderCard(post) {
    const catClass = getCategoryClass(post.category);

    return `
      <article class="post-card" data-post-id="${post.id}">
        ${post.imageUrl ? `
          <div class="post-card-image-container">
            <img class="post-card-image" src="${post.imageUrl}" alt="${escapeHtml(post.title)}" loading="lazy">
          </div>
        ` : ''}
        <div class="post-card-body">
          <div class="post-card-header">
            <span class="category-badge ${catClass}">${escapeHtml(post.category)}</span>
            <span class="post-card-date">${formatDate(post.createdAt)}</span>
          </div>
          <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
          <p class="post-card-desc">${escapeHtml(post.description)}</p>
          <div class="post-card-footer">
            <div class="post-card-author">
              <div class="author-avatar">${getInitials(post.username)}</div>
              <span>${escapeHtml(post.username)}</span>
            </div>
            <div class="post-card-stats">
              <span class="stat ${post.liked ? 'liked' : ''}">
                <svg viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                ${post.likeCount}
              </span>
              <span class="stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                ${post.commentCount}
              </span>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  // ─── Bind Card Click Events ─────────────────────────────
  bindCardEvents() {
    document.querySelectorAll('.post-card').forEach(card => {
      if (card.dataset.bound) return; // Prevent double-binding
      card.dataset.bound = 'true';

      card.addEventListener('click', () => {
        const postId = card.dataset.postId;
        this.openDetail(postId);
      });
    });
  },

  // ─── Open Post Detail ──────────────────────────────────
  async openDetail(postId) {
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    modal.classList.add('active');
    content.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Loading...</div>';

    try {
      const data = await API.getPost(postId);
      const post = data.post;
      const isOwner = Auth.currentUser && Auth.currentUser.id === post.userId;
      const isAdmin = Auth.isAdmin();

      content.innerHTML = `
        ${post.imageUrl ? `<img class="detail-image" src="${post.imageUrl}" alt="${escapeHtml(post.title)}">` : ''}
        <div class="detail-header">
          <div class="detail-meta">
            <span class="category-badge ${getCategoryClass(post.category)}">${escapeHtml(post.category)}</span>
            <span class="post-card-date">${formatFullDate(post.createdAt)}</span>
          </div>
          <h2 class="detail-title">${escapeHtml(post.title)}</h2>
          <div class="detail-author">
            <div class="author-avatar">${getInitials(post.username)}</div>
            <span>Posted by <strong>${escapeHtml(post.username)}</strong></span>
          </div>
        </div>

        <p class="detail-description">${escapeHtml(post.description)}</p>

        <div class="detail-actions">
          <button class="like-btn ${post.liked ? 'liked' : ''}" id="detail-like-btn" data-post-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span id="detail-like-count">${post.likeCount}</span>
          </button>

          ${isOwner || isAdmin ? `
            <div class="detail-owner-actions">
              ${isOwner ? `<button class="btn btn-ghost btn-sm" id="detail-edit-btn">✏️ Edit</button>` : ''}
              <button class="btn btn-ghost btn-sm" id="detail-delete-btn" style="color: var(--accent-primary);">🗑️ Delete</button>
            </div>
          ` : ''}
        </div>

        ${Comments.renderSection(post.id)}
      `;

      // Bind like button
      document.getElementById('detail-like-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleLike(post.id);
      });

      // Bind edit/delete
      if (isOwner) {
        document.getElementById('detail-edit-btn')?.addEventListener('click', () => {
          this.closeDetail();
          this.openEditModal(post);
        });
      }

      if (isOwner || isAdmin) {
        document.getElementById('detail-delete-btn')?.addEventListener('click', () => {
          this.handleDelete(post.id);
        });
      }

      // Load comments
      await Comments.loadComments(post.id);
      Comments.bindSubmit(post.id);

    } catch (err) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load post</h3>
          <p>${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  },

  // Close detail modal
  closeDetail() {
    document.getElementById('detail-modal').classList.remove('active');
  },

  // ─── Like Handler ──────────────────────────────────────
  async handleLike(postId) {
    if (!Auth.isLoggedIn()) {
      showToast('Please log in to like posts.', 'info');
      Auth.openModal('login');
      return;
    }

    try {
      const data = await API.toggleLike(postId);

      // Update detail view
      const likeBtn = document.getElementById('detail-like-btn');
      const likeCount = document.getElementById('detail-like-count');

      if (likeBtn) {
        likeBtn.classList.toggle('liked', data.liked);
        const svg = likeBtn.querySelector('svg');
        svg.setAttribute('fill', data.liked ? 'currentColor' : 'none');
      }
      if (likeCount) {
        likeCount.textContent = data.likeCount;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // ─── Create Post Modal ─────────────────────────────────
  openCreateModal() {
    if (!Auth.isLoggedIn()) {
      showToast('Please log in to create a post.', 'info');
      Auth.openModal('login');
      return;
    }

    document.getElementById('post-modal-title').textContent = 'Create a Post';
    document.getElementById('post-edit-id').value = '';
    document.getElementById('post-form').reset();
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'block';
    document.getElementById('post-submit-btn').querySelector('.btn-text').textContent = 'Publish Post';
    this.selectedFile = null;

    document.getElementById('post-modal').classList.add('active');
  },

  // ─── Edit Post Modal ───────────────────────────────────
  openEditModal(post) {
    document.getElementById('post-modal-title').textContent = 'Edit Post';
    document.getElementById('post-edit-id').value = post.id;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-description').value = post.description;
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-submit-btn').querySelector('.btn-text').textContent = 'Save Changes';
    this.selectedFile = null;

    // Show existing image if any
    if (post.imageUrl) {
      document.getElementById('upload-placeholder').style.display = 'none';
      document.getElementById('upload-preview').style.display = 'block';
      document.getElementById('preview-img').src = post.imageUrl;
    } else {
      document.getElementById('upload-preview').style.display = 'none';
      document.getElementById('upload-placeholder').style.display = 'block';
    }

    document.getElementById('post-modal').classList.add('active');
  },

  // Close post modal
  closePostModal() {
    document.getElementById('post-modal').classList.remove('active');
    this.selectedFile = null;
  },

  // ─── Handle Post Form Submit ───────────────────────────
  async handlePostSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('post-submit-btn');
    const editId = document.getElementById('post-edit-id').value;
    const isEdit = editId !== '';

    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const category = document.getElementById('post-category').value;

    if (!title || !description || !category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setButtonLoading(btn, true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (isEdit) {
        await API.updatePost(editId, formData);
        showToast('Post updated successfully!', 'success');
      } else {
        await API.createPost(formData);
        showToast('Post published! 🎉', 'success');
      }

      this.closePostModal();
      this.loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  },

  // ─── Handle Delete ─────────────────────────────────────
  async handleDelete(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    try {
      await API.deletePost(postId);
      showToast('Post deleted.', 'success');
      this.closeDetail();
      this.loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // ─── Image Upload Handling ─────────────────────────────
  setupImageUpload() {
    const zone = document.getElementById('image-upload-zone');
    const input = document.getElementById('post-image');
    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('upload-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-image-btn');

    // Click to upload
    zone.addEventListener('click', (e) => {
      if (e.target === removeBtn || removeBtn.contains(e.target)) return;
      input.click();
    });

    // File selected
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.previewFile(file);
    });

    // Drag and drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.previewFile(file);
      }
    });

    // Remove image
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedFile = null;
      input.value = '';
      placeholder.style.display = 'block';
      preview.style.display = 'none';
    });
  },

  previewFile(file) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('preview-img').src = e.target.result;
      document.getElementById('upload-placeholder').style.display = 'none';
      document.getElementById('upload-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  },

  // ─── Bind All Events ──────────────────────────────────
  bindEvents() {
    // Post modal close
    document.getElementById('post-modal-close').addEventListener('click', () => this.closePostModal());
    document.getElementById('post-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closePostModal();
    });

    // Detail modal close
    document.getElementById('detail-modal-close').addEventListener('click', () => this.closeDetail());
    document.getElementById('detail-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeDetail();
    });

    // Post form submission
    document.getElementById('post-form').addEventListener('submit', (e) => this.handlePostSubmit(e));

    // Hero CTA
    document.getElementById('hero-cta').addEventListener('click', () => this.openCreateModal());

    // Category filter pills
    document.querySelectorAll('.pill[data-category]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentCategory = pill.dataset.category;
        this.loadPosts();
      });
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.loadPosts();
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(() => {
      this.currentSearch = searchInput.value.trim();
      this.loadPosts();
    }, 350));

    // Load more button
    document.getElementById('load-more-btn').addEventListener('click', () => {
      this.currentPage++;
      this.loadPosts(true);
    });

    // Image upload
    this.setupImageUpload();

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePostModal();
        this.closeDetail();
        Auth.closeModal();
      }
    });
  }
};
