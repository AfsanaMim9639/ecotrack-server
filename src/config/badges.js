// config/badges.js
export const checkBadges = (stats) => {
  const badges = [];
  
  // Points-based badges
  if (stats.totalPoints >= 100) {
    badges.push({
      badgeId: 'eco-starter',
      name: 'Eco Starter',
      description: 'Earned 100 points',
      icon: '🌱',
      earnedAt: new Date()
    });
  }
  
  if (stats.totalPoints >= 500) {
    badges.push({
      badgeId: 'eco-warrior',
      name: 'Eco Warrior',
      description: 'Earned 500 points',
      icon: '⚔️',
      earnedAt: new Date()
    });
  }
  
  // Challenge-based badges
  if (stats.totalChallengesCompleted >= 5) {
    badges.push({
      badgeId: 'challenge-master',
      name: 'Challenge Master',
      description: 'Completed 5 challenges',
      icon: '🏆',
      earnedAt: new Date()
    });
  }
  
  // Streak-based badges
  if (stats.currentStreak >= 7) {
    badges.push({
      badgeId: 'week-warrior',
      name: 'Week Warrior',
      description: '7 day streak',
      icon: '🔥',
      earnedAt: new Date()
    });
  }
  
  return badges;
};