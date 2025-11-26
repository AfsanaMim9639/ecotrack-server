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
    enum: ['Workshop', 'Webinar', 'Community Cleanup', 'Cleanup', 'Tree Planting', 'Plantation', 'Conference', 'Other'],
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
  duration: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Online', 'Physical', 'Hybrid'],
      default: 'Physical'
    },
    address: String,
    city: String,
    country: String,
    meetingLink: String
  },
  organizer: {
    name: {
      type: String,
      default: 'EcoTrack'
    },
    contact: String,
    email: String
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: 1
  },
  capacity: {
    type: Number,
    default: 100
  },
  registeredParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Event'
  },
  registrationLink: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for queries
eventSchema.index({ eventDate: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ featured: -1, eventDate: 1 });

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registeredParticipants >= this.maxParticipants;
});

// Sync registeredCount with registeredParticipants
eventSchema.pre('save', function(next) {
  this.registeredCount = this.registeredParticipants;
  this.capacity = this.maxParticipants;
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;