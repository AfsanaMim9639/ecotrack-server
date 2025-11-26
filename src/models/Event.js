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
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  organizer: {
    type: String,
    required: true,
    default: 'user@example.com'
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for queries
eventSchema.index({ date: 1 });

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

const Event = mongoose.model('Event', eventSchema);

export default Event;