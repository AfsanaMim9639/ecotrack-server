import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Tip content is required'],
    trim: true,
    maxlength: [500, 'Content cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Energy', 'Water', 'Waste', 'Transportation', 'Food', 'Other'],
    default: 'Other'
  },
  author: {
    type: String,
    default: 'EcoTrack Team'
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better search performance
tipSchema.index({ category: 1, featured: -1 });
tipSchema.index({ createdAt: -1 });

const Tip = mongoose.model('Tip', tipSchema);

export default Tip;