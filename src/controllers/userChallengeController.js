import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { userId, challengeId } = req.body;

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
        message: 'You have already joined this challenge'
      });
    }

    // Create user challenge - using requirements format
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
    const { userId } = req.params;
    const { status } = req.query;

    const filter = { userId };
    if (status) {
      // Case-insensitive status match
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    const userChallenges = await UserChallenge.find(filter)
      .populate('challengeId')
      .sort({ joinDate: -1 });

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
    const { id } = req.params;

    const userChallenge = await UserChallenge.findById(id)
      .populate('challengeId');

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
    const { id } = req.params;
    const { progress } = req.body;

    const userChallenge = await UserChallenge.findById(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Update progress (0-100)
    userChallenge.progress = Math.min(100, Math.max(0, progress));

    // Update status based on progress
    if (userChallenge.progress === 0) {
      userChallenge.status = 'Not Started';
    } else if (userChallenge.progress === 100) {
      userChallenge.status = 'Finished';
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

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await UserChallenge.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalChallenges: { $sum: 1 },
          ongoingChallenges: {
            $sum: { 
              $cond: [{ $eq: ['$status', 'Ongoing'] }, 1, 0] 
            }
          },
          finishedChallenges: {
            $sum: { 
              $cond: [{ $eq: ['$status', 'Finished'] }, 1, 0] 
            }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = stats[0] || {
      totalChallenges: 0,
      ongoingChallenges: 0,
      finishedChallenges: 0,
      averageProgress: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
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

    const userChallenge = await UserChallenge.findByIdAndDelete(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Decrement challenge participants
    await Challenge.findByIdAndUpdate(userChallenge.challengeId, {
      $inc: { participants: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Challenge abandoned'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Placeholder functions for other routes
export const addProgressUpdate = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};