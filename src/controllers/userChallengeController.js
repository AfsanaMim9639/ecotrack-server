import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';
import { updateUserStats, incrementChallengesJoined } from './userController.js';

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.uid;

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

    // Create user challenge with "Not Started" status
    const userChallenge = await UserChallenge.create({
      userId,
      challengeId,
      status: 'Not Started',
      progress: 0,
      joinDate: new Date()
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
    if (status) filter.status = status;

    const userChallenges = await UserChallenge.find(filter)
      .populate('challengeId')
      .sort({ joinedDate: -1 });

    res.status(200).json({
      success: true,
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
    const { progress } = req.body;

    const userChallenge = await UserChallenge.findOne({ _id: id, userId });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Update progress and status
    userChallenge.progress = progress;
    
    if (progress === 0) {
      userChallenge.status = 'Not Started';
    } else if (progress === 100) {
      userChallenge.status = 'Finished';
      
      // Update user stats (completion count)
      const challenge = await Challenge.findById(userChallenge.challengeId);
      if (challenge) {
        // Calculate points based on duration
        const points = Math.ceil(challenge.duration / 5) * 10; // 10 points per 5 days
        await updateUserStats(userId, points);
      }
    } else {
      userChallenge.status = 'Ongoing';
    }

    await userChallenge.save();

    res.status(200).json({
      success: true,
      data: userChallenge,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Abandon challenge - Remove this function, not needed in new schema