import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
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
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1
  },
  target: {
    type: String,
    required: [true, 'Target is required']
  },
  participants: {
    type: Number,
    default: 0
  },
  impactMetric: {
    type: String,
    required: [true, 'Impact metric is required']
  },
  createdBy: {
    type: String,
    default: 'admin@ecotrack.com'
  },
  startDate: {
    type: String, // "2024-07-01" format
    required: true
  },
  endDate: {
    type: String, // "2024-07-31" format
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://example.com/image.jpg'
  }
}, {
  timestamps: true
});

challengeSchema.index({ category: 1 });

export default mongoose.model('Challenge', challengeSchema);
