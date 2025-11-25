import Event from '../models/Event.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { category, status, upcoming } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Filter for upcoming events
    if (upcoming === 'true') {
      filter.eventDate = { $gte: new Date() };
      filter.status = 'Upcoming';
    }

    const events = await Event.find(filter)
      .sort({ eventDate: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
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
      data: event,
      message: 'Event created successfully'
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

    if (event.registeredParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    event.registeredParticipants += 1;
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