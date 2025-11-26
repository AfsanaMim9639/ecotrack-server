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
    type: String,
    default: 'https://ui-avatars.com/api/?name=Eco+Warrior&background=22c55e&color=fff'
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalChallengesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  totalChallengesJoined: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rank: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Legend'],
    default: 'Beginner'
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for leaderboard queries
userSchema.index({ totalPoints: -1 });
userSchema.index({ totalChallengesCompleted: -1 });

// Method to calculate rank based on points
userSchema.methods.calculateRank = function() {
  const points = this.totalPoints;
  if (points >= 1000) return 'Legend';
  if (points >= 500) return 'Master';
  if (points >= 250) return 'Expert';
  if (points >= 100) return 'Advanced';
  if (points >= 50) return 'Intermediate';
  return 'Beginner';
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.currentStreak = 1;
  }
  // If daysDiff === 0, same day - don't update streak
  
  this.lastActivityDate = new Date();
};

const User = mongoose.model('User', userSchema);

export default User;