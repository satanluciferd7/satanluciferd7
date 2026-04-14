// ============= BOOKMARKS/SAVED ITEMS MODULE =============
// Handles bookmarking and saving posts, news, problems, articles

const Bookmarks = {
  // Save an item
  saveItem(userEmail, itemId, itemType, itemData) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    let bookmarks = Database.get(bookmarkKey) || [];

    // Check if already saved
    const exists = bookmarks.find(b => b.itemId === itemId && b.itemType === itemType);
    if (exists) return exists;

    const bookmark = {
      id: Date.now(),
      itemId: itemId,
      itemType: itemType, // 'post', 'news', 'problem', 'article', etc.
      itemData: itemData,
      savedDate: new Date().toISOString(),
      notes: ''
    };

    bookmarks.push(bookmark);
    Database.set(bookmarkKey, bookmarks);

    return bookmark;
  },

  // Remove bookmark
  removeBookmark(userEmail, itemId, itemType) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    let bookmarks = Database.get(bookmarkKey) || [];

    bookmarks = bookmarks.filter(b => !(b.itemId === itemId && b.itemType === itemType));
    Database.set(bookmarkKey, bookmarks);

    return true;
  },

  // Check if item is bookmarked
  isBookmarked(userEmail, itemId, itemType) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    const bookmarks = Database.get(bookmarkKey) || [];
    return bookmarks.some(b => b.itemId === itemId && b.itemType === itemType);
  },

  // Get all bookmarks for user
  getUserBookmarks(userEmail, itemType = null) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    let bookmarks = Database.get(bookmarkKey) || [];

    if (itemType) {
      bookmarks = bookmarks.filter(b => b.itemType === itemType);
    }

    return bookmarks.sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));
  },

  // Get bookmarks by type
  getBookmarksByType(userEmail, itemType) {
    return this.getUserBookmarks(userEmail, itemType);
  },

  // Add notes to bookmark
  addNotesToBookmark(userEmail, itemId, itemType, notes) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    let bookmarks = Database.get(bookmarkKey) || [];

    const bookmark = bookmarks.find(b => b.itemId === itemId && b.itemType === itemType);
    if (bookmark) {
      bookmark.notes = notes;
      Database.set(bookmarkKey, bookmarks);
    }

    return bookmark;
  },

  // Get bookmark count
  getBookmarkCount(userEmail, itemType = null) {
    return this.getUserBookmarks(userEmail, itemType).length;
  },

  // Get recently saved items
  getRecentBookmarks(userEmail, limit = 10) {
    return this.getUserBookmarks(userEmail)
      .sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate))
      .slice(0, limit);
  },

  // Export bookmarks as JSON
  exportBookmarks(userEmail) {
    const bookmarks = this.getUserBookmarks(userEmail);
    return JSON.stringify(bookmarks, null, 2);
  },

  // Clear all bookmarks
  clearAllBookmarks(userEmail) {
    const bookmarkKey = `np_bookmarks_${userEmail}`;
    localStorage.removeItem(bookmarkKey);
    return true;
  },

  // Bulk save multiple items
  saveMultiple(userEmail, items) {
    const results = [];
    items.forEach(item => {
      results.push(this.saveItem(userEmail, item.id, item.type, item.data));
    });
    return results;
  },

  // Get bookmarks grouped by type
  getBookmarksGrouped(userEmail) {
    const bookmarks = this.getUserBookmarks(userEmail);
    const grouped = {};

    bookmarks.forEach(bookmark => {
      if (!grouped[bookmark.itemType]) {
        grouped[bookmark.itemType] = [];
      }
      grouped[bookmark.itemType].push(bookmark);
    });

    return grouped;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Bookmarks;
}
