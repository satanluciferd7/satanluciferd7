/* ============================================
   NEPAL PORTAL - ADVANCED FEATURES v2.0
   Features 1-10 Implementation
   ============================================ */

'use strict';

/* ===== 1. COMMUNITY ENGAGEMENT: Comments & Ratings ===== */
const CommunityFeatures = {
  // Add comment to a post
  addComment(postId, text, author = null) {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    author = author || session?.name || 'Anonymous';
    
    return Comments.add(postId, text, author);
  },

  // Display comments on a post
  displayComments(postId, container) {
    const comments = Comments.getByPost(postId);
    if (!container) return;
    
    let html = `<div class="comments-section">
      <h4>Comments (${comments.length})</h4>`;
    
    comments.forEach(comment => {
      html += `
        <div class="comment-item">
          <div class="comment-author">${comment.author}</div>
          <div class="comment-text">${comment.text}</div>
          <div class="comment-actions">
            <button class="comment-btn" onclick="CommunityFeatures.likeComment('${comment.id}')">
              <i class="fas fa-thumbs-up"></i> Like (${comment.likes || 0})
            </button>
            <button class="comment-btn" onclick="CommunityFeatures.replyComment('${comment.id}')">
              <i class="fas fa-reply"></i> Reply
            </button>
          </div>`;
      
      if (comment.replies && comment.replies.length > 0) {
        html += `<div class="comment-replies">`;
        comment.replies.forEach(reply => {
          html += `<div class="reply-item">
            <strong>${reply.author}</strong>: ${reply.text}
          </div>`;
        });
        html += `</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
  },

  likeComment(commentId) {
    const comments = Database.get('np_db_comments');
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      Database.set('np_db_comments', comments);
    }
  },

  replyComment(commentId, text, author = null) {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    author = author || session?.name || 'Anonymous';
    Comments.addReply(commentId, text, author);
  }
};

/* ===== 2. PROBLEM RESOLUTION TRACKING ===== */
const ProblemTracking = {
  createProblem(data) {
    const problem = Database.add('np_db_problems', {
      ...data,
      status: 'Reported',
      timeline: [{
        status: 'Reported',
        timestamp: new Date().toISOString(),
        message: 'Problem reported'
      }],
      views: 0,
      supportCount: 0
    });
    
    // Track analytics
    Analytics.trackProblem(data.category, data.location);
    
    return problem;
  },

  updateStatus(problemId, newStatus) {
    ProblemStatus.updateStatus(problemId, newStatus);
    
    // Notify relevant users
    if (newStatus === 'Resolved') {
      const problems = Database.get('np_db_problems');
      const problem = problems.find(p => p.id === problemId);
      if (problem) {
        Notifications.add(problem.author, 'problem_resolved', 'Your problem has been resolved', { problemId });
      }
    }
  },

  getTimeline(problemId) {
    return ProblemStatus.getTimeline(problemId);
  },

  addProof(problemId, photo, description) {
    ProblemStatus.addProof(problemId, photo, description);
  }
};

/* ===== 3. ADVANCED SEARCH & DISCOVERY ===== */
const AdvancedSearch = {
  search(query, filters = {}) {
    const problems = Database.get('np_db_problems');
    const posts = Database.get('np_db_posts');
    
    let results = [...problems, ...posts];
    
    // Text search
    if (query) {
      results = results.filter(item => 
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.text?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    results = Search.advancedFilter(results, filters);
    
    // Save search for analytics
    Search.saveSearch(query, filters);
    
    return results;
  },

  getSavedSearches(userId) {
    return Search.getSavedSearches(userId);
  },

  getTrendingSearches() {
    return Search.getTrending(10);
  },

  getSmartSuggestions(query) {
    const problems = Database.get('np_db_problems');
    return problems
      .filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(p => ({ title: p.title, category: p.category }));
  }
};

/* ===== 4. NOTIFICATIONS SYSTEM ===== */
const NotificationSystem = {
  getUnread() {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    if (!session) return [];
    return Notifications.getUnread(session.email);
  },

  markAllRead() {
    const unread = this.getUnread();
    unread.forEach(notif => {
      Notifications.markRead(notif.id);
    });
  },

  subscribeToUpdates(userId, types) {
    Notifications.subscribe(userId, types);
  },

  displayNotifications(container) {
    const notifs = this.getUnread();
    if (!container) return;
    
    let html = '<div class="notifications-panel">';
    
    if (notifs.length === 0) {
      html += '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No new notifications</p>';
    } else {
      notifs.forEach(notif => {
        html += `
          <div class="notification-item notification-${notif.type}">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-time">${new Date(notif.createdAt).toLocaleDateString()}</div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Update badge
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (notifs.length > 0) {
        badge.textContent = notifs.length;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }
};

/* ===== 5. GOVERNMENT SERVICE GUIDES ===== */
// Already implemented in service-wizard.js

/* ===== 6. STATS & INSIGHTS DASHBOARD ===== */
const InsightsDashboard = {
  getDistrictStats(district) {
    const problems = Database.get('np_db_problems').filter(p => p.location === district);
    const stats = Analytics.getProblemsByDistrict(district);
    const avgResponseTime = Analytics.getAverageResponseTime(district);
    
    return {
      totalProblems: problems.length,
      resolved: problems.filter(p => p.status === 'Resolved').length,
      categories: stats,
      avgResponseTime,
      resolutionRate: problems.length > 0 
        ? ((problems.filter(p => p.status === 'Resolved').length / problems.length) * 100).toFixed(1)
        : 0
    };
  },

  getMostCommonProblems(limit = 5) {
    return Analytics.getMostCommonProblems(limit);
  },

  getUserStats(userId) {
    const posts = Database.get('np_db_posts').filter(p => p.author === userId);
    const problems = Database.get('np_db_problems').filter(p => p.author === userId);
    const reputation = Rating.getUserReputation(userId);
    const badges = Rating.getBadges(userId);
    
    return {
      postsCreated: posts.length,
      problemsReported: problems.length,
      reputation,
      badges,
      totalEngagement: posts.length + problems.length
    };
  },

  displayDashboard(container) {
    if (!container) return;
    
    const mostCommon = this.getMostCommonProblems(5);
    let html = `
      <div class="insights-dashboard">
        <h3>Community Insights</h3>
        <div class="insight-grid">
    `;
    
    mostCommon.forEach(item => {
      html += `
        <div class="insight-card">
          <div class="insight-label">${item.name}</div>
          <div class="insight-count">${item.count}</div>
          <div class="insight-bar" style="width: ${(item.count / mostCommon[0].count) * 100}%"></div>
        </div>
      `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
  }
};

/* ===== 6.5 SOCIAL FEED & GAMIFICATION ===== */
const SocialFeed = {
  getPosts() {
    return Database.get('np_db_posts')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPost(text) {
    const session = JSON.parse(localStorage.getItem('np_session') || 'null');
    if (!session) return null;
    const post = Database.add('np_db_posts', {
      author: session.name || session.email,
      authorId: session.email,
      text: Security.sanitize(text),
      reactions: { fire: 0, heart: 0, star: 0 },
      comments: 0,
      views: 0,
      tags: ['community', 'gov', 'genz'],
      createdAt: new Date().toISOString()
    });

    return post;
  },

  react(postId, type) {
    const posts = Database.get('np_db_posts');
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.reactions = post.reactions || { fire: 0, heart: 0, star: 0 };
    post.reactions[type] = (post.reactions[type] || 0) + 1;
    Database.set('np_db_posts', posts);
  },

  getUserPoints(userEmail) {
    if (!userEmail) return 0;
    const posts = Database.get('np_db_posts').filter(p => p.authorId === userEmail);
    const score = posts.reduce((sum, post) => {
      const reactions = post.reactions || {};
      return sum + (reactions.fire || 0) * 10 + (reactions.heart || 0) * 8 + (reactions.star || 0) * 6 + (post.comments || 0) * 5 + (post.views || 0) * 1;
    }, 0);
    return score + Rating.getUserReputation(userEmail);
  },

  getShorts() {
    return [
      { title: 'Quick Passport Tip', text: 'Scan documents clearly with good lighting before upload.', label: 'Travel' },
      { title: 'Vote Smart', text: 'Community reporting helps local authorities act faster.', label: 'Civic' },
      { title: 'Cyber Tip', text: 'Use a strong password and enable 2FA for your accounts.', label: 'Security' },
      { title: 'Health Hack', text: 'Keep your medical documents updated on your phone.', label: 'Health' }
    ];
  },

  getBadges(userEmail) {
    return Rating.getBadges(userEmail).slice(0, 3);
  }
};

const ServiceAssistantAI = {
  getResponse(query) {
    const text = String(query || '').trim();
    if (!text) {
      return 'Ask anything about passports, citizenship, health insurance, scholarships, driving licenses, or local government services. Example: "How do I apply for a passport in Nepal?"';
    }

    const normalized = text.toLowerCase();
    if (normalized.includes('passport')) {
      return 'To apply for a passport in Nepal, prepare your citizenship certificate, parents ID (if required), a passport-sized photo, and visit dop.gov.np or your District Administration Office. Start early and book your appointment online when possible.';
    }
    if (normalized.includes('citizenship')) {
      return 'For citizenship registration, submit your birth certificate, parents citizenship documents, and fill the application at the District Administration Office or local ward. Processing can take 15-30 days depending on your district.';
    }
    if (normalized.includes('driving')) {
      return 'For a driving license, complete your learner permit, pass both the written and practical tests, and submit a medical certificate. Check your local transport office for test schedules and required documents.';
    }
    if (normalized.includes('scholarship')) {
      return 'Search scholarship programs by university or field. Many require transcripts, citizenship documents, recommendation letters, and an application form. Start with TU, PU, KU and government education portals.';
    }
    if (normalized.includes('health')) {
      return 'National Health Insurance covers government healthcare services. Register online or visit your nearest health post with your citizenship certificate and family details to enroll.';
    }
    if (normalized.includes('tax') || normalized.includes('pan')) {
      return 'PAN registration is required for tax filing. Visit ird.gov.np, complete the PAN application, and submit supporting documents like citizenship and proof of address.';
    }
    if (normalized.includes('online') || normalized.includes('service') || normalized.includes('help')) {
      return 'This portal helps with civic services, documentation, scholarships, travel permits, and digital safety. Ask a specific question like "How do I renew my passport?" or "What documents do I need for citizenship?"';
    }

    return 'Great question! This portal helps with services, eligibility, documents, and official links. Try asking: "How do I renew my passport?" or "What are the scholarship requirements?"';
  },

  getSuggestedQuestions() {
    return [
      'How do I apply for a passport in Nepal?',
      'What documents are needed for citizenship?',
      'How can I find government scholarships?',
      'How do I register for health insurance?',
      'Where do I get a driving license in Kathmandu?'
    ];
  }
};

/* ===== 8. MOBILE & OFFLINE FEATURES ===== */
const OfflineFeatures = {
  saveForOffline(postId) {
    PWA.saveForOffline(postId);
    showAlert('Saved for offline reading', 'success');
  },

  getOfflinePosts() {
    return PWA.getOfflinePosts();
  },

  isOnline() {
    return navigator.onLine;
  },

  setupOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #ff6b6b;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      display: none;
      z-index: 1000;
      font-size: 0.9rem;
    `;
    document.body.appendChild(indicator);
    
    window.addEventListener('offline', () => {
      indicator.style.display = 'block';
      indicator.textContent = '📡 You are offline. Some features may be limited.';
    });
    
    window.addEventListener('online', () => {
      indicator.style.display = 'none';
      showAlert('You are back online!', 'success');
    });
  }
};

/* ===== 9. CONTENT MODERATION ===== */
const ModerationTools = {
  flagContent(contentId, contentType, reason) {
    Moderation.flagContent(contentId, contentType, reason);
    showAlert(`Content flagged for review (${reason})`, 'success');
  },

  getFlags(status = 'pending') {
    return Moderation.getFlags(status);
  },

  resolveFlag(flagId, action) {
    Moderation.resolveFlag(flagId, action);
  }
};

/* ===== 10. PERFORMANCE & SEO ===== */
const SEOFeatures = {
  updatePageSEO(title, description, keywords, ogImage) {
    SEO.updateMeta(title, description, keywords, ogImage);
  },

  addStructuredData(type, data) {
    SEO.addStructuredData(type, data);
  },

  lazyLoadImages() {
    Performance.lazyLoadImages();
  }
};

/* ===== UI HELPERS ===== */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('light-mode');
  localStorage.setItem('np_darkMode', isDark ? 'light' : 'dark');
}

function toggleNotifications() {
  const panel = document.getElementById('notificationsPanel');
  if (!panel) {
    const newPanel = document.createElement('div');
    newPanel.id = 'notificationsPanel';
    newPanel.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: var(--dark2);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      width: 380px;
      max-height: 500px;
      overflow-y: auto;
      z-index: 998;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(newPanel);
    NotificationSystem.displayNotifications(newPanel);
  } else {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = 'portal-alert';
  alert.style.background = type === 'success' ? 'rgba(35,134,54,0.2)' : type === 'error' ? 'rgba(218,54,51,0.2)' : 'rgba(0,102,204,0.2)';
  alert.style.color = type === 'success' ? '#56d364' : type === 'error' ? '#ff6b6b' : 'var(--primary-light)';
  alert.style.border = type === 'success' ? '1px solid rgba(35,134,54,0.3)' : type === 'error' ? '1px solid rgba(218,54,51,0.3)' : '1px solid rgba(0,102,204,0.3)';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3500);
}

// Dark mode initialization
document.addEventListener('DOMContentLoaded', () => {
  const darkMode = localStorage.getItem('np_darkMode') || 'dark';
  if (darkMode === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Setup offline indicator
  OfflineFeatures.setupOfflineIndicator();
  
  // Initialize all features
  PWA.register();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    CommunityFeatures, 
    ProblemTracking, 
    AdvancedSearch,
    NotificationSystem, 
    InsightsDashboard, 
    CybersecurityTools, 
    SocialFeed,
    ServiceAssistantAI,
    OfflineFeatures,
    ModerationTools, 
    SEOFeatures 
  };
}
