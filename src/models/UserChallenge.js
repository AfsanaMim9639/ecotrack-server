import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'missed'],
    default: 'in-progress'
  },
  note: {
    type: String,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
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
    type: String
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  // Challenge info snapshot (for quick access)
  challengeTitle: {
    type: String
  },
  challengeCategory: {
    type: String
  },
  challengePoints: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'Active', 'Completed', 'Abandoned'],
    default: 'active'
  },
  progress: [progressSchema],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  totalUpdates: {
    type: Number,
    default: 0
  },
  daysActive: {
    type: Number,
    default: 0
  },
  progressUpdates: [{
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: true
    },
    proofImage: String
  }]
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