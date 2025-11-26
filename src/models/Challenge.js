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
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Energy', 'Water', 'Waste', 'Transportation', 'Food', 'Other'],
    default: 'Other'
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative'],
    default: 10
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Participants cannot be negative']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Challenge'
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Upcoming'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
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