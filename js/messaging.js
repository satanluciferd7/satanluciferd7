// ============= MESSAGING/CHAT MODULE =============
// Handles direct messages and chat between users

const Messaging = {
  // Create or get conversation
  getConversation(userId1, userId2) {
    const convoId = [userId1, userId2].sort().join('_');
    const key = `np_convo_${convoId}`;
    
    let conversation = Database.get(key);
    if (!conversation) {
      conversation = {
        id: convoId,
        participants: [userId1, userId2],
        messages: [],
        createdDate: new Date().toISOString(),
        lastMessageDate: null,
        unreadCount: { [userId1]: 0, [userId2]: 0 }
      };
      Database.set(key, conversation);
    }
    return conversation;
  },

  // Send message
  sendMessage(fromEmail, toEmail, text, attachmentUrl = null) {
    const conversation = this.getConversation(fromEmail, toEmail);
    
    const message = {
      id: Date.now(),
      from: fromEmail,
      to: toEmail,
      text: text,
      attachmentUrl: attachmentUrl,
      timestamp: new Date().toISOString(),
      read: false
    };

    conversation.messages.push(message);
    conversation.lastMessageDate = message.timestamp;
    conversation.unreadCount[toEmail] = (conversation.unreadCount[toEmail] || 0) + 1;
    
    const convoId = conversation.id;
    Database.set(`np_convo_${convoId}`, conversation);

    // Create notification
    Notifications.createNotification(
      toEmail,
      'message',
      `New message from ${fromEmail}`,
      message.text,
      { conversationId: convoId, fromEmail: fromEmail }
    );

    return message;
  },

  // Get all conversations for user
  getUserConversations(userEmail) {
    const keys = Object.keys(localStorage);
    return keys
      .filter(k => k.startsWith('np_convo_'))
      .map(k => Database.get(k))
      .filter(c => c && c.participants.includes(userEmail))
      .sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
  },

  // Mark message as read
  markAsRead(convoId, messageId, userEmail) {
    const conversation = Database.get(`np_convo_${convoId}`);
    if (conversation) {
      const msg = conversation.messages.find(m => m.id === messageId);
      if (msg && msg.to === userEmail) {
        msg.read = true;
        conversation.unreadCount[userEmail] = Math.max(0, (conversation.unreadCount[userEmail] || 1) - 1);
        Database.set(`np_convo_${convoId}`, conversation);
      }
    }
  },

  // Get unread count for user
  getUnreadCount(userEmail) {
    const conversations = this.getUserConversations(userEmail);
    return conversations.reduce((total, c) => total + (c.unreadCount[userEmail] || 0), 0);
  },

  // Delete conversation
  deleteConversation(convoId) {
    localStorage.removeItem(`np_convo_${convoId}`);
  },

  // Get conversation between two users
  getConversationMessages(userEmail, otherEmail) {
    const conversation = this.getConversation(userEmail, otherEmail);
    return conversation.messages;
  },

  // Mark all messages as read from specific user
  markAllAsRead(userEmail, otherEmail) {
    const conversation = this.getConversation(userEmail, otherEmail);
    conversation.messages.forEach(msg => {
      if (msg.to === userEmail) {
        msg.read = true;
      }
    });
    conversation.unreadCount[userEmail] = 0;
    Database.set(`np_convo_${conversation.id}`, conversation);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Messaging;
}
