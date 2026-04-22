/**
 * Comments Module
 * Renders and handles comments inside the post detail view
 */
const Comments = {
  // Render comments section for a post
  renderSection(postId) {
    return `
      <div class="comments-section">
        <h3 class="comments-title">💬 Comments</h3>
        ${Auth.isLoggedIn() ? `
          <div class="comment-form" id="comment-form-${postId}">
            <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." maxlength="500">
            <button class="btn btn-primary btn-sm" id="comment-submit-${postId}">Post</button>
          </div>
        ` : `
          <p class="no-comments" style="margin-bottom:16px;">
            <a href="#" class="login-link" style="color: var(--accent-primary); text-decoration: underline;">Log in</a> to leave a comment.
          </p>
        `}
        <div class="comment-list" id="comment-list-${postId}">
          <div style="text-align:center; padding:16px; color:var(--text-muted);">Loading comments...</div>
        </div>
      </div>
    `;
  },

  // Load and render comments for a post
  async loadComments(postId) {
    const list = document.getElementById(`comment-list-${postId}`);
    if (!list) return;

    try {
      const data = await API.getComments(postId);
      const comments = data.comments;

      if (comments.length === 0) {
        list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
        return;
      }

      list.innerHTML = comments.map(c => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.username)}</span>
            <span class="comment-date">${formatDate(c.createdAt)}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = '<p class="no-comments">Failed to load comments.</p>';
    }
  },

  // Bind comment submission
  bindSubmit(postId) {
    const btn = document.getElementById(`comment-submit-${postId}`);
    const input = document.getElementById(`comment-input-${postId}`);

    if (!btn || !input) return;

    const submit = async () => {
      const text = input.value.trim();
      if (!text) return;

      btn.disabled = true;

      try {
        await API.addComment(postId, text);
        input.value = '';
        showToast('Comment added!', 'success');
        await this.loadComments(postId);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });

    // Bind login link
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('login');
      });
    }
  }
};
