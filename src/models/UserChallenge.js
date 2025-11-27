import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'missed'],
    default: 'in-progress'
  },
  description: {
    type: String,
    maxlength: 200
  }
}, { _id: false });

const progressUpdateSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  proofImage: {
    type: String
  }
}, { _id: false });

const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required']
  },
  userName: {
    type: String,
    default: 'User'
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  challengeTitle: {
    type: String,
    required: true
  },
  challengeCategory: {
    type: String,
    required: true
  },
  challengePoints: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  progress: [progressEntrySchema],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  progressUpdates: [progressUpdateSchema],
  totalUpdates: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  daysActive: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeSchema.index({ status: 1, userId: 1 });

// Method to update progress percentage
userChallengeSchema.methods.updateProgressPercentage = function() {
  const completedDays = this.progress.filter(p => p.status === 'completed').length;
  const totalDays = this.progress.length;
  this.progressPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
};

const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);

export default UserChallenge;