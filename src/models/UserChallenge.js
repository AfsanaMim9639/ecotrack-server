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
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
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
  completedDate: {
    type: Date
  },
  pointsEarned: {
    type: Number,
    default: 0
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