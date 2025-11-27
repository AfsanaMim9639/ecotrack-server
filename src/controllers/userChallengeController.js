import UserChallenge from '../models/UserChallenge.js';
import Challenge from '../models/Challenge.js';

// Join a challenge (NO AUTH - Direct from request body)
export const joinChallenge = async (req, res) => {
  console.log('========================================');
  console.log('JOIN CHALLENGE CALLED');
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('========================================');

  try {
    const { userId, userEmail, userName, challengeId } = req.body;

    console.log('Extracted Values:');
    console.log('  userId:', userId);
    console.log('  userEmail:', userEmail);
    console.log('  userName:', userName);
    console.log('  challengeId:', challengeId);

    // Validate required fields
    if (!userId || !userEmail || !challengeId) {
      console.log('❌ VALIDATION FAILED');
      console.log('  userId exists?', !!userId);
      console.log('  userEmail exists?', !!userEmail);
      console.log('  challengeId exists?', !!challengeId);
      
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userEmail, challengeId',
        received: {
          userId: !!userId,
          userEmail: !!userEmail,
          challengeId: !!challengeId,
          body: req.body
        }
      });
    }

    console.log('✅ Validation passed');

    // Check if challenge exists
    console.log('Checking if challenge exists...');
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      console.log('❌ Challenge not found:', challengeId);
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    console.log('✅ Challenge found:', challenge.title);

    // Check if user already joined
    console.log('Checking if user already joined...');
    const existing = await UserChallenge.findOne({ userId, challengeId });
    
    if (existing) {
      console.log('❌ User already joined this challenge');
      return res.status(400).json({
        success: false,
        message: 'You have already joined this challenge'
      });
    }

    console.log('✅ User has not joined yet');

    // Create user challenge with all required fields
    console.log('Creating user challenge...');
    const userChallengeData = {
      userId,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      challengeId,
      challengeTitle: challenge.title,
      challengeCategory: challenge.category,
      challengePoints: challenge.points,
      pointsEarned: 0,
      status: 'Active',
      progressPercentage: 0,
      totalUpdates: 0,
      daysActive: 0
    };

    console.log('User Challenge Data:', JSON.stringify(userChallengeData, null, 2));

    const userChallenge = await UserChallenge.create(userChallengeData);

    console.log('✅ User challenge created:', userChallenge._id);

    // Increment challenge participants
    console.log('Incrementing challenge participants...');
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { participants: 1 }
    });

    console.log('✅ Challenge participants incremented');
    console.log('========================================');
    console.log('SUCCESS - Returning response');
    console.log('========================================');

    res.status(201).json({
      success: true,
      data: userChallenge,
      message: 'Successfully joined challenge'
    });
  } catch (error) {
    console.error('========================================');
    console.error('❌❌❌ JOIN CHALLENGE ERROR ❌❌❌');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('========================================');
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join challenge',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
};

// Get user's challenges
export const getUserChallenges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const filter = { userId };
    if (status) {
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
    console.error('Get User Challenges Error:', error);
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

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

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
    console.error('Get User Stats Error:', error);
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
    console.error('Get User Challenge Error:', error);
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

    if (progressPercentage === undefined || progressPercentage === null) {
      return res.status(400).json({
        success: false,
        message: 'progressPercentage is required'
      });
    }

    const userChallenge = await UserChallenge.findById(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

    userChallenge.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    userChallenge.lastUpdated = new Date();

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
    console.error('Update Progress Error:', error);
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

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const userChallenge = await UserChallenge.findById(id);

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        message: 'User challenge not found'
      });
    }

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
    console.error('Add Progress Update Error:', error);
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
    console.error('Abandon Challenge Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};