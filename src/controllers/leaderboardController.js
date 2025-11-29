import User from '../models/User.js';

// Get leaderboard - top users by points
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, type = 'points' } = req.query;
    
    let sortCriteria = {};
    
    switch (type) {
      case 'points':
        sortCriteria = { totalPoints: -1 };
        break;
      case 'challenges':
        sortCriteria = { totalChallengesCompleted: -1 };
        break;
      case 'streak':
        sortCriteria = { currentStreak: -1 };
        break;
      default:
        sortCriteria = { totalPoints: -1 };
    }
    
    const users = await User.find()
      .select('userId displayName photoURL totalPoints totalChallengesCompleted totalChallengesJoined currentStreak rank badges')
      .sort(sortCriteria)
      .limit(parseInt(limit));
    
    // Add rank position
    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      userId: user.userId,
      displayName: user.displayName,
      photoURL: user.photoURL,
      totalPoints: user.totalPoints,
      totalChallengesCompleted: user.totalChallengesCompleted,
      totalChallengesJoined: user.totalChallengesJoined,
      currentStreak: user.currentStreak,
      rank: user.rank,
      badgeCount: user.badges.length
    }));
    
    res.status(200).json({
      success: true,
      data: leaderboard,
      type,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's rank and position
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      // Return 200 with default data instead of 404
      return res.status(200).json({
        success: true,
        data: {
          position: 0,
          totalUsers: 0,
          percentile: 100,
          totalPoints: 0,
          rank: 'Beginner',
          badges: [],
          currentStreak: 0,
          longestStreak: 0
        }
      });
    }
    
    // Calculate position in leaderboard
    const higherRankUsers = await User.countDocuments({
      totalPoints: { $gt: user.totalPoints }
    });
    
    const position = higherRankUsers + 1;
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Calculate percentile
    const percentile = totalUsers > 0 
      ? Math.round((1 - (position / totalUsers)) * 100)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        position,
        totalUsers,
        percentile,
        totalPoints: user.totalPoints,
        rank: user.rank,
        badges: user.badges,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak || 0
      }
    });
  } catch (error) {
    console.error('Get Rank Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top performers (for homepage stats)
export const getTopPerformers = async (req, res) => {
  try {
    const topByPoints = await User.find()
      .select('displayName photoURL totalPoints')
      .sort({ totalPoints: -1 })
      .limit(3);
    
    const topByChallenges = await User.find()
      .select('displayName photoURL totalChallengesCompleted')
      .sort({ totalChallengesCompleted: -1 })
      .limit(3);
    
    const topByStreak = await User.find()
      .select('displayName photoURL currentStreak')
      .sort({ currentStreak: -1 })
      .limit(3);
    
    res.status(200).json({
      success: true,
      data: {
        topByPoints,
        topByChallenges,
        topByStreak
      }
    });
  } catch (error) {
    console.error('Top Performers Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};