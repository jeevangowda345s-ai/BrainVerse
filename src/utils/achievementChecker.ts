import { Achievement, GameSessionResult, UserProfile } from '../types';

export interface AchievementCheckOutput {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
  bonusXP: number;
  bonusCoins: number;
}

export function evaluateAchievements(
  achievements: Achievement[],
  sessionResult: GameSessionResult,
  user: UserProfile
): AchievementCheckOutput {
  const newlyUnlocked: Achievement[] = [];
  let bonusXP = 0;
  let bonusCoins = 0;

  const updatedAchievements = achievements.map((ach) => {
    if (ach.unlocked) return ach; // Already unlocked

    let shouldUnlock = false;
    let newProgress = ach.progress;

    switch (ach.id) {
      case 'a1': // First Victory
        if (sessionResult.score > 0) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;

      case 'a2': // Memory Master
        if (sessionResult.gameId === 'memory_matrix' || sessionResult.gameId === 'color_shape_memory') {
          if (sessionResult.score >= 1000) {
            newProgress = 10;
            shouldUnlock = true;
          } else {
            newProgress = Math.max(ach.progress, Math.min(10, Math.floor(sessionResult.score / 100)));
          }
        }
        break;

      case 'a3': // Logic Genius
        if (
          sessionResult.gameId === 'logic_puzzle' ||
          sessionResult.gameId === 'sudoku' ||
          sessionResult.gameId === 'maze_escape' ||
          sessionResult.gameId === 'coding_logic'
        ) {
          newProgress = Math.min(20, ach.progress + 1);
          if (newProgress >= 20) {
            shouldUnlock = true;
          }
        }
        break;

      case 'a4': // 7-Day Streak
        newProgress = Math.min(7, user.streak || 0);
        if (newProgress >= 7) {
          shouldUnlock = true;
        }
        break;

      case 'a5': // Math Wizard
        if (sessionResult.gameId === 'mental_math') {
          newProgress = Math.max(ach.progress, sessionResult.score);
          if (newProgress >= 1500) {
            shouldUnlock = true;
          }
        }
        break;

      case 'a6': // Speed Demon
        if (
          sessionResult.gameId === 'quick_decision' ||
          sessionResult.gameId === 'visual_rotation' ||
          sessionResult.gameId === 'attention_challenge'
        ) {
          if (sessionResult.reactionTimeMs > 0 && sessionResult.reactionTimeMs <= 500) {
            newProgress = 1;
            shouldUnlock = true;
          }
        }
        break;

      case 'a7': // Perfect Precision
        if (sessionResult.accuracy >= 100) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;

      case 'a8': // High Scorer
        if (sessionResult.score >= 800) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;

      default:
        // Generic fallback check
        if (ach.progress >= ach.maxProgress) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      const unlockedAch = {
        ...ach,
        progress: ach.maxProgress,
        unlocked: true,
      };
      newlyUnlocked.push(unlockedAch);
      bonusXP += 150;
      bonusCoins += 50;
      return unlockedAch;
    }

    return {
      ...ach,
      progress: newProgress,
    };
  });

  return {
    updatedAchievements,
    newlyUnlocked,
    bonusXP,
    bonusCoins,
  };
}
