import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  // Support BOTH content and description
  content: {
    type: String,
    trim: true,
    maxlength: [500, 'Content cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Energy', 'Water', 'Waste', 'Transportation', 'Food', 'General', 'Other', 
           'Energy Conservation', 'Water Conservation', 'Waste Management', 
           'Waste Reduction', 'Sustainable Transport'],
    default: 'Other'
  },
  icon: {
    type: String,
    default: '💡'
  },
  impactLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  author: {
    type: String,
    default: 'EcoTrack Team'
  },
  authorName: {
    type: String
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  upvotes: {
    type: Number,
    default: 0
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
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual to get description from content if description doesn't exist
tipSchema.virtual('displayDescription').get(function() {
  return this.description || this.content;
});

// Ensure virtual fields are included in JSON
tipSchema.set('toJSON', { virtuals: true });
tipSchema.set('toObject', { virtuals: true });

// Index for better search performance
tipSchema.index({ category: 1, featured: -1 });
tipSchema.index({ createdAt: -1 });

const Tip = mongoose.model('Tip', tipSchema);

export default Tip;