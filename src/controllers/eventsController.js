import Event from '../models/Event.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { category, status, limit } = req.query;
    
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    } else {
      // Default: show only upcoming and ongoing events
      filter.status = { $in: ['Upcoming', 'Ongoing'] };
    }
    
    const events = await Event.find(filter)
      .sort({ featured: -1, eventDate: 1 })
      .limit(parseInt(limit) || 10);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming events (special route for Home page)
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const events = await Event.find({
      status: 'Upcoming',
      eventDate: { $gte: new Date() }  // Future events only
    })
      .sort({ featured: -1, eventDate: 1 })
      .limit(parseInt(limit) || 10);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create event (optional - for admin)
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Register for event
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is full
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    // Increment participants
    event.registeredCount += 1;
    event.registeredParticipants += 1;
    event.currentParticipants += 1;
    await event.save();
    
    res.status(200).json({
      success: true,
      data: event,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};