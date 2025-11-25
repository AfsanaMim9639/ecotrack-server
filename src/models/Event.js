import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Workshop', 'Webinar', 'Community Cleanup', 'Tree Planting', 'Conference', 'Other'],
    default: 'Other'
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventTime: {
    type: String,
    required: [true, 'Event time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  organizer: {
    type: String,
    default: 'EcoTrack'
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: 1
  },
  registeredParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Event'
  },
  registrationLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

// Index for queries
eventSchema.index({ eventDate: 1, status: 1 });
eventSchema.index({ category: 1 });

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registeredParticipants >= this.maxParticipants;
});

const Event = mongoose.model('Event', eventSchema);

export default Event;