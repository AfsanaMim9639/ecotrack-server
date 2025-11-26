import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';
import { updateUserStats, incrementChallengesJoined } from './userController.js';

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

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

    // Create user challenge
    const userChallenge = await UserChallenge.create({
      userId,
      userEmail,
      challengeId,
      pointsEarned: 0
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
    const { status, note } = req.body;

    const userChallenge = await UserChallenge.findOne({ _id: id, userId });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Add progress entry
    userChallenge.progress.push({
      date: new Date(),
      status,
      note
    });

    // Update progress percentage
    userChallenge.updateProgressPercentage();

    // Check if completed
    if (userChallenge.progressPercentage === 100) {
      userChallenge.status = 'completed';
      userChallenge.completedDate = new Date();
      
      // Award points
      const challenge = await Challenge.findById(userChallenge.challengeId);
      userChallenge.pointsEarned = challenge.points;
      
      // Update user stats (points and completion count)
      await updateUserStats(userId, challenge.points);
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

// Abandon challenge
export const abandonChallenge = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const userChallenge = await UserChallenge.findOneAndUpdate(
      { _id: id, userId },
      { status: 'abandoned' },
      { new: true }
    );

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userChallenge,
      message: 'Challenge abandoned'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};