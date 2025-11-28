import Event from '../models/Event.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { category, status, limit } = req.query;
    
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Don't filter by status if not provided
    if (status) {
      filter.status = status;
    }
    
    const events = await Event.find(filter)
      .sort({ featured: -1, eventDate: 1, date: 1 })  // Try both fields
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

// Get upcoming events - SIMPLIFIED (no date/status filter)
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Just get all events, don't filter by date or status
    const events = await Event.find({})
      .sort({ featured: -1, eventDate: 1, date: 1 })
      .limit(parseInt(limit) || 6);
    
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

// Create event
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
    
    // Check capacity - support both field names
    const capacity = event.capacity || event.maxParticipants || 100;
    const registered = event.registeredCount || event.currentParticipants || 0;
    
    if (registered >= capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    // Increment participants - update all possible fields
    if (event.registeredCount !== undefined) event.registeredCount += 1;
    if (event.registeredParticipants !== undefined) event.registeredParticipants += 1;
    if (event.currentParticipants !== undefined) event.currentParticipants += 1;
    
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