const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Waste Management', 'Energy', 'Water', 'Transportation', 'Food', 'Other']
  },
  author: {
    type: String,
    required: [true, 'Author email is required']
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required']
  },
  upvotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

tipSchema.index({ category: 1 });
tipSchema.index({ upvotes: -1 });

export default mongoose.model('Tip', tipSchema);

