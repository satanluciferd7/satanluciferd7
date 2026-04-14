// ============= LEADERBOARD MODULE =============
// Handles leaderboards, rankings, and achievement tracking

const Leaderboards = {
  // Get reputation leaderboard
  getReputationLeaderboard(limit = 20) {
    return Profiles.getLeaderboard(limit);
  },

  // Get contributors leaderboard
  getContributorsLeaderboard(limit = 20) {
    return Profiles.getTopContributors(limit);
  },

  // Get followers leaderboard
  getFollowersLeaderboard(limit = 20) {
    return Profiles.getAllProfiles()
      .map(p => ({
        ...p,
        followerCount: FollowSystem.getFollowerCount(p.email)
      }))
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, limit);
  },

  // Get problem reporters (most reported issues)
  getTopProblemReporters(limit = 20) {
    const problems = Database.get('np_db_problems') || [];
    const reporters = {};

    problems.forEach(p => {
      const author = p.author || p.authorId;
      reporters[author] = (reporters[author] || 0) + 1;
    });

    return Object.entries(reporters)
      .map(([email, count]) => ({
        ...Profiles.getUserProfile(email),
        problemsReported: count
      }))
      .sort((a, b) => b.problemsReported - a.problemsReported)
      .slice(0, limit);
  },

  // Get active community members
  getActiveCommunityMembers(limit = 20, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const posts = Database.get('np_db_posts') || [];
    const activity = {};

    posts.forEach(p => {
      if (new Date(p.timestamp) > cutoffDate) {
        const author = p.author || p.authorId;
        activity[author] = (activity[author] || 0) + 1;
      }
    });

    return Object.entries(activity)
      .map(([email, count]) => ({
        ...Profiles.getUserProfile(email),
        postsInPeriod: count
      }))
      .sort((a, b) => b.postsInPeriod - a.postsInPeriod)
      .slice(0, limit);
  },

  // Get user rank
  getUserRank(userEmail, leaderboardType = 'reputation') {
    let leaderboard;

    if (leaderboardType === 'reputation') {
      leaderboard = this.getReputationLeaderboard(100);
    } else if (leaderboardType === 'contributors') {
      leaderboard = this.getContributorsLeaderboard(100);
    } else if (leaderboardType === 'followers') {
      leaderboard = this.getFollowersLeaderboard(100);
    } else {
      leaderboard = this.getTopProblemReporters(100);
    }

    const rank = leaderboard.findIndex(u => u.email === userEmail);
    return rank >= 0 ? rank + 1 : null;
  },

  // Get user percentile
  getUserPercentile(userEmail, leaderboardType = 'reputation') {
    let leaderboard;

    if (leaderboardType === 'reputation') {
      leaderboard = this.getReputationLeaderboard(1000);
    } else if (leaderboardType === 'contributors') {
      leaderboard = this.getContributorsLeaderboard(1000);
    } else if (leaderboardType === 'followers') {
      leaderboard = this.getFollowersLeaderboard(1000);
    } else {
      leaderboard = this.getTopProblemReporters(1000);
    }

    const userRank = leaderboard.findIndex(u => u.email === userEmail);
    if (userRank < 0) return 0;

    const percentile = ((leaderboard.length - userRank) / leaderboard.length) * 100;
    return Math.round(percentile);
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard(limit = 10) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const posts = Database.get('np_db_posts') || [];
    const weeklyActivity = {};

    posts.forEach(p => {
      if (new Date(p.timestamp) > cutoffDate) {
        const author = p.author || p.authorId;
        weeklyActivity[author] = (weeklyActivity[author] || 0) + 1;
      }
    });

    return Object.entries(weeklyActivity)
      .map(([email, count]) => ({
        ...Profiles.getUserProfile(email),
        weeklyPosts: count
      }))
      .sort((a, b) => b.weeklyPosts - a.weeklyPosts)
      .slice(0, limit);
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard(limit = 10) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const posts = Database.get('np_db_posts') || [];
    const monthlyActivity = {};

    posts.forEach(p => {
      if (new Date(p.timestamp) > cutoffDate) {
        const author = p.author || p.authorId;
        monthlyActivity[author] = (monthlyActivity[author] || 0) + 1;
      }
    });

    return Object.entries(monthlyActivity)
      .map(([email, count]) => ({
        ...Profiles.getUserProfile(email),
        monthlyPosts: count
      }))
      .sort((a, b) => b.monthlyPosts - a.monthlyPosts)
      .slice(0, limit);
  },

  // Get trending users (gaining followers fast)
  getTrendingUsers(limit = 10, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Profiles.getAllProfiles()
      .map(p => ({
        ...p,
        followers: FollowSystem.getFollowerCount(p.email),
        joinDate: p.joinDate
      }))
      .filter(p => new Date(p.joinDate) > cutoffDate || FollowSystem.getFollowerCount(p.email) > 0)
      .sort((a, b) => b.followers - a.followers)
      .slice(0, limit);
  },

  // Get achievements for user
  getUserAchievements(userEmail) {
    const profile = Profiles.getUserProfile(userEmail);
    const badges = Profiles.getAllUserBadges(userEmail);
    const rank = this.getUserRank(userEmail, 'reputation');

    return {
      badges: badges,
      rank: rank,
      reputation: Profiles.getUserReputation(userEmail),
      posts: profile.posts,
      followers: profile.followers,
      following: profile.following
    };
  },

  // Award badge for milestone
  awardMilestone(userEmail, posts) {
    if (posts === 10) {
      Profiles.addBadge(userEmail, 'active-contributor', 'Active Contributor', 'Posted 10 items', '🚀');
    } else if (posts === 50) {
      Profiles.addBadge(userEmail, 'top-contributor', 'Top Contributor', 'Posted 50 items', '⭐');
    } else if (posts === 100) {
      Profiles.addBadge(userEmail, 'super-contributor', 'Super Contributor', 'Posted 100 items', '💎');
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Leaderboards;
}
