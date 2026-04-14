// ============= NOTIFICATIONS MODULE =============
// Handles all notifications (mentions, comments, follows, messages, etc.)

const Notifications = {
  // Create notification
  createNotification(userEmail, type, title, message, data = {}) {
    const notifKey = `np_notifications_${userEmail}`;
    let notifications = Database.get(notifKey) || [];

    const notification = {
      id: Date.now(),
      type: type, // 'message', 'comment', 'vote', 'follow', 'reply', 'mention'
      title: title,
      message: message,
      data: data,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: null
    };

    notifications.push(notification);
    Database.set(notifKey, notifications);

    // Update badge count
    this.updateNotificationBadge(userEmail);

    return notification;
  },

  // Get all notifications for user
  getUserNotifications(userEmail, limit = 20) {
    const notifKey = `np_notifications_${userEmail}`;
    let notifications = Database.get(notifKey) || [];
    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  },

  // Get unread notifications
  getUnreadNotifications(userEmail) {
    const notifKey = `np_notifications_${userEmail}`;
    const notifications = Database.get(notifKey) || [];
    return notifications.filter(n => !n.read);
  },

  // Mark notification as read
  markAsRead(userEmail, notificationId) {
    const notifKey = `np_notifications_${userEmail}`;
    let notifications = Database.get(notifKey) || [];

    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      Database.set(notifKey, notifications);
      this.updateNotificationBadge(userEmail);
    }

    return notification;
  },

  // Mark all as read
  markAllAsRead(userEmail) {
    const notifKey = `np_notifications_${userEmail}`;
    let notifications = Database.get(notifKey) || [];

    notifications.forEach(n => n.read = true);
    Database.set(notifKey, notifications);
    this.updateNotificationBadge(userEmail);

    return true;
  },

  // Delete notification
  deleteNotification(userEmail, notificationId) {
    const notifKey = `np_notifications_${userEmail}`;
    let notifications = Database.get(notifKey) || [];

    notifications = notifications.filter(n => n.id !== notificationId);
    Database.set(notifKey, notifications);
    this.updateNotificationBadge(userEmail);

    return true;
  },

  // Clear all notifications
  clearAllNotifications(userEmail) {
    const notifKey = `np_notifications_${userEmail}`;
    localStorage.removeItem(notifKey);
    this.updateNotificationBadge(userEmail);
    return true;
  },

  // Get unread count
  getUnreadCount(userEmail) {
    return this.getUnreadNotifications(userEmail).length;
  },

  // Update badge in UI
  updateNotificationBadge(userEmail) {
    const unreadCount = this.getUnreadCount(userEmail);
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  // Batch create notifications (for multiple users)
  createBatchNotifications(userEmails, type, title, message, data = {}) {
    return userEmails.map(email => 
      this.createNotification(email, type, title, message, data)
    );
  },

  // Get notification preferences
  getPreferences(userEmail) {
    const profile = Profiles.getUserProfile(userEmail);
    return profile.preferences || {
      notifications: true,
      emailAlerts: false,
      smsAlerts: false,
      privateMessages: true
    };
  },

  // Update notification preferences
  updatePreferences(userEmail, preferences) {
    const profile = Profiles.getUserProfile(userEmail);
    profile.preferences = { ...profile.preferences, ...preferences };
    Database.set(`np_profile_${userEmail}`, profile);
    return profile.preferences;
  },

  // Send email notification (simulated)
  sendEmailNotification(userEmail, subject, content) {
    const emailKey = 'np_email_queue';
    let queue = Database.get(emailKey) || [];

    queue.push({
      id: Date.now(),
      to: userEmail,
      subject: subject,
      content: content,
      timestamp: new Date().toISOString(),
      sent: false
    });

    Database.set(emailKey, queue);
    return true;
  },

  // Subscribe to topic
  subscribeToTopic(userEmail, topic) {
    const subKey = `np_subscriptions_${userEmail}`;
    let subscriptions = Database.get(subKey) || [];

    if (!subscriptions.includes(topic)) {
      subscriptions.push(topic);
      Database.set(subKey, subscriptions);
    }

    return subscriptions;
  },

  // Unsubscribe from topic
  unsubscribeFromTopic(userEmail, topic) {
    const subKey = `np_subscriptions_${userEmail}`;
    let subscriptions = Database.get(subKey) || [];

    subscriptions = subscriptions.filter(t => t !== topic);
    Database.set(subKey, subscriptions);

    return subscriptions;
  },

  // Get subscriptions
  getSubscriptions(userEmail) {
    const subKey = `np_subscriptions_${userEmail}`;
    return Database.get(subKey) || [];
  },

  // Notify subscribers
  notifySubscribers(topic, type, title, message, data = {}) {
    const allKeys = Object.keys(localStorage);
    const notifiedUsers = [];

    allKeys.forEach(key => {
      if (key.startsWith('np_subscriptions_')) {
        const userEmail = key.replace('np_subscriptions_', '');
        const subscriptions = Database.get(key) || [];
        if (subscriptions.includes(topic)) {
          this.createNotification(userEmail, type, title, message, { ...data, topic });
          notifiedUsers.push(userEmail);
        }
      }
    });

    return notifiedUsers;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Notifications;
}
