/**
 * Auth Module
 * Handles login, register, logout UI and state
 */
const Auth = {
  currentUser: null,

  // Initialize auth state from stored token
  async init() {
    const token = localStorage.getItem('bb_token');
    if (!token) {
      this.updateUI();
      return;
    }

    try {
      const data = await API.getMe();
      this.currentUser = data.user;
    } catch (err) {
      // Token expired or invalid
      localStorage.removeItem('bb_token');
      this.currentUser = null;
    }

    this.updateUI();
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  },

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },

  // Update navbar UI based on auth state
  updateUI() {
    const actions = document.getElementById('navbar-actions');

    if (this.isLoggedIn()) {
      const user = this.currentUser;
      actions.innerHTML = `
        <div class="nav-user-info">
          <div class="nav-avatar">${getInitials(user.username)}</div>
          <span class="nav-username">${escapeHtml(user.username)}</span>
          ${user.role === 'admin' ? '<span class="nav-role-badge">Admin</span>' : ''}
        </div>
        <button class="btn btn-primary btn-sm" id="nav-create-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          New Post
        </button>
        <button class="btn btn-ghost btn-sm" id="nav-logout-btn">Log Out</button>
      `;

      document.getElementById('nav-create-btn').addEventListener('click', () => Posts.openCreateModal());
      document.getElementById('nav-logout-btn').addEventListener('click', () => this.logout());
    } else {
      actions.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="nav-login-btn">Log In</button>
        <button class="btn btn-primary btn-sm" id="nav-signup-btn">Sign Up</button>
      `;

      document.getElementById('nav-login-btn').addEventListener('click', () => this.openModal('login'));
      document.getElementById('nav-signup-btn').addEventListener('click', () => this.openModal('register'));
    }
  },

  // Open auth modal
  openModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('active');

    this.switchTab(tab);
  },

  // Close auth modal
  closeModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
  },

  // Switch between login and register tabs
  switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const indicator = document.getElementById('auth-tab-indicator');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

    if (tab === 'login') {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      indicator.classList.remove('right');
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      indicator.classList.add('right');
    }
  },

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault();

    const btn = document.getElementById('login-submit-btn');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    setButtonLoading(btn, true);

    try {
      const data = await API.login(email, password);
      localStorage.setItem('bb_token', data.token);
      this.currentUser = data.user;
      this.updateUI();
      this.closeModal();
      showToast(`Welcome back, ${data.user.username}!`, 'success');
      Posts.loadPosts(); // Refresh to show like status
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  },

  // Handle register form submission
  async handleRegister(e) {
    e.preventDefault();

    const btn = document.getElementById('register-submit-btn');
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    setButtonLoading(btn, true);

    try {
      const data = await API.register(username, email, password);
      localStorage.setItem('bb_token', data.token);
      this.currentUser = data.user;
      this.updateUI();
      this.closeModal();
      showToast(`Welcome, ${data.user.username}! Your account is ready.`, 'success');
      if (data.user.role === 'admin') {
        showToast('You are the first user — admin role assigned!', 'info');
      }
      Posts.loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  },

  // Log out
  logout() {
    localStorage.removeItem('bb_token');
    this.currentUser = null;
    this.updateUI();
    showToast('Logged out successfully.', 'info');
    Posts.loadPosts(); // Refresh to clear like status
  },

  // Bind event listeners
  bindEvents() {
    // Close modal
    document.getElementById('auth-modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('auth-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
  }
};
