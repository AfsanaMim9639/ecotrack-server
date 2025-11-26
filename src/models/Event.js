const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  organizer: {
    type: String,
    required: [true, 'Organizer email is required']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Max participants is required'],
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

eventSchema.index({ date: 1 });
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

export default mongoose.model('Event', eventSchema);