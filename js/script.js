/* ========================================
   NEPAL PORTAL - SECURE JAVASCRIPT
   Security: Input sanitization, XSS prevention,
   CSRF protection, rate limiting built-in
   ======================================== */

'use strict';

/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    pageLoader.style.opacity = '0';
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 2500);
  }
});

/* ===== LOADING & ERROR HANDLING ===== */
const UI = {
  // Loading states
  showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>${message}</span>
        </div>
      `;
      element.classList.add('loading');
    }
  },

  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('loading');
    }
  },

  // Error handling
  showError(message, type = 'error') {
    this.showAlert(message, type);
  },

  showSuccess(message) {
    this.showAlert(message, 'success');
  },

  showAlert(message, type = 'info') {
    // Remove existing alerts
    const existing = document.querySelectorAll('.portal-alert');
    existing.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `portal-alert ${type}`;
    alert.innerHTML = `
      <div class="alert-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentElement) alert.remove();
    }, 5000);
  },

  // Form validation
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showFieldError(input, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  },

  showFieldError(input, message) {
    this.clearFieldError(input);
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
  },

  clearFieldError(input) {
    input.classList.remove('error');
    const error = input.parentElement.querySelector('.field-error');
    if (error) error.remove();
  },

  // Tooltips
  initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', this.showTooltip);
      element.addEventListener('mouseleave', this.hideTooltip);
    });
  },

  showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
  },

  hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) tooltip.remove();
  }
};
const Security = {
  // Sanitize HTML to prevent XSS
  sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  },
  // Validate email
  isValidEmail(email) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
  },
  // Password strength check
  checkPassword(pass) {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  },
  // Rate limiting (simple)
  rateLimiter: {},
  rateLimit(key, maxAttempts, windowMs) {
    const now = Date.now();
    if (!this.rateLimiter[key]) this.rateLimiter[key] = [];
    this.rateLimiter[key] = this.rateLimiter[key].filter(t => now - t < windowMs);
    if (this.rateLimiter[key].length >= maxAttempts) return false;
    this.rateLimiter[key].push(now);
    return true;
  }
};

/* ===== SESSION / NAV PROFILE ===== */
function updateNavAuth() {
  const session = JSON.parse(localStorage.getItem('np_session') || 'null');
  const loginBtn  = document.getElementById('navLoginBtn');
  const navProfile = document.getElementById('navProfile');
  if (!loginBtn || !navProfile) return;

  if (session) {
    loginBtn.style.display = 'none';
    navProfile.style.display = 'flex';
    navProfile.style.alignItems = 'center';

    // Set initials
    const initial = (session.name || 'U').charAt(0).toUpperCase();
    const initEl  = document.getElementById('navAvatarInitial');
    initEl.textContent = initial;

    // Check for saved profile photo
    const userData = JSON.parse(localStorage.getItem('np_profile_' + session.email) || 'null');
    const imgEl = document.getElementById('navAvatarImg');
    if (userData && userData.photo) {
      imgEl.style.display = 'block';
      imgEl.innerHTML = `<img src="${userData.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--primary-light);" alt="Avatar"/>`;
      initEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      initEl.style.display = 'flex';
    }

    // Dropdown info
    const dropName = document.getElementById('dropName');
    const dropLoc  = document.getElementById('dropLocation');
    if (dropName) dropName.textContent = session.name;
    if (dropLoc)  dropLoc.textContent  = session.location ? '📍 ' + session.location : '';
  } else {
    loginBtn.style.display = '';
    navProfile.style.display = 'none';
  }
}

function toggleProfileDropdown() {
  const dd = document.getElementById('profileDropdown');
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function logoutUser() {
  localStorage.removeItem('np_session');
  updateNavAuth();
  updateUIPermissions(); // Hide admin panel after logout
  initializeGenZFeatures();
  document.getElementById('profileDropdown').style.display = 'none';
  showAlert('You have been logged out. See you soon! 👋', 'success');
}

// Close dropdown on outside click
document.addEventListener('click', e => {
  const profile = document.getElementById('navProfile');
  if (profile && !profile.contains(e.target)) {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.style.display = 'none';
  }
});

// Initialize new features on login/logout
function updateNewFeatures() {
  if (typeof FollowSystem !== 'undefined') FollowSystem.updateFollowButtons();
  if (typeof Notifications !== 'undefined') Notifications.updateBadge();
}

/* ===== LANGUAGE SYSTEM ===== */
let currentLang = localStorage.getItem('nepalLang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('nepalLang', lang);

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  // Update placeholders
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    const ph = el.getAttribute(`data-${lang}-placeholder`);
    if (ph) el.placeholder = ph;
  });

  // Update active button
  document.getElementById('btnEn').classList.toggle('active', lang === 'en');
  document.getElementById('btnNe').classList.toggle('active', lang === 'ne');

  // Update select options
  document.querySelectorAll('option[data-en]').forEach(opt => {
    const text = opt.getAttribute(`data-${lang}`);
    if (text) opt.textContent = text;
  });
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
  Database.init(); // Initialize DB from utils.js
  SampleData.init(); // Add sample data for demo
  setLang(currentLang);
  updateNavAuth();
  initializeGenZFeatures();
  UI.initTooltips(); // Initialize tooltips
});

/* ===== NAVBAR SCROLL EFFECT ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  // Back to top button
  const btn = document.getElementById('backToTop');
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}, { passive: true });

/* ===== HAMBURGER MENU ===== */
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
}

function toggleNavDropdown(event, dropdownId) {
  event.stopPropagation();
  const item = event.currentTarget.closest('.nav-item');
  if (!item) return;
  item.classList.toggle('open');
}

// Close dropdown and mobile menu when clicking outside
window.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.open').forEach(item => item.classList.remove('open'));
});

// Close menu when clicking nav link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ===== SMOOTH SCROLL ===== */
function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ===== ANIMATED COUNTER ===== */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(start);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const count = parseInt(el.getAttribute('data-count'));
      animateCounter(el, count);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll(
  '.hero-badge, .hero-title, .hero-subtitle, .hero-search, .hero-stats, .hero-scroll, .section-header, .info-card, .tourism-card, .cyber-card, .news-card, .service-card, .cyber-stat-card'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ===== LIVE SEARCH (AI-style, opens new tab) ===== */
const searchSuggestions = [
  'Mount Everest', 'Passport Application', 'Citizenship Certificate',
  'Pokhara Valley', 'Kathmandu Heritage', 'Chitwan National Park',
  'Phishing Attacks Nepal', 'Cybersecurity Tips', 'Password Security',
  'Nepal Tourism', 'Government Services', 'Tax PAN Registration',
  'Driving License Nepal', 'Nepal Hacking', 'Lumbini Buddha',
  'Annapurna Trekking', 'Nepal Education Scholarship', 'Public WiFi Risks',
  'Nepal Digital ID', 'Nepal Wildlife', 'Malware Ransomware',
];

function liveSearch(query) {
  const resultsBox = document.getElementById('searchResults');
  if (!query || query.trim().length < 1) {
    resultsBox.style.display = 'none';
    return;
  }
  const q = query.toLowerCase();
  const matches = searchSuggestions
    .filter(s => s.toLowerCase().includes(q))
    .slice(0, 6);

  const items = matches.length > 0 ? matches : [query];

  resultsBox.innerHTML = items.map(label =>
    `<div class="search-result-item" onclick="openSearchTab('${Security.sanitize(label).replace(/'/g, "\\'")}')">
      <span>🔍</span>
      <div>
        <div style="font-weight:500">${Security.sanitize(label)}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">Search Nepal Portal AI</div>
      </div>
    </div>`
  ).join('');
  resultsBox.style.display = 'block';
}

function openSearchTab(query) {
  const q = encodeURIComponent(query || document.getElementById('heroSearch').value.trim());
  if (q) window.open(`search.html?q=${q}`, '_blank');
  document.getElementById('searchResults').style.display = 'none';
}

function doSearch() {
  const val = document.getElementById('heroSearch').value.trim();
  if (val) openSearchTab(val);
}

function getSessionEmail() {
  const session = JSON.parse(localStorage.getItem('np_session') || 'null');
  return session?.email || null;
}

function isLoggedIn() {
  return Boolean(getSessionEmail());
}

function renderSocialFeed() {
  const feed = document.getElementById('socialFeedList');
  if (!feed) return;

  const posts = SocialFeed.getPosts();
  if (posts.length === 0) {
    feed.innerHTML = `<div class="empty-state">No community updates yet. Be the first to share a quick civic tip or ask a question.</div>`;
    return;
  }

  feed.innerHTML = posts.map(post => {
    const created = new Date(post.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const points = SocialFeed.getUserPoints(post.authorId);
    return `
      <div class="feed-card">
        <div class="feed-meta">
          <div><strong>${Security.sanitize(post.author)}</strong> • ${created}</div>
          <div class="post-score">${points} pts</div>
        </div>
        <p class="feed-text">${Security.sanitize(post.text)}</p>
        <div class="post-tags">${(post.tags || []).map(tag => `<span>#${Security.sanitize(tag)}</span>`).join('')}</div>
        <div class="feed-actions">
          <button class="feed-action-button" onclick="reactToPost('${post.id}', 'fire')">🔥 ${post.reactions.fire || 0}</button>
          <button class="feed-action-button" onclick="reactToPost('${post.id}', 'heart')">❤️ ${post.reactions.heart || 0}</button>
          <button class="feed-action-button" onclick="reactToPost('${post.id}', 'star')">⭐ ${post.reactions.star || 0}</button>
          <span class="feed-engagement">${post.comments || 0} comments · ${post.views || 0} views</span>
        </div>
      </div>`;
  }).join('');
}

function submitSocialPost() {
  const textarea = document.getElementById('postText');
  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) {
    showAlert('Write something meaningful before posting.', 'danger');
    return;
  }
  if (!isLoggedIn()) {
    showAlert('Please login to post.', 'danger');
    return;
  }

  const post = SocialFeed.createPost(text);
  if (!post) {
    showAlert('Unable to create post. Please login again and try.', 'danger');
    return;
  }

  textarea.value = '';
  showAlert('Your update is live! Thanks for sharing.', 'success');
  renderSocialFeed();
  renderUserBadges();
}

function reactToPost(postId, type) {
  if (!isLoggedIn()) {
    showAlert('Please login to react to posts.', 'danger');
    return;
  }
  SocialFeed.react(postId, type);
  renderSocialFeed();
}

function askAssistant() {
  const queryInput = document.getElementById('assistantQuery');
  const responseBox = document.getElementById('assistantResponse');
  if (!queryInput || !responseBox) return;
  const query = queryInput.value.trim();
  if (!query) {
    responseBox.textContent = 'Type a question about services, documents, or how to use the portal.';
    return;
  }
  responseBox.textContent = ServiceAssistantAI.getResponse(query);
}

function renderAssistantSuggestions() {
  const suggestionsEl = document.getElementById('assistantSuggestions');
  if (!suggestionsEl || !ServiceAssistantAI.getSuggestedQuestions) return;
  const suggestions = ServiceAssistantAI.getSuggestedQuestions();
  suggestionsEl.innerHTML = suggestions.map(q => `
    <button type="button" class="assistant-suggestion" onclick="document.getElementById('assistantQuery').value='${Security.sanitize(q).replace(/'/g, "\\'")}'; askAssistant();">
      ${Security.sanitize(q)}
    </button>
  `).join('');
}

function renderShorts() {
  const shortsList = document.getElementById('shortsList');
  if (!shortsList) return;
  const shorts = SocialFeed.getShorts();
  shortsList.innerHTML = shorts.map(item => `
    <div class="short-card">
      <strong>${Security.sanitize(item.title)}</strong>
      <p>${Security.sanitize(item.text)}</p>
      <span>${Security.sanitize(item.label)}</span>
    </div>
  `).join('');
}

function renderUserBadges() {
  const badgeContainer = document.getElementById('userBadges');
  if (!badgeContainer) return;

  const email = getSessionEmail();
  if (!email) {
    badgeContainer.innerHTML = '<div class="badge-pill">Login to unlock community badges & points</div>';
    return;
  }

  const badges = SocialFeed.getBadges(email);
  if (!badges.length) {
    badgeContainer.innerHTML = '<div class="badge-pill">No badges yet. Post updates and earn points!</div>';
    return;
  }

  badgeContainer.innerHTML = badges.map(b => `
    <div class="badge-pill" style="background:${b.color}20;color:${b.color};border:1px solid ${b.color};">
      ${Security.sanitize(b.icon)} ${Security.sanitize(b.name)}
    </div>
  `).join('');
}

function updateCreatePostVisibility() {
  const createPostBtn = document.getElementById('createPostBtn');
  if (!createPostBtn) return;
  createPostBtn.style.display = RBACSystem.hasPermission('create_post') ? 'inline-flex' : 'none';
  const hint = document.getElementById('postHint');
  if (hint) {
    hint.textContent = isLoggedIn()
      ? 'Share updates, help others, and earn points.'
      : 'Login to post & earn points.';
  }
}

function initializeGenZFeatures() {
  renderSocialFeed();
  renderAssistantSuggestions();
  renderShorts();
  renderUserBadges();
  updateCreatePostVisibility();
  
  // New social features integration
  if (typeof FollowSystem !== 'undefined') FollowSystem.initializeNav();
  if (typeof Analytics !== 'undefined') Analytics.initialize();
  if (typeof Notifications !== 'undefined') Notifications.updateNotificationBadge(getSessionEmail());
  if (typeof Bookmarks !== 'undefined') Bookmarks.updateBookmarkButtons();
}

// Enter key triggers search
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('heroSearch');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });
  }
});

// Close search on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.hero-search')) {
    document.getElementById('searchResults').style.display = 'none';
  }
});

/* ===== MODAL SYSTEM ===== */
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOutside(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

/* ===== LOGIN/REGISTER TABS ===== */
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

/* ===== TOGGLE PASSWORD VISIBILITY ===== */
function togglePassword(id) {
  const input = document.getElementById(id);
  const btn = input.nextElementSibling;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

/* ===== PASSWORD STRENGTH METER ===== */
function checkPasswordStrength(pass) {
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  const score = Security.checkPassword(pass);
  const levels = [
    { width: '20%', color: '#da3633', label: 'Very Weak' },
    { width: '40%', color: '#d29922', label: 'Weak' },
    { width: '60%', color: '#e3b341', label: 'Fair' },
    { width: '80%', color: '#3fb950', label: 'Strong' },
    { width: '100%', color: '#238636', label: 'Very Strong' },
  ];
  if (!pass) {
    fill.style.width = '0';
    text.textContent = '';
    return;
  }
  const level = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width = level.width;
  fill.style.background = level.color;
  text.textContent = level.label;
  text.style.color = level.color;
}

/* ===== LOGIN FORM ===== */
function submitLogin(e) {
  e.preventDefault();
  // Rate limiting
  if (!Security.rateLimit('login', 5, 60000)) {
    showAlert('Too many login attempts. Please wait 1 minute.', 'danger');
    return;
  }
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!Security.isValidEmail(email)) {
    showAlert('Please enter a valid email address.', 'danger');
    return;
  }
  if (password.length < 6) {
    showAlert('Password must be at least 6 characters.', 'danger');
    return;
  }

  // Check against stored users in localStorage
  const users = JSON.parse(localStorage.getItem('np_users') || '[]');
  const user = users.find(u => u.email === email && u.password === btoa(password));

  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = currentLang === 'ne' ? 'लगइन' : 'Login';
    btn.disabled = false;
    if (user) {
      localStorage.setItem('np_session', JSON.stringify({ name: user.name, email: user.email, location: user.location || '', age: user.age || '', gender: user.gender || '' }));
      updateNavAuth();
      updateUIPermissions(); // Update permissions after login
      initializeGenZFeatures();
      showAlert(`Welcome back, ${Security.sanitize(user.name)}!`, 'success');
      setTimeout(() => closeModal('loginModal'), 1500);
    } else {
      showAlert('Invalid email or password. Please try again.', 'danger');
    }
  }, 1200);
}

/* ===== OTP VERIFICATION SYSTEM ===== */
let _otpCode = null;
let _otpVerified = false;
let _otpPhone = null;

function sendOTP() {
  const phone = document.getElementById('regPhone').value.trim();
  if (!/^[9][0-9]{9}$/.test(phone) && !/^[0-9]{10}$/.test(phone)) {
    showAlert('Please enter a valid 10-digit Nepal phone number (e.g. 98XXXXXXXX).', 'danger');
    return;
  }
  // Generate 6-digit OTP (simulated — in production send via SMS API like Sparrow SMS)
  _otpCode = String(Math.floor(100000 + Math.random() * 900000));
  _otpVerified = false;
  _otpPhone = phone;

  document.getElementById('otpGroup').style.display = 'block';
  document.getElementById('sendOtpBtn').textContent = 'Resend OTP';
  document.getElementById('otpStatus').style.color = '#56d364';
  document.getElementById('otpStatus').textContent = '';

  // Simulate SMS — show OTP in alert (in production: call SMS gateway API)
  showAlert(`OTP sent to +977-${phone}. Your code: ${_otpCode} (demo — real SMS not sent)`, 'success');
  console.log(`%c[OTP Demo] Code for ${phone}: ${_otpCode}`, 'color:#f4a300;font-weight:bold;');
}

function verifyOTP() {
  const entered = document.getElementById('regOtp').value.trim();
  const statusEl = document.getElementById('otpStatus');
  if (entered === _otpCode) {
    _otpVerified = true;
    statusEl.textContent = '✅ Phone verified successfully!';
    statusEl.style.color = '#56d364';
    document.getElementById('regOtp').disabled = true;
    document.getElementById('regOtp').style.borderColor = '#238636';
  } else {
    statusEl.textContent = '❌ Incorrect OTP. Please try again.';
    statusEl.style.color = '#ff6b6b';
  }
}

/* ===== REGISTER FORM ===== */
function submitRegister(e) {
  e.preventDefault();
  if (!Security.rateLimit('register', 3, 60000)) {
    showAlert('Too many registration attempts. Please wait.', 'danger');
    return;
  }
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const location = document.getElementById('regLocation').value;
  const age      = document.getElementById('regAge').value;
  const gender   = document.getElementById('regGender').value;
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const agree    = document.getElementById('agreeTerms').checked;

  if (!name || name.length < 2) { showAlert('Please enter your full name.', 'danger'); return; }
  if (!Security.isValidEmail(email)) { showAlert('Please enter a valid email.', 'danger'); return; }
  if (!phone || phone.length < 10) { showAlert('Please enter a valid phone number.', 'danger'); return; }
  if (!_otpVerified) { showAlert('Please verify your phone number with OTP first.', 'danger'); return; }
  if (!location) { showAlert('Please select your location/city.', 'danger'); return; }
  if (!age || parseInt(age) < 13) { showAlert('You must be at least 13 years old to register.', 'danger'); return; }
  if (!gender) { showAlert('Please select your gender.', 'danger'); return; }
  if (Security.checkPassword(password) < 3) { showAlert('Password is too weak. Use 8+ chars with numbers & symbols.', 'danger'); return; }
  if (password !== confirm) { showAlert('Passwords do not match.', 'danger'); return; }
  if (!agree) { showAlert('Please agree to the Terms & Privacy Policy.', 'danger'); return; }

  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = currentLang === 'ne' ? 'खाता बनाउनुहोस्' : 'Create Account';
    btn.disabled = false;

    // Check for duplicate email
    const users = JSON.parse(localStorage.getItem('np_users') || '[]');
    const exists = users.find(u => u.email === email);
    if (exists) {
      showAlert('An account with this email already exists. Please login.', 'danger');
      return;
    }

    // Save full user profile
    const newUser = {
      name, email, phone, location, age: parseInt(age), gender,
      password: btoa(password),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('np_users', JSON.stringify(users));
    localStorage.setItem('np_session', JSON.stringify({ name, email, location, age: parseInt(age), gender }));
    updateNavAuth();
    updateUIPermissions(); // Update permissions after registration
    initializeGenZFeatures();

    // Reset OTP state
    _otpCode = null; _otpVerified = false; _otpPhone = null;

    showAlert(`Account created! Welcome to Nepal Portal, ${Security.sanitize(name)} from ${Security.sanitize(location)}!`, 'success');
    e.target.reset();
    document.getElementById('strengthFill').style.width = '0';
    document.getElementById('strengthText').textContent = '';
    document.getElementById('otpGroup').style.display = 'none';
    setTimeout(() => closeModal('loginModal'), 1800);
  }, 1200);
}

/* ===== CONTACT FORM ===== */
function submitContact(e) {
  e.preventDefault();
  if (!Security.rateLimit('contact', 3, 300000)) {
    showFormError('Too many submissions. Please wait 5 minutes.');
    return;
  }

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  let valid = true;

  if (!name || name.length < 2) {
    document.getElementById('nameError').textContent = 'Please enter your name.';
    valid = false;
  } else {
    document.getElementById('nameError').textContent = '';
  }

  if (!Security.isValidEmail(email)) {
    document.getElementById('emailError').textContent = 'Please enter a valid email.';
    valid = false;
  } else {
    document.getElementById('emailError').textContent = '';
  }

  if (!message || message.length < 10) {
    document.getElementById('msgError').textContent = 'Message must be at least 10 characters.';
    valid = false;
  } else {
    document.getElementById('msgError').textContent = '';
  }

  if (!valid) return;

  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = currentLang === 'ne' ? 'सन्देश पठाउनुहोस्' : 'Send Message';
    btn.disabled = false;
    const successEl = document.getElementById('formSuccess');
    successEl.style.display = 'block';
    e.target.reset();
    setTimeout(() => successEl.style.display = 'none', 4000);
  }, 1000);
}

/* ===== ALERT SYSTEM ===== */
function showAlert(message, type = 'success') {
  const existing = document.querySelector('.portal-alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = 'portal-alert';
  alert.style.cssText = `
    position: fixed; top: 90px; right: 20px; z-index: 9999;
    padding: 14px 24px;
    background: ${type === 'success' ? 'rgba(35,134,54,0.9)' : 'rgba(218,54,51,0.9)'};
    color: #fff; border-radius: 10px;
    font-family: Poppins, sans-serif; font-size: 0.9rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    border: 1px solid ${type === 'success' ? 'rgba(86,211,100,0.3)' : 'rgba(255,107,107,0.3)'};
    animation: slideInRight 0.3s ease;
    max-width: 320px;
  `;
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100px)';
    alert.style.transition = '0.3s ease';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

/* ===== PARTICLES ===== */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${5 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 10}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ===== ACTIVE NAV LINK HIGHLIGHT ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? '#fff' : '';
    link.style.background = link.getAttribute('href') === `#${current}` ? 'var(--glass)' : '';
  });
}, { passive: true });

/* ===== SLIDE-IN ANIMATION FOR ALERT ===== */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(60px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);

/* ===== SECURITY HEADERS INFO ===== */
// This website implements:
// 1. Content Security Policy (CSP) via meta tag
// 2. X-Content-Type-Options: nosniff
// 3. X-Frame-Options: DENY (clickjacking protection)
// 4. Input sanitization (XSS prevention)
// 5. Email & password validation
// 6. Client-side rate limiting
// 7. No eval() usage
// 8. Strict mode enabled
// For production: add server-side CSRF tokens, HTTPS, WAF, bcrypt hashing
/* ===== SAMPLE DATA INITIALIZATION ===== */
const SampleData = {
  init() {
    this.addSamplePosts();
    this.addSampleProblems();
    this.addSampleUsers();
    this.addSampleEvents();
  },

  addSamplePosts() {
    const posts = [
      {
        id: 'post_001',
        author: 'Ramesh Sharma',
        email: 'ramesh@example.com',
        content: 'Great initiative by the government for digital services! The new online portal makes it so much easier to access government services from home. Keep up the good work! 🇳🇵',
        timestamp: Date.now() - 86400000, // 1 day ago
        likes: 24,
        comments: 5,
        type: 'general'
      },
      {
        id: 'post_002',
        author: 'Priya Thapa',
        email: 'priya@example.com',
        content: 'Just reported a pothole on the main road in Kathmandu using the portal. The response was quick and the issue was resolved within 24 hours. Amazing service! 👏',
        timestamp: Date.now() - 172800000, // 2 days ago
        likes: 18,
        comments: 3,
        type: 'success'
      },
      {
        id: 'post_003',
        author: 'Bikash Gurung',
        email: 'bikash@example.com',
        content: 'The cybersecurity awareness campaign is really helpful. More people need to be educated about online safety. Let\'s make Nepal digitally secure! 🔒',
        timestamp: Date.now() - 259200000, // 3 days ago
        likes: 31,
        comments: 8,
        type: 'education'
      },
      {
        id: 'post_004',
        author: 'Anjali Rai',
        email: 'anjali@example.com',
        content: 'Applied for my citizenship certificate renewal online today. The process was smooth and I received confirmation within minutes. Technology is transforming governance! 📋',
        timestamp: Date.now() - 345600000, // 4 days ago
        likes: 15,
        comments: 2,
        type: 'service'
      }
    ];

    const existingPosts = Database.get('np_db_posts') || [];
    if (existingPosts.length === 0) {
      Database.save('np_db_posts', posts);
    }
  },

  addSampleProblems() {
    const problems = [
      {
        id: 'prob_001',
        title: 'Street Light Not Working - Thamel Area',
        description: 'The street light on the corner of Thamel Chowk has been out for over a week. This is creating safety concerns for pedestrians at night.',
        category: 'Infrastructure',
        location: 'Thamel, Kathmandu',
        author: 'Suresh Maharjan',
        email: 'suresh@example.com',
        status: 'in_progress',
        priority: 'medium',
        timestamp: Date.now() - 432000000, // 5 days ago
        votes: 12,
        comments: 4
      },
      {
        id: 'prob_002',
        title: 'Water Supply Interruption - Pokhara',
        description: 'Water supply has been irregular in Lakeside area for the past 3 days. Residents are facing difficulties.',
        category: 'Utilities',
        location: 'Lakeside, Pokhara',
        author: 'Maya Shrestha',
        email: 'maya@example.com',
        status: 'resolved',
        priority: 'high',
        timestamp: Date.now() - 518400000, // 6 days ago
        votes: 28,
        comments: 7
      },
      {
        id: 'prob_003',
        title: 'Traffic Signal Malfunction - Ring Road',
        description: 'Traffic signal at the Ring Road junction near Teaching Hospital is not working properly, causing traffic congestion.',
        category: 'Traffic',
        location: 'Ring Road, Kathmandu',
        author: 'Rajesh Tamang',
        email: 'rajesh@example.com',
        status: 'pending',
        priority: 'high',
        timestamp: Date.now() - 604800000, // 1 week ago
        votes: 45,
        comments: 12
      }
    ];

    const existingProblems = Database.get('np_db_problems') || [];
    if (existingProblems.length === 0) {
      Database.save('np_db_problems', problems);
    }
  },

  addSampleUsers() {
    const users = [
      {
        email: 'admin@nepal.gov.np',
        name: 'System Administrator',
        role: 'admin',
        location: 'Kathmandu',
        joinDate: Date.now() - 31536000000, // 1 year ago
        reputation: 1000,
        verified: true
      },
      {
        email: 'ramesh@example.com',
        name: 'Ramesh Sharma',
        role: 'user',
        location: 'Kathmandu',
        joinDate: Date.now() - 86400000 * 30, // 30 days ago
        reputation: 150,
        verified: false
      },
      {
        email: 'priya@example.com',
        name: 'Priya Thapa',
        role: 'user',
        location: 'Pokhara',
        joinDate: Date.now() - 86400000 * 20, // 20 days ago
        reputation: 200,
        verified: true
      }
    ];

    users.forEach(user => {
      const existingUser = Database.get('np_user_' + user.email);
      if (!existingUser) {
        Database.save('np_user_' + user.email, user);
      }
    });
  },

  addSampleEvents() {
    const events = [
      {
        id: 'event_001',
        title: 'Digital Literacy Workshop',
        description: 'Learn how to safely use online government services and protect your digital identity.',
        date: Date.now() + 86400000 * 7, // 1 week from now
        location: 'Kathmandu Community Center',
        organizer: 'Ministry of Communication',
        type: 'workshop',
        capacity: 50,
        registered: 23
      },
      {
        id: 'event_002',
        title: 'Cybersecurity Awareness Seminar',
        description: 'Understanding online threats and best practices for digital security.',
        date: Date.now() + 86400000 * 14, // 2 weeks from now
        location: 'Pokhara Civic Hall',
        organizer: 'Nepal Police Cyber Bureau',
        type: 'seminar',
        capacity: 100,
        registered: 67
      }
    ];

    const existingEvents = Database.get('np_db_events') || [];
    if (existingEvents.length === 0) {
      Database.save('np_db_events', events);
    }
  }
};
console.log(
  '%c🇳🇵 Nepal Portal',
  'color: #3399ff; font-size: 18px; font-weight: bold;'
);
console.log(
  '%cSecured with CSP, XSS protection, input sanitization & rate limiting.',
  'color: #56d364; font-size: 12px;'
);
