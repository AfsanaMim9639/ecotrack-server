import User from '../models/User.js';
import UserChallenge from '../models/UserChallenge.js';
import { checkBadges } from '../config/badges.js';

// Get or create user profile
export const getOrCreateProfile = async (req, res) => {
  try {
    const { userId, email, displayName, photoURL } = req.body;
    
    let user = await User.findOne({ userId });
    
    if (!user) {
      // Create new user profile
      user = await User.create({
        userId,
        email,
        displayName: displayName || 'EcoWarrior',
        photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Eco Warrior')}&background=22c55e&color=fff`
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user stats after challenge completion
export const updateUserStats = async (userId, pointsEarned) => {
  try {
    let user = await User.findOne({ userId });
    
    if (!user) {
      // Create user if doesn't exist
      user = await User.create({
        userId,
        email: 'unknown@ecotrack.com',
        totalPoints: pointsEarned,
        totalChallengesCompleted: 1
      });
    } else {
      // Update stats
      user.totalPoints += pointsEarned;
      user.totalChallengesCompleted += 1;
      user.updateStreak();
      user.rank = user.calculateRank();
      
      // Check for new badges
      const earnedBadges = checkBadges({
        totalPoints: user.totalPoints,
        totalChallengesCompleted: user.totalChallengesCompleted,
        totalChallengesJoined: user.totalChallengesJoined,
        currentStreak: user.currentStreak
      });
      
      // Add new badges that user doesn't have
      earnedBadges.forEach(badge => {
        const hasBadge = user.badges.some(b => b.badgeId === badge.badgeId);
        if (!hasBadge) {
          user.badges.push(badge);
        }
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// Update user stats when joining challenge
export const incrementChallengesJoined = async (userId) => {
  try {
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = await User.create({
        userId,
        email: 'unknown@ecotrack.com',
        totalChallengesJoined: 1
      });
    } else {
      user.totalChallengesJoined += 1;
      
      // Check for new badges
      const earnedBadges = checkBadges({
        totalPoints: user.totalPoints,
        totalChallengesCompleted: user.totalChallengesCompleted,
        totalChallengesJoined: user.totalChallengesJoined,
        currentStreak: user.currentStreak
      });
      
      earnedBadges.forEach(badge => {
        const hasBadge = user.badges.some(b => b.badgeId === badge.badgeId);
        if (!hasBadge) {
          user.badges.push(badge);
        }
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error incrementing challenges joined:', error);
    throw error;
  }
};

// Get user badges
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const user = await User.findOne({ userId }).select('badges totalPoints totalChallengesCompleted totalChallengesJoined currentStreak');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get all possible badges and mark which ones are earned
    const allBadges = checkBadges({
      totalPoints: user.totalPoints,
      totalChallengesCompleted: user.totalChallengesCompleted,
      totalChallengesJoined: user.totalChallengesJoined,
      currentStreak: user.currentStreak
    });
    
    res.status(200).json({
      success: true,
      data: {
        earnedBadges: user.badges,
        allPossibleBadges: allBadges,
        stats: {
          totalPoints: user.totalPoints,
          totalChallengesCompleted: user.totalChallengesCompleted,
          totalChallengesJoined: user.totalChallengesJoined,
          currentStreak: user.currentStreak
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};