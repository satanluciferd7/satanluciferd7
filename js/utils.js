/* ==========================================
   NEPAL PORTAL - ADVANCED UTILITIES
   Supports all 10 improvement features
   ========================================== */

'use strict';

/* ===== DATA STORAGE & DATABASE SIMULATION ===== */
const Database = {
  // Initialize data structures
  init() {
    if (!localStorage.getItem('np_db_posts')) {
      localStorage.setItem('np_db_posts', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_comments')) {
      localStorage.setItem('np_db_comments', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_votes')) {
      localStorage.setItem('np_db_votes', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_problems')) {
      localStorage.setItem('np_db_problems', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_notifications')) {
      localStorage.setItem('np_db_notifications', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_badges')) {
      localStorage.setItem('np_db_badges', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_searches')) {
      localStorage.setItem('np_db_searches', JSON.stringify([]));
    }
    if (!localStorage.getItem('np_db_analytics')) {
      localStorage.setItem('np_db_analytics', JSON.stringify({}));
    }
  },

  // Generic get/set/add methods
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  add(key, item) {
    const data = this.get(key);
    item.id = Date.now() + Math.random();
    item.createdAt = new Date().toISOString();
    data.push(item);
    this.set(key, data);
    return item;
  },

  update(key, id, updates) {
    const data = this.get(key);
    const index = data.findIndex(i => i.id === id);
    if (index >= 0) {
      data[index] = { ...data[index], ...updates };
      this.set(key, data);
      return data[index];
    }
    return null;
  },

  delete(key, id) {
    const data = this.get(key);
    const filtered = data.filter(i => i.id !== id);
    this.set(key, filtered);
  }
};

/* ===== COMMENT SYSTEM ===== */
const Comments = {
  add(postId, text, author) {
    return Database.add('np_db_comments', {
      postId,
      text: Security.sanitize(text),
      author,
      likes: 0,
      replies: []
    });
  },

  getByPost(postId) {
    return Database.get('np_db_comments').filter(c => c.postId === postId);
  },

  delete(commentId) {
    Database.delete('np_db_comments', commentId);
  },

  addReply(commentId, text, author) {
    const comments = Database.get('np_db_comments');
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.replies.push({
        id: Date.now() + Math.random(),
        text: Security.sanitize(text),
        author,
        createdAt: new Date().toISOString()
      });
      Database.set('np_db_comments', comments);
    }
  }
};

/* ===== VOTING & REPUTATION SYSTEM ===== */
const Rating = {
  vote(postId, userId, type, direction) { // type: 'upvote'|'downvote', direction: 1|-1
    const votes = Database.get('np_db_votes');
    const existing = votes.find(v => v.postId === postId && v.userId === userId && v.type === type);
    
    if (existing) {
      if (existing.direction === direction) {
        Database.delete('np_db_votes', existing.id); // Remove vote
      } else {
        Database.update('np_db_votes', existing.id, { direction });
      }
    } else {
      Database.add('np_db_votes', { postId, userId, type, direction });
    }
  },

  getScore(postId) {
    const votes = Database.get('np_db_votes').filter(v => v.postId === postId);
    const upvotes = votes.filter(v => v.direction > 0).length;
    const downvotes = votes.filter(v => v.direction < 0).length;
    return upvotes - downvotes;
  },

  getUserReputation(userId) {
    const posts = Database.get('np_db_posts').filter(p => p.authorId === userId || p.author === userId);
    let score = 0;
    posts.forEach(p => {
      score += this.getScore(p.id) * 5; // 5 points per net vote
      score += p.views || 0; // 1 point per view
    });
    return Math.max(0, score);
  },

  getBadges(userId) {
    const rep = this.getUserReputation(userId);
    const badges = [];
    if (rep >= 100) badges.push({ name: 'Rising Star', icon: '⭐', color: '#f4a300' });
    if (rep >= 500) badges.push({ name: 'Community Leader', icon: '👑', color: '#fbbf24' });
    if (rep >= 1000) badges.push({ name: 'Legend', icon: '🏆', color: '#fbbf24' });
    
    const posts = Database.get('np_db_posts').filter(p => p.author === userId);
    if (posts.length >= 10) badges.push({ name: 'Active Contributor', icon: '📢', color: '#3399ff' });
    if (posts.length >= 50) badges.push({ name: 'Top Contributor', icon: '🔥', color: '#ff6b6b' });
    
    return badges;
  }
};

/* ===== PROBLEM RESOLUTION TRACKING ===== */
const ProblemStatus = {
  statuses: ['Reported', 'Authorities Notified', 'Under Review', 'In Progress', 'Resolved', 'Verified'],
  
  updateStatus(problemId, status) {
    Database.update('np_db_problems', problemId, { status });
    // Auto-create timeline entry
    const problems = Database.get('np_db_problems');
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      if (!problem.timeline) problem.timeline = [];
      problem.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        message: `Status changed to ${status}`
      });
      Database.set('np_db_problems', problems);
    }
  },

  getTimeline(problemId) {
    const problems = Database.get('np_db_problems');
    const problem = problems.find(p => p.id === problemId);
    return problem?.timeline || [];
  },

  addProof(problemId, photo, description) {
    Database.update('np_db_problems', problemId, {
      resolutionProof: {
        photo,
        description,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/* ===== NOTIFICATIONS SYSTEM ===== */
const Notifications = {
  add(userId, type, title, data) {
    Database.add('np_db_notifications', {
      userId,
      type, // 'problem_resolved', 'new_comment', 'upvote', etc.
      title,
      data,
      read: false
    });
  },

  getUnread(userId) {
    return Database.get('np_db_notifications')
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  markRead(notificationId) {
    Database.update('np_db_notifications', notificationId, { read: true });
  },

  subscribe(userId, types) {
    const prefs = JSON.parse(localStorage.getItem('np_notification_prefs') || '{}');
    prefs[userId] = types;
    localStorage.setItem('np_notification_prefs', JSON.stringify(prefs));
  },

  canNotify(userId, type) {
    const prefs = JSON.parse(localStorage.getItem('np_notification_prefs') || '{}');
    const userPrefs = prefs[userId] || ['problem_resolved', 'new_comment'];
    return userPrefs.includes(type);
  }
};

/* ===== SEARCH & DISCOVERY ===== */
const Search = {
  saveSearch(query, filters) {
    const searches = Database.get('np_db_searches');
    const userId = JSON.parse(localStorage.getItem('np_session') || 'null')?.email || 'guest';
    const existing = searches.find(s => s.query === query && s.userId === userId);
    
    if (!existing) {
      Database.add('np_db_searches', { query, filters, userId, count: 1 });
    } else {
      Database.update('np_db_searches', existing.id, { count: (existing.count || 1) + 1 });
    }
  },

  getTrending(limit = 10) {
    const searches = Database.get('np_db_searches');
    return searches
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  },

  getSavedSearches(userId) {
    return Database.get('np_db_searches')
      .filter(s => s.userId === userId);
  },

  advancedFilter(items, filters) {
    let results = items;
    
    if (filters.category) {
      results = results.filter(i => i.category === filters.category);
    }
    if (filters.district) {
      results = results.filter(i => i.location === filters.district);
    }
    if (filters.dateFrom) {
      results = results.filter(i => new Date(i.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      results = results.filter(i => new Date(i.createdAt) <= new Date(filters.dateTo));
    }
    
    return results;
  }
};

/* ===== ANALYTICS TRACKING ===== */
const Analytics = {
  trackProblem(category, district) {
    const analytics = Database.get('np_db_analytics');
    const key = `${category}_${district}`;
    analytics[key] = (analytics[key] || 0) + 1;
    Database.set('np_db_analytics', analytics);
  },

  getProblemsByDistrict(district) {
    const analytics = Database.get('np_db_analytics');
    const stats = {};
    Object.keys(analytics).forEach(key => {
      const [category, d] = key.split('_');
      if (d === district) {
        stats[category] = (stats[category] || 0) + analytics[key];
      }
    });
    return stats;
  },

  getMostCommonProblems(limit = 5) {
    const analytics = Database.get('np_db_analytics');
    const categories = {};
    Object.keys(analytics).forEach(key => {
      const category = key.split('_')[0];
      categories[category] = (categories[category] || 0) + analytics[key];
    });
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  },

  getAverageResponseTime(district) {
    // Simulated: average days to resolve problems in a district
    const problems = Database.get('np_db_problems')
      .filter(p => p.location === district && p.status === 'Resolved');
    
    if (problems.length === 0) return 0;
    
    const avgDays = problems.reduce((sum, p) => {
      const created = new Date(p.createdAt);
      const resolved = p.timeline?.find(t => t.status === 'Resolved');
      if (resolved) {
        const days = (new Date(resolved.timestamp) - created) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0) / problems.length;
    
    return Math.round(avgDays * 10) / 10;
  }
};

/* ===== CYBERSECURITY FEATURES ===== */
const Security2 = {
  checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strength = score <= 1 ? 'Weak' : score <= 2 ? 'Fair' : score <= 3 ? 'Good' : score <= 4 ? 'Strong' : 'Very Strong';
    const color = score <= 1 ? '#ff6b6b' : score <= 2 ? '#ffa500' : score <= 3 ? '#f4a300' : score <= 4 ? '#56d364' : '#238636';
    
    return { score, strength, color };
  },

  verifyOfficialEmail(email) {
    const domains = ['gov.np', 'parliament.gov.np', 'moit.gov.np', 'moha.gov.np', 'moe.gov.np'];
    return domains.some(d => email.endsWith('@' + d));
  },

  checkPhishingLikelihood(text) {
    const phishingKeywords = ['verify account', 'confirm password', 'update payment', 'unusual activity', 'click here immediately'];
    const count = phishingKeywords.filter(keyword => text.toLowerCase().includes(keyword)).length;
    return count > 0 ? { risk: 'Medium', keywords: count } : { risk: 'Low', keywords: 0 };
  },

  getSecurityTips() {
    return [
      '🔐 Never share your password with anyone',
      '⚠️ Avoid clicking suspicious links in emails',
      '📧 Verify sender addresses before clicking',
      '🛡️ Use strong passwords (8+ chars, mixed case, numbers, symbols)',
      '💾 Enable two-factor authentication when available'
    ];
  }
};

/* ===== PWA & OFFLINE SUPPORT ===== */
const PWA = {
  register() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
    }
  },

  saveForOffline(postId) {
    const offlineData = JSON.parse(localStorage.getItem('np_offline_posts') || '{}');
    const posts = Database.get('np_db_posts');
    const post = posts.find(p => p.id === postId);
    if (post) {
      offlineData[postId] = post;
      localStorage.setItem('np_offline_posts', JSON.stringify(offlineData));
    }
  },

  getOfflinePosts() {
    return JSON.parse(localStorage.getItem('np_offline_posts') || '{}');
  }
};

/* ===== CONTENT MODERATION ===== */
const Moderation = {
  flagContent(contentId, contentType, reason) {
    Database.add('np_db_flags', {
      contentId,
      contentType, // 'post', 'comment', 'problem'
      reason, // 'spam', 'abuse', 'inappropriate', 'misinformation'
      flaggedBy: JSON.parse(localStorage.getItem('np_session') || 'null')?.email || 'guest',
      status: 'pending' // pending, reviewed, resolved
    });
  },

  getFlags(status = 'pending') {
    if (!localStorage.getItem('np_db_flags')) {
      localStorage.setItem('np_db_flags', JSON.stringify([]));
    }
    return Database.get('np_db_flags').filter(f => f.status === status);
  },

  resolveFlag(flagId, action) {
    Database.update('np_db_flags', flagId, { status: 'resolved', resolvedAction: action });
  }
};

/* ===== SEO & METADATA ===== */
const SEO = {
  updateMeta(title, description, keywords, ogImage) {
    document.title = title;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
    
    // Open Graph
    this.setOG('og:title', title);
    this.setOG('og:description', description);
    this.setOG('og:image', ogImage || 'https://nepal-portal.local/og-image.png');
  },

  setOG(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  },

  addStructuredData(type, data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    });
    document.head.appendChild(script);
  }
};

/* ===== PERFORMANCE OPTIMIZATION ===== */
const Performance = {
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
  },

  cacheAssets() {
    // Cache strategy for static assets
    const assets = ['style.css', 'script.js', 'utils.js'];
    assets.forEach(asset => {
      fetch(asset).catch(err => console.log(`Failed to cache ${asset}`));
    });
  },

  minifyHTML(html) {
    return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Database.init();
  PWA.register();
  Performance.lazyLoadImages();
});
