/**
 * Utility Functions
 * Shared helpers used across the application
 */

// ─── Date Formatting ──────────────────────────────────────
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  // Under 1 minute
  if (diff < 60 * 1000) return 'Just now';
  // Under 1 hour
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
  // Under 24 hours
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  // Under 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;

  // Otherwise show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ─── Category Helpers ─────────────────────────────────────
const CATEGORY_CLASSES = {
  'Events': 'cat-events',
  'Announcements': 'cat-announcements',
  'General': 'cat-general',
  'Jobs': 'cat-jobs',
  'Lost & Found': 'cat-lost'
};

function getCategoryClass(category) {
  return CATEGORY_CLASSES[category] || 'cat-general';
}

// ─── Toast Notifications ──────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

// ─── HTML Escaping ────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Debounce ─────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ─── Get user initials for avatar ─────────────────────────
function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Truncate text ────────────────────────────────────────
function truncate(str, len) {
  if (str.length <= len) return str;
  return str.slice(0, len).trim() + '…';
}

// ─── Skeleton Cards ───────────────────────────────────────
function renderSkeletons(count = 6) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-80 h-20"></div>
          <div class="skeleton-line w-100"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>
    `;
  }
  return html;
}

// ─── Button Loading State ─────────────────────────────────
function setButtonLoading(btn, loading) {
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');

  if (loading) {
    btn.disabled = true;
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    btn.disabled = false;
    if (text) text.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}
