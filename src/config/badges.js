// Badge definitions and criteria
export const BADGES = {
  FIRST_CHALLENGE: {
    id: 'first_challenge',
    name: 'First Step',
    description: 'Joined your first challenge',
    icon: '🌱',
    criteria: { challengesJoined: 1 }
  },
  FIVE_CHALLENGES: {
    id: 'five_challenges',
    name: 'Green Enthusiast',
    description: 'Joined 5 challenges',
    icon: '🌿',
    criteria: { challengesJoined: 5 }
  },
  TEN_CHALLENGES: {
    id: 'ten_challenges',
    name: 'Eco Warrior',
    description: 'Joined 10 challenges',
    icon: '🌳',
    criteria: { challengesJoined: 10 }
  },
  FIRST_COMPLETION: {
    id: 'first_completion',
    name: 'Challenge Champion',
    description: 'Completed your first challenge',
    icon: '🏆',
    criteria: { challengesCompleted: 1 }
  },
  FIVE_COMPLETIONS: {
    id: 'five_completions',
    name: 'Consistent Contributor',
    description: 'Completed 5 challenges',
    icon: '⭐',
    criteria: { challengesCompleted: 5 }
  },
  TEN_COMPLETIONS: {
    id: 'ten_completions',
    name: 'Environmental Hero',
    description: 'Completed 10 challenges',
    icon: '💚',
    criteria: { challengesCompleted: 10 }
  },
  HUNDRED_POINTS: {
    id: 'hundred_points',
    name: 'Point Collector',
    description: 'Earned 100 points',
    icon: '💯',
    criteria: { totalPoints: 100 }
  },
  FIVE_HUNDRED_POINTS: {
    id: 'five_hundred_points',
    name: 'Point Master',
    description: 'Earned 500 points',
    icon: '🎯',
    criteria: { totalPoints: 500 }
  },
  THOUSAND_POINTS: {
    id: 'thousand_points',
    name: 'Legendary Eco-Champion',
    description: 'Earned 1000 points',
    icon: '👑',
    criteria: { totalPoints: 1000 }
  },
  SEVEN_DAY_STREAK: {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: '7-day activity streak',
    icon: '🔥',
    criteria: { currentStreak: 7 }
  },
  THIRTY_DAY_STREAK: {
    id: 'thirty_day_streak',
    name: 'Month Master',
    description: '30-day activity streak',
    icon: '🌟',
    criteria: { currentStreak: 30 }
  }
};

// Check which badges a user should have
export const checkBadges = (userStats) => {
  const earnedBadges = [];
  
  Object.values(BADGES).forEach(badge => {
    const { criteria } = badge;
    let shouldEarn = true;
    
    // Check all criteria
    if (criteria.challengesJoined && userStats.totalChallengesJoined < criteria.challengesJoined) {
      shouldEarn = false;
    }
    if (criteria.challengesCompleted && userStats.totalChallengesCompleted < criteria.challengesCompleted) {
      shouldEarn = false;
    }
    if (criteria.totalPoints && userStats.totalPoints < criteria.totalPoints) {
      shouldEarn = false;
    }
    if (criteria.currentStreak && userStats.currentStreak < criteria.currentStreak) {
      shouldEarn = false;
    }
    
    if (shouldEarn) {
      earnedBadges.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      });
    }
  });
  
  return earnedBadges;
};

export default BADGES;