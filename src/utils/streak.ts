import { UserProfile } from '../types';

export interface StreakCheckResult {
  updatedUser: UserProfile;
  streakIncremented: boolean;
  claimedToday: boolean;
}

export function processDailyStreak(user: UserProfile): StreakCheckResult {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateStr = user.lastActiveDate;

  if (!lastDateStr) {
    return {
      updatedUser: {
        ...user,
        streak: 1,
        lastActiveDate: todayStr,
      },
      streakIncremented: true,
      claimedToday: true,
    };
  }

  if (lastDateStr === todayStr) {
    // User already checked in today!
    return {
      updatedUser: user,
      streakIncremented: false,
      claimedToday: true,
    };
  }

  // Calculate difference in calendar days
  const lastDate = new Date(lastDateStr + 'T00:00:00');
  const currentDate = new Date(todayStr + 'T00:00:00');
  const diffTime = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day visit! Increment streak
    const newStreak = (user.streak || 0) + 1;
    const newXP = (user.xp || 0) + 100;
    const newCoins = (user.coins || 0) + 50;

    return {
      updatedUser: {
        ...user,
        streak: newStreak,
        lastActiveDate: todayStr,
        xp: newXP,
        coins: newCoins,
      },
      streakIncremented: true,
      claimedToday: true,
    };
  } else if (diffDays > 1) {
    // Missed 1 or more days -> reset streak to 1
    return {
      updatedUser: {
        ...user,
        streak: 1,
        lastActiveDate: todayStr,
        coins: (user.coins || 0) + 25,
        xp: (user.xp || 0) + 50,
      },
      streakIncremented: false,
      claimedToday: true,
    };
  }

  return {
    updatedUser: user,
    streakIncremented: false,
    claimedToday: true,
  };
}

export function getWeekDaysStatus(streak: number, lastActiveDate?: string) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const todayStr = today.toISOString().split('T')[0];
  const isTodayActive = lastActiveDate === todayStr;

  return days.map((dayLabel, index) => {
    let status: 'completed' | 'today' | 'upcoming' | 'missed' = 'upcoming';

    if (index < currentDayIndex) {
      // Past days in current week
      const daysAgo = currentDayIndex - index;
      if (streak >= daysAgo + (isTodayActive ? 1 : 0)) {
        status = 'completed';
      } else {
        status = 'missed';
      }
    } else if (index === currentDayIndex) {
      status = isTodayActive ? 'completed' : 'today';
    } else {
      status = 'upcoming';
    }

    return {
      label: dayLabel,
      isToday: index === currentDayIndex,
      status,
    };
  });
}
