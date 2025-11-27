import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  icon: {
    type: String
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

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
  badges: [badgeSchema],  // ✅ Changed to badgeSchema
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ totalPoints: -1 });
userSchema.index({ totalChallengesCompleted: -1 });
userSchema.index({ currentStreak: -1 });

const User = mongoose.model('User', userSchema);

export default User;
