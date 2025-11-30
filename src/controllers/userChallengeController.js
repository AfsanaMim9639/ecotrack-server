import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { updateUserStats, incrementChallengesJoined } from './userController.js';

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId, userId, userEmail, userName } = req.body;

    // Validate
    if (!challengeId || !userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID, User ID, and email are required'
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if already joined
    const existing = await UserChallenge.findOne({ userId, challengeId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this challenge'
      });
    }

    // Create or get user
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({
        userId,
        email: userEmail,
        displayName: userName || 'EcoWarrior'
      });
    }

    // Create user challenge
    const userChallenge = await UserChallenge.create({
      userId,
      userEmail,
      userName: userName || 'EcoWarrior',
      challengeId,
      challengeTitle: challenge.title,
      challengeCategory: challenge.category,
      challengePoints: challenge.points || 100,
      status: 'active',
      progress: [],
      progressHistory: [], // ✅ NEW
      progressPercentage: 0,
      totalImpact: 0, // ✅ NEW
      joinedDate: new Date(),
      startDate: new Date()
    });

    // Update challenge participants
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { participants: 1 }
    });

    // Update user stats
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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { status } = req.query;
    const filter = { userId };
    
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
    console.error('Get user challenges error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single user challenge (with full history)
export const getUserChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

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
    console.error('Get user challenge error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATED - Update progress with history tracking
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      userId, 
      progressPercentage, 
      description, 
      proofImage, 
      progressStatus,
      notes, // ✅ NEW
      impactValue // ✅ NEW
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

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

    // Add progress update (existing functionality)
    if (description) {
      userChallenge.progressUpdates.push({
        date: new Date(),
        description,
        proofImage: proofImage || undefined
      });
      userChallenge.totalUpdates += 1;
    }

    // ✅ NEW - Add to progress history
    if (progressPercentage !== undefined || notes || impactValue) {
      const progressEntry = {
        date: new Date(),
        percentage: progressPercentage !== undefined ? progressPercentage : userChallenge.progressPercentage,
        notes: notes || description || '',
        impactValue: impactValue || 0
      };
      
      // Add status if provided
      if (progressStatus) {
        progressEntry.status = progressStatus;
      }
      
      userChallenge.progressHistory.push(progressEntry);
    }

    // Update progress (existing functionality)
    if (progressStatus) {
      userChallenge.progress.push({
        date: new Date(),
        status: progressStatus,
        description: description || '',
        percentage: progressPercentage || 0,
        notes: notes || '',
        impactValue: impactValue || 0
      });
      
      if (userChallenge.updateProgressPercentage) {
        userChallenge.updateProgressPercentage();
      }
    } else if (progressPercentage !== undefined) {
      userChallenge.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    }

    // ✅ NEW - Update total impact
    if (impactValue) {
      userChallenge.totalImpact = (userChallenge.totalImpact || 0) + impactValue;
    }

    // Update status based on progress
    if (userChallenge.progressPercentage >= 100 && userChallenge.status !== 'completed') {
      userChallenge.status = 'completed';
      userChallenge.completedDate = new Date();
      
      const challenge = await Challenge.findById(userChallenge.challengeId);
      if (challenge) {
        const points = challenge.points || Math.ceil(challenge.duration / 5) * 10;
        userChallenge.pointsEarned = points;
        await updateUserStats(userId, points);
      }
    } else if (userChallenge.progressPercentage > 0) {
      userChallenge.status = 'active';
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
      message: 'Progress updated successfully!'
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NEW - Get activity by ID (alias for getUserChallengeById)
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const activity = await UserChallenge.findOne({
      _id: id,
      userId
    }).populate('challengeId');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Abandon challenge
export const abandonChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userChallenge = await UserChallenge.findOne({ _id: id, userId });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    userChallenge.status = 'abandoned';
    userChallenge.lastUpdated = new Date();
    await userChallenge.save();

    // Decrement participants
    await Challenge.findByIdAndUpdate(userChallenge.challengeId, {
      $inc: { participants: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Challenge abandoned successfully'
    });
  } catch (error) {
    console.error('Abandon challenge error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};