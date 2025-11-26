// ============================================
// FILE: src/controllers/userChallengeController.js
// Fixed to match YOUR existing schema
// ============================================

import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';
import { updateUserStats, incrementChallengesJoined } from './userController.js';

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email; // Get from authenticated user
    const userName = req.user.displayName || req.user.name || 'User';

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user already joined
    const existing = await UserChallenge.findOne({ userId, challengeId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this challenge'
      });
    }

    // Create user challenge with correct schema
    const userChallenge = await UserChallenge.create({
      userId,
      userEmail,  // ✅ Added - required field
      userName,
      challengeId,
      challengeTitle: challenge.title,  // Snapshot
      challengeCategory: challenge.category,
      challengePoints: challenge.points || 100,
      status: 'active',  // ✅ Fixed - use enum value from schema
      progress: [],  // ✅ Fixed - empty array instead of 0
      progressPercentage: 0,
      joinedDate: new Date(),
      startDate: new Date()
    });

    // Increment challenge participants
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { participants: 1 }
    });

    // Update user stats (challenges joined)
    await incrementChallengesJoined(userId);

    res.status(201).json({
      success: true,
      data: userChallenge,
      message: 'Successfully joined challenge'
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's challenges
export const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { status } = req.query;

    const filter = { userId };
    
    // Handle comma-separated status values (e.g., "active,completed")
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      filter.status = { $in: statusArray };
    }

    const userChallenges = await UserChallenge.find(filter)
      .populate('challengeId')
      .sort({ joinedDate: -1 });

    res.status(200).json({
      success: true,
      count: userChallenges.length,
      data: userChallenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single user challenge
export const getUserChallengeById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const userChallenge = await UserChallenge.findOne({
      _id: id,
      userId
    }).populate('challengeId');

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userChallenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { progressPercentage, description, proofImage, progressStatus } = req.body;

    const userChallenge = await UserChallenge.findOne({ _id: id, userId });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Add progress update if description provided
    if (description) {
      userChallenge.progressUpdates.push({
        date: new Date(),
        description,
        proofImage: proofImage || undefined
      });
      userChallenge.totalUpdates += 1;
    }

    // Add daily progress if provided
    if (progressStatus) {
      userChallenge.progress.push({
        date: new Date(),
        status: progressStatus,  // 'completed', 'in-progress', or 'missed'
        description: description || ''
      });
      
      // Update percentage based on progress array
      userChallenge.updateProgressPercentage();
    } else if (progressPercentage !== undefined) {
      // Direct percentage update
      userChallenge.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    }

    // Update status based on progress
    if (userChallenge.progressPercentage === 0) {
      userChallenge.status = 'active';
    } else if (userChallenge.progressPercentage === 100) {
      userChallenge.status = 'completed';  // ✅ Fixed - use enum value
      userChallenge.completedDate = new Date();
      
      // Update user stats (completion count)
      const challenge = await Challenge.findById(userChallenge.challengeId);
      if (challenge) {
        // Calculate points based on duration
        const points = Math.ceil(challenge.duration / 5) * 10; // 10 points per 5 days
        userChallenge.pointsEarned = points;
        await updateUserStats(userId, points);
      }
    } else {
      userChallenge.status = 'active';  // ✅ Fixed - 'active' instead of 'Ongoing'
    }

    // Calculate days active
    const startDate = new Date(userChallenge.startDate);
    const currentDate = new Date();
    userChallenge.daysActive = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    
    userChallenge.lastUpdated = new Date();
    await userChallenge.save();

    res.status(200).json({
      success: true,
      data: userChallenge,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Abandon challenge
export const abandonChallenge = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const userChallenge = await UserChallenge.findOne({ _id: id, userId });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Update status to abandoned
    userChallenge.status = 'abandoned';  // ✅ Use enum value
    userChallenge.lastUpdated = new Date();
    await userChallenge.save();

    // Decrement challenge participants
    await Challenge.findByIdAndUpdate(userChallenge.challengeId, {
      $inc: { participants: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Challenge abandoned successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
