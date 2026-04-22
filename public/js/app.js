/**
 * App Initialization
 * Entry point for the frontend application
 */
document.addEventListener('DOMContentLoaded', async () => {
  // ─── Initialize Auth ──────────────────────────────────
  Auth.bindEvents();
  await Auth.init();

  // ─── Initialize Posts ─────────────────────────────────
  Posts.bindEvents();
  Posts.loadPosts();

  // ─── Navbar Scroll Effect ─────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // ─── Mobile Menu Toggle ───────────────────────────────
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbarActions = document.getElementById('navbar-actions');
  const navbarSearch = document.getElementById('navbar-search');

  mobileMenuBtn.addEventListener('click', () => {
    navbarActions.classList.toggle('mobile-open');
    navbarSearch.classList.toggle('mobile-open');

    // Animate hamburger to X
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

  console.log('🏛️ Community Bulletin Board initialized');
});
