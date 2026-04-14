// ============= EVENTS & CALENDAR MODULE =============
// Handles events, announcements, and calendar management

const Events = {
  // Create event
  createEvent(title, description, startDate, endDate, category, location, organizer) {
    const eventKey = 'np_db_events';
    let events = Database.get(eventKey) || [];

    const event = {
      id: Date.now(),
      title: title,
      description: description,
      category: category, // government, education, health, tourism, etc.
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location: location,
      district: location.district || 'Kathmandu',
      city: location.city || '',
      organizer: organizer,
      attendees: [organizer],
      interested: [],
      image: null,
      createdDate: new Date().toISOString(),
      status: 'upcoming' // upcoming, ongoing, completed, cancelled
    };

    events.push(event);
    Database.set(eventKey, events);

    return event;
  },

  // Get events
  getEvents(filters = {}) {
    let events = Database.get('np_db_events') || [];
    const {
      category = null,
      district = null,
      status = 'upcoming',
      limit = 20
    } = filters;

    if (category) {
      events = events.filter(e => e.category === category);
    }

    if (district) {
      events = events.filter(e => e.district === district);
    }

    if (status) {
      events = events.filter(e => e.status === status);
    }

    return events
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, limit);
  },

  // Get upcoming events
  getUpcomingEvents(days = 30, limit = 10) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let events = Database.get('np_db_events') || [];
    return events
      .filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= now && eventDate <= futureDate && e.status === 'upcoming';
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, limit);
  },

  // RSVP to event
  rsvpEvent(userEmail, eventId, status = 'attending') {
    // status: attending, interested, not-attending
    let events = Database.get('np_db_events') || [];
    const event = events.find(e => e.id === eventId);

    if (!event) return null;

    // Remove from other lists
    event.attendees = event.attendees.filter(a => a !== userEmail);
    event.interested = event.interested.filter(i => i !== userEmail);

    if (status === 'attending') {
      if (!event.attendees.includes(userEmail)) {
        event.attendees.push(userEmail);
      }
    } else if (status === 'interested') {
      if (!event.interested.includes(userEmail)) {
        event.interested.push(userEmail);
      }
    }

    Database.set('np_db_events', events);

    // Notify organizer
    Notifications.createNotification(
      event.organizer,
      'event-rsvp',
      `${userEmail} ${status} in your event`,
      event.title,
      { eventId: eventId, status: status }
    );

    return event;
  },

  // Get user's events
  getUserEvents(userEmail) {
    const events = Database.get('np_db_events') || [];
    return events.filter(e => 
      e.organizer === userEmail || 
      e.attendees.includes(userEmail) || 
      e.interested.includes(userEmail)
    );
  },

  // Get event details
  getEventDetails(eventId) {
    return (Database.get('np_db_events') || []).find(e => e.id === eventId);
  },

  // Update event
  updateEvent(eventId, updates) {
    let events = Database.get('np_db_events') || [];
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex >= 0) {
      events[eventIndex] = { ...events[eventIndex], ...updates };
      Database.set('np_db_events', events);
      return events[eventIndex];
    }

    return null;
  },

  // Cancel event
  cancelEvent(eventId, reason = '') {
    let events = Database.get('np_db_events') || [];
    const event = events.find(e => e.id === eventId);

    if (event) {
      event.status = 'cancelled';
      event.cancellationReason = reason;
      Database.set('np_db_events', events);

      // Notify all attendees
      Notifications.createBatchNotifications(
        event.attendees,
        'event-cancelled',
        `Event cancelled: ${event.title}`,
        reason || 'The event you were interested in has been cancelled.',
        { eventId: eventId }
      );
    }

    return event;
  },

  // Get events by category
  getEventsByCategory(category, limit = 10) {
    const events = Database.get('np_db_events') || [];
    return events
      .filter(e => e.category === category && e.status === 'upcoming')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, limit);
  },

  // Get events by location
  getEventsByLocation(district, city = null) {
    const events = Database.get('np_db_events') || [];
    let filtered = events.filter(e => e.district === district && e.status === 'upcoming');

    if (city) {
      filtered = filtered.filter(e => e.city === city);
    }

    return filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  },

  // Get calendar view
  getCalendarView(year, month) {
    const events = Database.get('np_db_events') || [];
    const calendar = {};

    events.forEach(e => {
      const date = new Date(e.startDate);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (!calendar[day]) calendar[day] = [];
        calendar[day].push(e);
      }
    });

    return calendar;
  },

  // Get trending events
  getTrendingEvents(limit = 10) {
    const events = Database.get('np_db_events') || [];
    return events
      .filter(e => e.status === 'upcoming')
      .sort((a, b) => b.interested.length + b.attendees.length - (a.interested.length + a.attendees.length))
      .slice(0, limit);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Events;
}
