// models/User.js
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
    default: 'EcoWarrior'
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
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: String,
    default: 'Beginner'
  },
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }]
}, {
  timestamps: true
});

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActiveDate);
  
  // Reset date to start of day for comparison
  today.setHours(0, 0, 0, 0);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, do nothing
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    this.currentStreak += 1;
  } else {
    // Streak broken, reset
    this.currentStreak = 1;
  }
  
  this.lastActiveDate = new Date();
};

// Method to calculate rank
userSchema.methods.calculateRank = function() {
  if (this.totalPoints >= 1000) return 'Master';
  if (this.totalPoints >= 500) return 'Expert';
  if (this.totalPoints >= 200) return 'Advanced';
  if (this.totalPoints >= 50) return 'Intermediate';
  return 'Beginner';
};

const User = mongoose.model('User', userSchema);

export default User;