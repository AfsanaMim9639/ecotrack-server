export const BADGE_DEFINITIONS = {
  first_challenge: {
    badgeId: 'first_challenge',
    name: 'First Step',
    description: 'Joined your first challenge',
    icon: '🌱',
    requirement: (stats) => stats.totalChallengesJoined >= 1
  },
  five_challenges: {
    badgeId: 'five_challenges',
    name: 'Getting Started',
    description: 'Joined 5 challenges',
    icon: '🌿',
    requirement: (stats) => stats.totalChallengesJoined >= 5
  },
  ten_challenges: {
    badgeId: 'ten_challenges',
    name: 'Eco Enthusiast',
    description: 'Joined 10 challenges',
    icon: '🌳',
    requirement: (stats) => stats.totalChallengesJoined >= 10
  },
  first_completion: {
    badgeId: 'first_completion',
    name: 'Finisher',
    description: 'Completed your first challenge',
    icon: '✅',
    requirement: (stats) => stats.totalChallengesCompleted >= 1
  },
  five_completions: {
    badgeId: 'five_completions',
    name: 'Achiever',
    description: 'Completed 5 challenges',
    icon: '🎯',
    requirement: (stats) => stats.totalChallengesCompleted >= 5
  },
  hundred_points: {
    badgeId: 'hundred_points',
    name: 'Century',
    description: 'Earned 100 points',
    icon: '💯',
    requirement: (stats) => stats.totalPoints >= 100
  },
  week_streak: {
    badgeId: 'week_streak',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '🔥',
    requirement: (stats) => stats.currentStreak >= 7
  }
};

export const checkBadges = (stats) => {
  const earnedBadges = [];

  Object.values(BADGE_DEFINITIONS).forEach(badge => {
    if (badge.requirement(stats)) {
      earnedBadges.push({
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date()
      });
    }
  });

  return earnedBadges;
};

