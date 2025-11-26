import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalChallengesJoined: {
    type: Number,
    default: 0
  },
  totalChallengesCompleted: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    enum: ['Beginner', 'Explorer', 'Champion', 'Legend', 'Master'],
    default: 'Beginner'
  },
  badges: [{
    type: String
  }],
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
userSchema.index({ totalPoints: -1 });
userSchema.index({ totalChallengesCompleted: -1 });
userSchema.index({ currentStreak: -1 });

const User = mongoose.model('User', userSchema);

export default User;