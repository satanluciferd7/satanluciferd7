// ============= ENGAGEMENT MODULE =============
// Handles voting, polls, comments, ratings, and interactions

const Engagement = {
  // ===== COMMENTS SYSTEM =====
  // Add comment to item
  addComment(userEmail, itemId, itemType, commentText, attachments = null) {
    const commentKey = `np_comments_${itemType}_${itemId}`;
    let comments = Database.get(commentKey) || [];

    const comment = {
      id: Date.now(),
      author: userEmail,
      text: commentText,
      attachments: attachments,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
      edited: false,
      editedDate: null
    };

    comments.push(comment);
    Database.set(commentKey, comments);

    // Notify item owner
    Notifications.createNotification(
      userEmail,
      'comment',
      `New comment on ${itemType}`,
      commentText,
      { itemId, itemType, commentId: comment.id }
    );

    return comment;
  },

  // Get comments for item
  getComments(itemId, itemType) {
    const commentKey = `np_comments_${itemType}_${itemId}`;
    return Database.get(commentKey) || [];
  },

  // Delete comment
  deleteComment(itemId, itemType, commentId, userEmail) {
    const commentKey = `np_comments_${itemType}_${itemId}`;
    let comments = Database.get(commentKey) || [];

    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.author === userEmail) {
      comments = comments.filter(c => c.id !== commentId);
      Database.set(commentKey, comments);
      return true;
    }
    return false;
  },

  // Edit comment
  editComment(itemId, itemType, commentId, newText, userEmail) {
    const commentKey = `np_comments_${itemType}_${itemId}`;
    let comments = Database.get(commentKey) || [];

    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.author === userEmail) {
      comment.text = newText;
      comment.edited = true;
      comment.editedDate = new Date().toISOString();
      Database.set(commentKey, comments);
      return comment;
    }
    return null;
  },

  // Like a comment
  likeComment(itemId, itemType, commentId) {
    const commentKey = `np_comments_${itemType}_${itemId}`;
    let comments = Database.get(commentKey) || [];

    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      Database.set(commentKey, comments);
    }
    return comment;
  },

  // Get comment count
  getCommentCount(itemId, itemType) {
    return this.getComments(itemId, itemType).length;
  },

  // ===== VOTING SYSTEM =====
  // Vote on item
  vote(userEmail, itemId, itemType, voteValue) {
    // voteValue: 1 for upvote, -1 for downvote
    const voteKey = `np_votes_${itemType}_${itemId}`;
    let votes = Database.get(voteKey) || {};

    const userVote = votes[userEmail] || 0;
    votes[userEmail] = voteValue;

    Database.set(voteKey, votes);

    return {
      itemId,
      itemType,
      totalScore: Object.values(votes).reduce((a, b) => a + b, 0),
      userVote: voteValue
    };
  },

  // Get vote score
  getVoteScore(itemId, itemType) {
    const voteKey = `np_votes_${itemType}_${itemId}`;
    const votes = Database.get(voteKey) || {};
    return Object.values(votes).reduce((a, b) => a + b, 0);
  },

  // Get user vote
  getUserVote(userEmail, itemId, itemType) {
    const voteKey = `np_votes_${itemType}_${itemId}`;
    const votes = Database.get(voteKey) || {};
    return votes[userEmail] || 0;
  },

  // ===== POLLING SYSTEM =====
  // Create poll
  createPoll(userEmail, title, options, description = '', duration = 7) {
    const pollKey = 'np_db_polls';
    let polls = Database.get(pollKey) || [];

    const poll = {
      id: Date.now(),
      creator: userEmail,
      title: title,
      description: description,
      options: options.map(opt => ({
        id: Date.now() + Math.random(),
        text: opt,
        votes: 0,
        voters: []
      })),
      createdDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      totalVotes: 0,
      status: 'active'
    };

    polls.push(poll);
    Database.set(pollKey, polls);

    return poll;
  },

  // Vote on poll
  votePoll(userEmail, pollId, optionId) {
    const pollKey = 'np_db_polls';
    let polls = Database.get(pollKey) || [];

    const poll = polls.find(p => p.id === pollId);
    if (!poll) return null;

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return null;

    // Check if already voted
    let totalVoted = 0;
    poll.options.forEach(opt => {
      if (opt.voters.includes(userEmail)) totalVoted++;
    });

    if (totalVoted === 0) {
      option.votes = (option.votes || 0) + 1;
      option.voters.push(userEmail);
      poll.totalVotes = (poll.totalVotes || 0) + 1;
      Database.set(pollKey, polls);
    }

    return poll;
  },

  // Get polls
  getPolls(limit = 10) {
    const pollKey = 'np_db_polls';
    let polls = Database.get(pollKey) || [];
    return polls.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, limit);
  },

  // ===== RATING SYSTEM =====
  // Rate service
  rateService(userEmail, serviceId, rating, comment = '') {
    const ratingKey = `np_rating_${serviceId}`;
    let ratings = Database.get(ratingKey) || [];

    // Check if already rated
    const existingIndex = ratings.findIndex(r => r.userId === userEmail);
    if (existingIndex >= 0) {
      ratings[existingIndex] = {
        ...ratings[existingIndex],
        rating: rating,
        comment: comment,
        updatedDate: new Date().toISOString()
      };
    } else {
      ratings.push({
        userId: userEmail,
        rating: rating,
        comment: comment,
        timestamp: new Date().toISOString()
      });
    }

    Database.set(ratingKey, ratings);

    return {
      serviceId,
      averageRating: this.getAverageRating(serviceId),
      totalRatings: ratings.length
    };
  },

  // Get average rating
  getAverageRating(serviceId) {
    const ratingKey = `np_rating_${serviceId}`;
    const ratings = Database.get(ratingKey) || [];
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((total, r) => total + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
  },

  // Get all ratings for service
  getServiceRatings(serviceId) {
    const ratingKey = `np_rating_${serviceId}`;
    return Database.get(ratingKey) || [];
  },

  // Get trending items
  getTrendingItems(itemType, limit = 10) {
    const pollKey = 'np_db_polls';
    const polls = Database.get(pollKey) || [];

    if (itemType === 'polls') {
      return polls
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .slice(0, limit);
    }

    return [];
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Engagement;
}
