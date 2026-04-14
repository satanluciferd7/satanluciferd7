// ============= USER PROFILES MODULE =============
// Handles user profiles, avatars, bio, reputation, and user management

const Profiles = {
  // Get or create user profile
  getUserProfile(email) {
    const key = `np_profile_${email}`;
    let profile = Database.get(key);
    
    if (!profile) {
      profile = {
        email: email,
        name: email.split('@')[0],
        bio: "Nepal citizen",
        avatarUrl: null,
        avatarInitial: email.split('@')[0][0].toUpperCase(),
        city: "Kathmandu",
        district: "Kathmandu",
        joinDate: new Date().toISOString(),
        reputation: 0,
        posts: 0,
        followers: 0,
        following: 0,
        badges: [],
        savedItems: [],
        preferences: {
          notifications: true,
          emailAlerts: false,
          smsAlerts: false,
          privateMessages: true,
          language: 'en'
        }
      };
      Database.set(key, profile);
    }
    return profile;
  },

  // Update user profile
  updateProfile(email, updates) {
    const key = `np_profile_${email}`;
    let profile = this.getUserProfile(email);
    profile = { ...profile, ...updates };
    Database.set(key, profile);
    return profile;
  },

  // Upload avatar (simulate with data URL)
  uploadAvatar(email, imageDataUrl) {
    let profile = this.getUserProfile(email);
    profile.avatarUrl = imageDataUrl;
    Database.set(`np_profile_${email}`, profile);
    return profile;
  },

  // Get user by ID/email
  getUserById(email) {
    return this.getUserProfile(email);
  },

  // Search users
  searchUsers(query) {
    const allProfiles = this.getAllProfiles();
    return allProfiles.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get all profiles
  getAllProfiles() {
    const keys = Object.keys(localStorage);
    return keys
      .filter(k => k.startsWith('np_profile_'))
      .map(k => Database.get(k))
      .filter(p => p);
  },

  // Get user reputation
  getUserReputation(email) {
    const allBadges = this.getAllUserBadges(email);
    let reputation = 0;
    
    allBadges.forEach(badge => {
      if (badge.badgeType === 'community-leader') reputation += 500;
      else if (badge.badgeType === 'rising-star') reputation += 100;
      else if (badge.badgeType === 'active-contributor') reputation += 50;
      else if (badge.badgeType === 'top-contributor') reputation += 200;
      else reputation += 25;
    });

    return reputation;
  },

  // Get all badges for user
  getAllUserBadges(email) {
    const badgeKey = 'np_db_badges';
    const badges = Database.get(badgeKey) || [];
    return badges.filter(b => b.userId === email || b.email === email);
  },

  // Add badge to user
  addBadge(email, badgeType, name, description, icon) {
    const badgeKey = 'np_db_badges';
    let badges = Database.get(badgeKey) || [];
    
    const badge = {
      id: Date.now(),
      userId: email,
      email: email,
      badgeType: badgeType,
      name: name,
      description: description,
      icon: icon,
      earnedDate: new Date().toISOString()
    };

    badges.push(badge);
    Database.set(badgeKey, badges);
    return badge;
  },

  // Update user stats (posts, reputation)
  updateUserStats(email, field, increment = 1) {
    let profile = this.getUserProfile(email);
    profile[field] = (profile[field] || 0) + increment;
    Database.set(`np_profile_${email}`, profile);
    return profile;
  },

  // Get top users by reputation
  getLeaderboard(limit = 10) {
    return this.getAllProfiles()
      .map(p => ({
        ...p,
        reputation: this.getUserReputation(p.email)
      }))
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, limit);
  },

  // Get top contributors by posts
  getTopContributors(limit = 10) {
    return this.getAllProfiles()
      .filter(p => p.posts > 0)
      .sort((a, b) => b.posts - a.posts)
      .slice(0, limit);
  },

  // Verify user is owner of profile
  isProfileOwner(email, currentUserEmail) {
    return email === currentUserEmail;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Profiles;
}
