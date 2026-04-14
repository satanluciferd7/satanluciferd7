// ============= ADVANCED SEARCH & FILTERING MODULE =============
// Handles advanced search, filters, and discovery

const AdvancedSearch = {
  // Global search across all content types
  globalSearch(query, filters = {}) {
    const results = {
      posts: [],
      news: [],
      problems: [],
      users: [],
      services: [],
      all: []
    };

    const lowerQuery = query.toLowerCase();

    // Search posts
    const posts = Database.get('np_db_posts') || [];
    results.posts = posts.filter(p => 
      p.text.toLowerCase().includes(lowerQuery) || 
      (p.tags && p.tags.some(t => t.toLowerCase().includes(lowerQuery)))
    );

    // Search news
    const newsDb = Database.get('np_db_news') || [];
    results.news = newsDb.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) || 
      n.content.toLowerCase().includes(lowerQuery) ||
      (n.category && n.category.toLowerCase() === lowerQuery)
    );

    // Search problems
    const problems = Database.get('np_db_problems') || [];
    results.problems = problems.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.category && p.category.toLowerCase().includes(lowerQuery))
    );

    // Search users
    results.users = Profiles.searchUsers(query);

    // Combine all results
    results.all = [
      ...results.posts.map(p => ({ ...p, type: 'post' })),
      ...results.news.map(n => ({ ...n, type: 'news' })),
      ...results.problems.map(p => ({ ...p, type: 'problem' })),
      ...results.users.map(u => ({ ...u, type: 'user' }))
    ];

    return results;
  },

  // Advanced search with filters
  advancedSearch(query, options = {}) {
    const {
      type = 'all',           // post, news, problem, user
      category = null,
      district = null,
      city = null,
      dateFrom = null,
      dateTo = null,
      author = null,
      sortBy = 'date',        // date, relevance, popularity
      limit = 20
    } = options;

    let results = [];

    if (type === 'post' || type === 'all') {
      let posts = Database.get('np_db_posts') || [];
      posts = posts.filter(p => {
        let match = p.text.toLowerCase().includes(query.toLowerCase());
        if (category && p.category !== category) match = false;
        if (author && p.author !== author) match = false;
        if (dateFrom && new Date(p.timestamp) < new Date(dateFrom)) match = false;
        if (dateTo && new Date(p.timestamp) > new Date(dateTo)) match = false;
        return match;
      });
      results.push(...posts.map(p => ({ ...p, type: 'post' })));
    }

    if (type === 'problem' || type === 'all') {
      let problems = Database.get('np_db_problems') || [];
      problems = problems.filter(p => {
        let match = p.title.toLowerCase().includes(query.toLowerCase()) || 
                   p.description.toLowerCase().includes(query.toLowerCase());
        if (category && p.category !== category) match = false;
        if (district && p.district !== district) match = false;
        if (city && p.city !== city) match = false;
        if (author && p.author !== author) match = false;
        if (dateFrom && new Date(p.submittedDate) < new Date(dateFrom)) match = false;
        if (dateTo && new Date(p.submittedDate) > new Date(dateTo)) match = false;
        return match;
      });
      results.push(...problems.map(p => ({ ...p, type: 'problem' })));
    }

    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.timestamp || b.submittedDate) - new Date(a.timestamp || a.submittedDate));
    } else if (sortBy === 'popularity') {
      results.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }

    return results.slice(0, limit);
  },

  // Search by location
  searchByLocation(district, city = null) {
    const problems = Database.get('np_db_problems') || [];
    let results = problems.filter(p => p.district === district);

    if (city) {
      results = results.filter(p => p.city === city);
    }

    return results.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
  },

  // Get all districts
  getAllDistricts() {
    const districts = new Set();
    const problems = Database.get('np_db_problems') || [];
    problems.forEach(p => {
      if (p.district) districts.add(p.district);
    });
    return Array.from(districts).sort();
  },

  // Get cities in district
  getCitiesByDistrict(district) {
    const cities = new Set();
    const problems = Database.get('np_db_problems') || [];
    problems.forEach(p => {
      if (p.district === district && p.city) cities.add(p.city);
    });
    return Array.from(cities).sort();
  },

  // Search by category
  searchByCategory(category, itemType = 'all') {
    const results = {
      posts: [],
      problems: [],
      news: []
    };

    if (itemType === 'post' || itemType === 'all') {
      const posts = Database.get('np_db_posts') || [];
      results.posts = posts.filter(p => p.category === category);
    }

    if (itemType === 'problem' || itemType === 'all') {
      const problems = Database.get('np_db_problems') || [];
      results.problems = problems.filter(p => p.category === category);
    }

    if (itemType === 'news' || itemType === 'all') {
      const news = Database.get('np_db_news') || [];
      results.news = news.filter(n => n.category === category);
    }

    return results;
  },

  // Get trending topics
  getTrendingTopics(limit = 10) {
    const posts = Database.get('np_db_posts') || [];
    const topicCount = {};

    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          topicCount[tag] = (topicCount[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([topic, count]) => ({ topic, count }));
  },

  // Search suggestions (autocomplete)
  getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();
    const lowerQuery = query.toLowerCase();

    // From posts
    const posts = Database.get('np_db_posts') || [];
    posts.forEach(p => {
      if (p.text.substring(0, 50).toLowerCase().includes(lowerQuery)) {
        suggestions.add(p.text.substring(0, 50) + '...');
      }
      if (p.tags) {
        p.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) suggestions.add(tag);
        });
      }
    });

    // From problems
    const problems = Database.get('np_db_problems') || [];
    problems.forEach(p => {
      if (p.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(p.title);
      }
    });

    // From users
    const users = Profiles.getAllProfiles();
    users.forEach(u => {
      if (u.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add('@' + u.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  },

  // Filter by date range
  filterByDateRange(items, fromDate, toDate, dateField = 'timestamp') {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= from && itemDate <= to;
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedSearch;
}
