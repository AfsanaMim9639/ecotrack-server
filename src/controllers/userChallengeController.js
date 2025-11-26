import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';

// Join a challenge (NO AUTH VERSION for testing)
export const joinChallenge = async (req, res) => {
  try {
    const { userId, userEmail, userName, challengeId } = req.body;

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

    // Create user challenge
    const userChallenge = await UserChallenge.create({
      userId,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      challengeId,
      challengeTitle: challenge.title,
      challengeCategory: challenge.category,
      challengePoints: challenge.points,
      pointsEarned: 0,
      status: 'Active'
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
      // Handle both lowercase and capitalized status
      filter.status = new RegExp(`^${status}$`, 'i');
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
          activeChallenges: {
            $sum: { 
              $cond: [
                { $regexMatch: { input: '$status', regex: /^active$/i } }, 
                1, 
                0
              ] 
            }
          },
          completedChallenges: {
            $sum: { 
              $cond: [
                { $regexMatch: { input: '$status', regex: /^completed$/i } }, 
                1, 
                0
              ] 
            }
          },
          totalPoints: { $sum: '$pointsEarned' },
          averageProgress: { $avg: '$progressPercentage' }
        }
      }
    ]);

    const result = stats[0] || {
      totalChallenges: 0,
      activeChallenges: 0,
      completedChallenges: 0,
      totalPoints: 0,
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

// Update progress percentage
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressPercentage } = req.body;

    const userChallenge = await UserChallenge.findById(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Update progress
    userChallenge.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    userChallenge.lastUpdated = new Date();

    // Check if completed
    if (userChallenge.progressPercentage === 100 && userChallenge.status.toLowerCase() === 'active') {
      userChallenge.status = 'Completed';
      userChallenge.completedDate = new Date();
      userChallenge.pointsEarned = userChallenge.challengePoints;
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

// Add progress update (with description)
export const addProgressUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, proofImage } = req.body;

    const userChallenge = await UserChallenge.findById(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    // Add progress update
    userChallenge.progressUpdates.push({
      date: new Date(),
      description,
      proofImage
    });

    userChallenge.totalUpdates = userChallenge.progressUpdates.length;
    userChallenge.lastUpdated = new Date();

    await userChallenge.save();

    res.status(200).json({
      success: true,
      data: userChallenge,
      message: 'Progress update added successfully'
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
    const { id } = req.params;

    const userChallenge = await UserChallenge.findByIdAndUpdate(
      id,
      { 
        status: 'Abandoned',
        lastUpdated: new Date()
      },
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