/**
 * App Initialization
 * Entry point — connects UI to backend APIs
 */
document.addEventListener('DOMContentLoaded', async () => {
  // ─── Initialize Auth ──────────────────────────────────
  Auth.bindEvents();
  await Auth.init();

  // ─── Initialize Posts ─────────────────────────────────
  Posts.bindEvents();
  Posts.loadPosts();

  // ─── Load Public Stats (Hero + Categories) ────────────
  loadPublicStats();

  // ─── Navbar Scroll Effect ─────────────────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ─── Mobile Menu Toggle ───────────────────────────────
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbarActions = document.getElementById('navbar-actions');
  const navbarSearch = document.getElementById('navbar-search');

  mobileMenuBtn.addEventListener('click', () => {
    navbarActions.classList.toggle('mobile-open');
    navbarSearch.classList.toggle('mobile-open');

    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navbarActions.classList.contains('mobile-open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // ─── Hero CTA Buttons ────────────────────────────────
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      if (Auth.isLoggedIn()) {
        Posts.openCreateModal();
      } else {
        document.getElementById('auth-modal').classList.add('active');
      }
    });
  }

  const ctaPostBtn = document.getElementById('cta-post-btn');
  if (ctaPostBtn) {
    ctaPostBtn.addEventListener('click', () => {
      if (Auth.isLoggedIn()) {
        Posts.openCreateModal();
      } else {
        document.getElementById('auth-modal').classList.add('active');
      }
    });
  }

  // ─── Category Card Click → Filter Posts ───────────────
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      // Update filter pills
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      const matchingPill = document.querySelector(`.pill[data-category="${cat}"]`);
      if (matchingPill) matchingPill.classList.add('active');
      // Load filtered posts
      Posts.currentCategory = cat;
      Posts.loadPosts();
      // Scroll to posts section
      document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ─── Smooth Scroll for Nav Links ──────────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  console.log('🏛️ Community Bulletin Board initialized');
});

/**
 * Load public stats from backend and populate hero + category counts
 */
async function loadPublicStats() {
  try {
    const stats = await API.getPublicStats();

    // Hero stats
    const postsEl = document.getElementById('stat-posts');
    const membersEl = document.getElementById('stat-members');
    const commentsEl = document.getElementById('stat-comments');

    if (postsEl) postsEl.textContent = stats.totalPosts || 0;
    if (membersEl) membersEl.textContent = stats.totalUsers || 0;
    if (commentsEl) commentsEl.textContent = stats.totalComments || 0;

    // Category counts
    if (stats.categories) {
      const map = {
        'Events': 'count-events',
        'Announcements': 'count-announcements',
        'General': 'count-general',
        'Jobs': 'count-jobs',
        'Lost & Found': 'count-lost'
      };
      for (const [cat, elId] of Object.entries(map)) {
        const el = document.getElementById(elId);
        if (el) {
          const found = stats.categories.find(c => c._id === cat);
          el.textContent = `${found ? found.count : 0} posts`;
        }
      }
    }
  } catch (err) {
    console.warn('Stats not available:', err.message);
  }
}
