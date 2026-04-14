// ============= ANALYTICS & DASHBOARD MODULE =============
// Handles user dashboards, analytics, and statistics

const Analytics = {
  // Get user dashboard stats
  getUserDashboard(userEmail) {
    const profile = Profiles.getUserProfile(userEmail);
    const posts = Database.get('np_db_posts') || [];
    const userPosts = posts.filter(p => p.author === userEmail || p.authorId === userEmail);

    const bookmarks = Bookmarks.getUserBookmarks(userEmail);
    const unreadMessages = Messaging.getUnreadCount(userEmail);
    const unreadNotifications = Notifications.getUnreadCount(userEmail);
    const following = FollowSystem.getFollowing(userEmail);
    const followers = FollowSystem.getFollowers(userEmail);

    return {
      profile: profile,
      stats: {
        posts: userPosts.length,
        followers: followers.length,
        following: following.length,
        reputation: Profiles.getUserReputation(userEmail),
        bookmarks: bookmarks.length,
        badges: Profiles.getAllUserBadges(userEmail).length
      },
      recent: {
        posts: userPosts.slice(-5),
        unreadMessages: unreadMessages,
        unreadNotifications: unreadNotifications
      },
      activity: this.getUserActivityStats(userEmail),
      leaderboardPosition: Leaderboards.getUserRank(userEmail, 'reputation')
    };
  },

  // Get user activity stats
  getUserActivityStats(userEmail) {
    const posts = Database.get('np_db_posts') || [];
    const userPosts = posts.filter(p => p.author === userEmail || p.authorId === userEmail);

    const today = new Date();
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const postsTodayCount = userPosts.filter(p => new Date(p.timestamp) > today).length;
    const postsWeekCount = userPosts.filter(p => new Date(p.timestamp) > week).length;
    const postsMonthCount = userPosts.filter(p => new Date(p.timestamp) > month).length;

    return {
      today: postsTodayCount,
      week: postsWeekCount,
      month: postsMonthCount,
      total: userPosts.length
    };
  },

  // Get platform-wide analytics
  getPlatformAnalytics() {
    const posts = Database.get('np_db_posts') || [];
    const problems = Database.get('np_db_problems') || [];
    const users = Profiles.getAllProfiles();
    const events = Database.get('np_db_events') || [];

    const today = new Date();
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      users: {
        total: users.length,
        active: users.filter(u => new Date(u.joinDate) > month).length
      },
      posts: {
        total: posts.length,
        today: posts.filter(p => new Date(p.timestamp) > today).length,
        week: posts.filter(p => new Date(p.timestamp) > week).length,
        month: posts.filter(p => new Date(p.timestamp) > month).length
      },
      problems: {
        total: problems.length,
        resolved: problems.filter(p => p.status === 'resolved').length,
        pending: problems.filter(p => p.status === 'pending').length,
        inProgress: problems.filter(p => p.status === 'in-progress').length
      },
      events: {
        total: events.length,
        upcoming: events.filter(e => e.status === 'upcoming').length,
        completed: events.filter(e => e.status === 'completed').length
      },
      engagement: {
        avgPostsPerUser: (posts.length / users.length).toFixed(2),
        avgFollowersPerUser: (users.reduce((sum, u) => sum + (u.followers || 0), 0) / users.length).toFixed(1)
      }
    };
  },

  // Get trending content
  getTrendingContent(limit = 10, days = 7) {
    const cutoffDate = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);
    const posts = Database.get('np_db_posts') || [];

    return posts
      .filter(p => new Date(p.timestamp) > cutoffDate)
      .sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
      .slice(0, limit);
  },

  // Get category statistics
  getCategoryStats() {
    const posts = Database.get('np_db_posts') || [];
    const problems = Database.get('np_db_problems') || [];
    const stats = {};

    // Posts by category
    posts.forEach(p => {
      const cat = p.category || 'uncategorized';
      stats[cat] = (stats[cat] || 0) + 1;
    });

    // Problems by category
    problems.forEach(p => {
      const cat = p.category || 'uncategorized';
      stats[cat] = (stats[cat] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Get location statistics
  getLocationStats() {
    const problems = Database.get('np_db_problems') || [];
    const stats = {};

    problems.forEach(p => {
      const key = `${p.district}/${p.city || 'all'}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([location, count]) => {
        const [district, city] = location.split('/');
        return { district, city: city === 'all' ? null : city, count };
      })
      .sort((a, b) => b.count - a.count);
  },

  // Get time-series data
  getTimeSeriesData(metric = 'posts', days = 30) {
    const data = [];
    const posts = Database.get('np_db_posts') || [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = posts.filter(p => p.timestamp.startsWith(dateStr)).length;
      data.push({ date: dateStr, count: count });
    }

    return data;
  },

  // Get district-wise report
  getDistrictReport(district) {
    const problems = Database.get('np_db_problems') || [];
    const districtProblems = problems.filter(p => p.district === district);

    const categories = {};
    districtProblems.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    return {
      district: district,
      totalProblems: districtProblems.length,
      resolved: districtProblems.filter(p => p.status === 'resolved').length,
      pending: districtProblems.filter(p => p.status === 'pending').length,
      byCategory: categories
    };
  },

  // Generate report
  generateReport(type = 'summary', filters = {}) {
    const report = {
      generatedDate: new Date().toISOString(),
      type: type
    };

    if (type === 'summary') {
      report.data = this.getPlatformAnalytics();
    } else if (type === 'district') {
      report.data = this.getDistrictReport(filters.district);
    } else if (type === 'user') {
      report.data = this.getUserDashboard(filters.userEmail);
    }

    return report;
  },

  // Export analytics as CSV
  exportAsCSV(data) {
    let csv = '';
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';

    data.forEach(row => {
      csv += headers.map(h => row[h]).join(',') + '\n';
    });

    return csv;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
