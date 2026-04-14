// ============= FOLLOW SYSTEM MODULE =============
// Handles user follows, user lists, and social connections

const FollowSystem = {
  // Follow a user
  followUser(followerEmail, followingEmail) {
    if (followerEmail === followingEmail) return null; // Can't follow self

    const followKey = `np_follows_${followerEmail}`;
    let following = Database.get(followKey) || [];

    if (!following.includes(followingEmail)) {
      following.push(followingEmail);
      Database.set(followKey, following);
    }

    // Update follower count
    let profile = Profiles.getUserProfile(followingEmail);
    profile.followers = (profile.followers || 0) + 1;
    Database.set(`np_profile_${followingEmail}`, profile);

    return { follower: followerEmail, following: followingEmail };
  },

  // Unfollow a user
  unfollowUser(followerEmail, followingEmail) {
    const followKey = `np_follows_${followerEmail}`;
    let following = Database.get(followKey) || [];

    following = following.filter(f => f !== followingEmail);
    Database.set(followKey, following);

    // Update follower count
    let profile = Profiles.getUserProfile(followingEmail);
    profile.followers = Math.max(0, (profile.followers || 1) - 1);
    Database.set(`np_profile_${followingEmail}`, profile);

    return true;
  },

  // Get users that someone is following
  getFollowing(userEmail) {
    const followKey = `np_follows_${userEmail}`;
    const following = Database.get(followKey) || [];
    return following.map(email => Profiles.getUserProfile(email));
  },

  // Get followers of a user
  getFollowers(userEmail) {
    const allKeys = Object.keys(localStorage);
    const followers = [];

    allKeys.forEach(key => {
      if (key.startsWith('np_follows_')) {
        const followerEmail = key.replace('np_follows_', '');
        const following = Database.get(key) || [];
        if (following.includes(userEmail)) {
          followers.push(followerEmail);
        }
      }
    });

    return followers.map(email => Profiles.getUserProfile(email));
  },

  // Check if user follows another
  isFollowing(followerEmail, followingEmail) {
    const followKey = `np_follows_${followerEmail}`;
    const following = Database.get(followKey) || [];
    return following.includes(followingEmail);
  },

  // Get follower count
  getFollowerCount(userEmail) {
    return this.getFollowers(userEmail).length;
  },

  // Get following count
  getFollowingCount(userEmail) {
    const followKey = `np_follows_${userEmail}`;
    return (Database.get(followKey) || []).length;
  },

  // Get trending users (most followers)
  getTrendingUsers(limit = 10) {
    return Profiles.getAllProfiles()
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, limit);
  },

  // Get feed from people user follows
  getFollowingFeed(userEmail, limit = 20) {
    const following = this.getFollowing(userEmail);
    const followingEmails = following.map(p => p.email);

    const allPostsKey = 'np_db_posts';
    const allPosts = Database.get(allPostsKey) || [];

    return allPosts
      .filter(post => followingEmails.includes(post.author) || followingEmails.includes(post.authorId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  // Get followers you follow (mutual)
  getMutualFollows(userEmail) {
    const followers = this.getFollowers(userEmail).map(p => p.email);
    const following = this.getFollowing(userEmail).map(p => p.email);

    return followers.filter(f => following.includes(f)).map(email => Profiles.getUserProfile(email));
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FollowSystem;
}
