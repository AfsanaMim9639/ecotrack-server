import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Energy Conservation',
      'Water Conservation',
      'Waste Reduction',
      'Sustainable Transport',
      'Green Living',
      'Food & Agriculture',
      'Other'
    ],
    default: 'Other'
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  target: {
    type: String,
    required: [true, 'Target is required'],
    trim: true,
    maxlength: [200, 'Target cannot exceed 200 characters']
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Participants cannot be negative']
  },
  impactMetric: {
    type: String,
    trim: true,
    default: 'impact units'
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
  },
  createdBy: {
    type: String,
    required: true,
    default: 'admin@ecotrack.com'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  }
}, {
  timestamps: true
});

// Add index for faster queries
challengeSchema.index({ category: 1, status: 1 });
challengeSchema.index({ createdAt: -1 });

// Virtual for calculating if challenge is expired
challengeSchema.virtual('isExpired').get(function() {
  if (this.endDate) {
    return new Date() > this.endDate;
  }
  return false;
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;