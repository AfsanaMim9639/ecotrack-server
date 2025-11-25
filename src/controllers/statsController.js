import Challenge from '../models/Challenge.js';
import UserChallenge from '../models/UserChallenge.js';
import Tip from '../models/Tip.js';
import Event from '../models/Event.js';

// Get live statistics for homepage
export const getLiveStats = async (req, res) => {
  try {
    // Total active challenges
    const activeChallenges = await Challenge.countDocuments({ status: 'Active' });
    
    // Total participants (sum of all participants from all challenges)
    const challenges = await Challenge.find({}, 'participants');
    const totalParticipants = challenges.reduce((sum, c) => sum + c.participants, 0);
    
    // Total completed challenges by users
    const completedChallenges = await UserChallenge.countDocuments({ status: 'completed' });
    
    // Total tips
    const totalTips = await Tip.countDocuments();
    
    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      status: 'Upcoming',
      eventDate: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        activeChallenges,
        totalParticipants,
        completedChallenges,
        totalTips,
        upcomingEvents
      }
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
    const userId = req.user.uid;

    // Total challenges joined
    const totalJoined = await UserChallenge.countDocuments({ userId });
    
    // Active challenges
    const activeChallenges = await UserChallenge.countDocuments({
      userId,
      status: 'active'
    });
    
    // Completed challenges
    const completedChallenges = await UserChallenge.countDocuments({
      userId,
      status: 'completed'
    });
    
    // Total points earned
    const userChallenges = await UserChallenge.find({ userId, status: 'completed' });
    const totalPoints = userChallenges.reduce((sum, uc) => sum + uc.pointsEarned, 0);

    res.status(200).json({
      success: true,
      data: {
        totalJoined,
        activeChallenges,
        completedChallenges,
        totalPoints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};