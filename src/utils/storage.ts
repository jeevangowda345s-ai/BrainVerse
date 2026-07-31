import { 
  UserProfile, 
  GameInfo, 
  DailyMission, 
  Achievement, 
  ThemeSettings, 
  GameSessionResult,
  MultiplayerRoom
} from '../types';

const USER_KEY = 'mindforge_user_profile_v2';
const THEME_KEY = 'mindforge_theme_settings_v2';
const MISSIONS_KEY = 'mindforge_daily_missions_v2';
const ACHIEVEMENTS_KEY = 'mindforge_achievements_v2';
const SESSIONS_KEY = 'mindforge_game_sessions_v2';

export const INITIAL_GAMES: GameInfo[] = [
  {
    id: 'memory_matrix',
    name: 'Memory Matrix',
    category: 'memory',
    description: 'Memorize highlighted tile patterns in expanding grids before they vanish.',
    iconName: 'Grid3x3',
    accentColor: 'from-cyan-500 to-blue-600',
    bgGradient: 'bg-gradient-to-br from-cyan-900/30 to-blue-900/40',
    difficulty: 'Intermediate',
    highScore: 2400,
    timesPlayed: 12,
    ratingCategory: 'memory',
  },
  {
    id: 'number_sequence',
    name: 'Number Sequence',
    category: 'logic',
    description: 'Find missing numbers in complex progression rules & Fibonacci steps.',
    iconName: 'Hash',
    accentColor: 'from-purple-500 to-indigo-600',
    bgGradient: 'bg-gradient-to-br from-purple-900/30 to-indigo-900/40',
    difficulty: 'Advanced',
    highScore: 1850,
    timesPlayed: 8,
    ratingCategory: 'logic',
  },
  {
    id: 'pattern_recognition',
    name: 'Pattern Recognition',
    category: 'logic',
    description: 'Analyze matrix shape transitions and deduce missing visual elements.',
    iconName: 'Shapes',
    accentColor: 'from-fuchsia-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-fuchsia-900/30 to-pink-900/40',
    difficulty: 'Intermediate',
    highScore: 2100,
    timesPlayed: 15,
    ratingCategory: 'logic',
  },
  {
    id: 'mental_math',
    name: 'Mental Math',
    category: 'math',
    description: 'Rapid-fire arithmetic, fractions, percentages, and algebraic estimations.',
    iconName: 'Calculator',
    accentColor: 'from-emerald-400 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-emerald-900/30 to-teal-900/40',
    difficulty: 'Beginner',
    highScore: 3200,
    timesPlayed: 20,
    ratingCategory: 'math',
  },
  {
    id: 'sudoku',
    name: 'Sudoku Master',
    category: 'focus',
    description: 'Classic & AI-generated Sudoku grids with smart pencil notes & level scaling.',
    iconName: 'LayoutGrid',
    accentColor: 'from-amber-400 to-orange-600',
    bgGradient: 'bg-gradient-to-br from-amber-900/30 to-orange-900/40',
    difficulty: 'Expert',
    highScore: 1400,
    timesPlayed: 6,
    ratingCategory: 'focus',
  },
  {
    id: 'maze_escape',
    name: 'Maze Escape',
    category: 'focus',
    description: 'Navigate procedural mazes with Fog of War, key doors, and moving obstacles.',
    iconName: 'Compass',
    accentColor: 'from-blue-400 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/40',
    difficulty: 'Intermediate',
    highScore: 2800,
    timesPlayed: 9,
    ratingCategory: 'focus',
  },
  {
    id: 'logic_puzzle',
    name: 'Logic Puzzles',
    category: 'logic',
    description: 'Solve River Crossing, Balance Scales, Tower of Hanoi, and Truth/Lie riddles.',
    iconName: 'BrainCircuit',
    accentColor: 'from-violet-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-violet-900/30 to-purple-900/40',
    difficulty: 'Expert',
    highScore: 1900,
    timesPlayed: 11,
    ratingCategory: 'logic',
  },
  {
    id: 'visual_rotation',
    name: 'Visual 3D Rotation',
    category: 'spatial',
    description: 'Compare 3D geometric polyhedrons under spatial axial rotations.',
    iconName: 'Box',
    accentColor: 'from-rose-500 to-red-600',
    bgGradient: 'bg-gradient-to-br from-rose-900/30 to-red-900/40',
    difficulty: 'Advanced',
    highScore: 1650,
    timesPlayed: 7,
    ratingCategory: 'speed',
  },
  {
    id: 'color_shape_memory',
    name: 'Dual Color & Shape Memory',
    category: 'memory',
    description: 'Track position, shape, and color sequences simultaneously in Dual N-Back style.',
    iconName: 'Palette',
    accentColor: 'from-sky-400 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-sky-900/30 to-indigo-900/40',
    difficulty: 'Intermediate',
    highScore: 2300,
    timesPlayed: 14,
    ratingCategory: 'memory',
  },
  {
    id: 'quick_decision',
    name: 'Quick Decision (Stroop)',
    category: 'focus',
    description: 'Override cognitive interference: match text color against word meaning fast!',
    iconName: 'Zap',
    accentColor: 'from-yellow-400 to-amber-500',
    bgGradient: 'bg-gradient-to-br from-yellow-900/30 to-amber-900/40',
    difficulty: 'Beginner',
    highScore: 3500,
    timesPlayed: 25,
    ratingCategory: 'speed',
  },
  {
    id: 'attention_challenge',
    name: 'Attention Matrix',
    category: 'focus',
    description: 'Spot the Odd One Out and locate micro-variations in dense visual fields.',
    iconName: 'Target',
    accentColor: 'from-teal-400 to-emerald-600',
    bgGradient: 'bg-gradient-to-br from-teal-900/30 to-emerald-900/40',
    difficulty: 'Intermediate',
    highScore: 2750,
    timesPlayed: 18,
    ratingCategory: 'attention',
  },
  {
    id: 'word_intelligence',
    name: 'Word Intelligence',
    category: 'language',
    description: 'Master anagrams, synonyms, antonyms, and vocabulary builder challenges.',
    iconName: 'BookOpen',
    accentColor: 'from-orange-400 to-rose-500',
    bgGradient: 'bg-gradient-to-br from-orange-900/30 to-rose-900/40',
    difficulty: 'Intermediate',
    highScore: 2200,
    timesPlayed: 10,
    ratingCategory: 'attention',
  },
  {
    id: 'spatial_intelligence',
    name: 'Spatial Tangram',
    category: 'spatial',
    description: 'Assemble geometric block pieces to match complex silhouette targets.',
    iconName: 'Layers',
    accentColor: 'from-cyan-400 to-blue-500',
    bgGradient: 'bg-gradient-to-br from-cyan-900/30 to-blue-900/40',
    difficulty: 'Advanced',
    highScore: 1950,
    timesPlayed: 8,
    ratingCategory: 'speed',
  },
  {
    id: 'coding_logic',
    name: 'Coding Logic',
    category: 'coding',
    description: 'Build algorithmic node instructions (Loops, If/Else) to guide the neural agent.',
    iconName: 'Code',
    accentColor: 'from-indigo-400 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-indigo-900/30 to-purple-900/40',
    difficulty: 'Advanced',
    highScore: 2600,
    timesPlayed: 13,
    ratingCategory: 'logic',
  },
  {
    id: 'brain_lab',
    name: 'Brain Lab Sandbox',
    category: 'lab',
    description: 'AI procedural game generator: synthesize custom rulesets & infinite challenges.',
    iconName: 'Sparkles',
    accentColor: 'from-pink-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-pink-900/30 to-purple-900/40',
    difficulty: 'Master',
    highScore: 3100,
    timesPlayed: 19,
    ratingCategory: 'logic',
  }
];

export const DEFAULT_USER: UserProfile = {
  id: 'guest_user',
  name: 'Guest Player',
  username: 'guest_player',
  avatar: '⚡',
  avatarFrame: 'Standard',
  title: 'Novice Mind',
  age: 20,
  occupation: 'Student',
  education: 'High School / College',
  dailyGoalMins: 15,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  brainScore: 100,
  xp: 0,
  level: 1,
  coins: 100,
  diamonds: 10,
  brainEnergy: 100,
  maxEnergy: 100,
  rank: 'Apprentice Mind',
  goals: ['Improve Memory', 'Improve Focus'],
  ratings: {
    memory: 1000,
    logic: 1000,
    focus: 1000,
    math: 1000,
    attention: 1000,
    speed: 1000,
  },
  badges: ['First Step'],
  unlockedCosmetics: [],
  isPremium: false,
  isOnboarded: true,
};

export const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Complete 3 Cognitive Games',
    category: 'Daily Practice',
    target: 3,
    current: 1,
    rewardXP: 150,
    rewardCoins: 50,
    completed: false,
    claimed: false,
  },
  {
    id: 'm2',
    title: 'Achieve 90%+ Accuracy in Mental Math',
    category: 'Precision',
    target: 1,
    current: 0,
    rewardXP: 200,
    rewardCoins: 75,
    completed: false,
    claimed: false,
  },
  {
    id: 'm3',
    title: 'Beat Memory Matrix Level 5',
    category: 'Memory Training',
    target: 5,
    current: 3,
    rewardXP: 250,
    rewardCoins: 100,
    completed: false,
    claimed: false,
  },
  {
    id: 'm4',
    title: 'Practice for 15 minutes today',
    category: 'Consistency',
    target: 15,
    current: 10,
    rewardXP: 300,
    rewardCoins: 120,
    completed: false,
    claimed: false,
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'First Victory',
    description: 'Complete your first brain training game with high score.',
    icon: 'Trophy',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    category: 'Milestones',
    tier: 'bronze',
  },
  {
    id: 'a2',
    title: 'Memory Master',
    description: 'Reach score over 1,000 points in Memory Matrix.',
    icon: 'Brain',
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    category: 'Memory',
    tier: 'gold',
  },
  {
    id: 'a3',
    title: 'Logic Genius',
    description: 'Solve 20 Logic Puzzles & Number Sequences.',
    icon: 'Lightbulb',
    progress: 18,
    maxProgress: 20,
    unlocked: false,
    category: 'Logic',
    tier: 'silver',
  },
  {
    id: 'a4',
    title: '7-Day Streak',
    description: 'Train your brain for 7 consecutive days.',
    icon: 'Flame',
    progress: 7,
    maxProgress: 7,
    unlocked: true,
    category: 'Dedication',
    tier: 'gold',
  },
  {
    id: 'a5',
    title: 'Math Wizard',
    description: 'Score over 1,500 points in Mental Math challenge.',
    icon: 'Zap',
    progress: 800,
    maxProgress: 1500,
    unlocked: false,
    category: 'Math',
    tier: 'silver',
  },
  {
    id: 'a6',
    title: 'Speed Demon',
    description: 'Achieve under 500ms reaction time in Quick Decision.',
    icon: 'Gauge',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    category: 'Speed',
    tier: 'diamond',
  },
  {
    id: 'a7',
    title: 'Perfect Precision',
    description: 'Achieve 100% accuracy in any cognitive training session.',
    icon: 'Target',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    category: 'Precision',
    tier: 'master',
  },
  {
    id: 'a8',
    title: 'High Scorer',
    description: 'Score over 800 points in a single session.',
    icon: 'Award',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    category: 'Milestones',
    tier: 'silver',
  },
];

export const DEFAULT_THEME: ThemeSettings = {
  mode: 'midnight',
  palette: 'midnight',
  hapticsEnabled: true,
  soundEnabled: true,
  fontSize: 'normal',
  colorBlindMode: false,
  leftHanded: false,
};

export const DEFAULT_MULTIPLAYER_ROOMS: MultiplayerRoom[] = [
  {
    id: 'room_1',
    gameId: 'memory_matrix',
    gameTitle: 'Memory Matrix Blitz',
    hostName: 'NeuroMaster_99',
    hostRating: 1540,
    playersCount: 1,
    maxPlayers: 2,
    stakes: 100,
    status: 'Waiting',
    mode: '1v1 Battle',
  },
  {
    id: 'room_2',
    gameId: 'mental_math',
    gameTitle: 'Speed Math Clash',
    hostName: 'MathWizard_X',
    hostRating: 1620,
    playersCount: 3,
    maxPlayers: 4,
    stakes: 250,
    status: 'Waiting',
    mode: 'Team Clash',
  },
  {
    id: 'room_3',
    gameId: 'quick_decision',
    gameTitle: 'Reflex Speed Duel',
    hostName: 'CyberFlash',
    hostRating: 1490,
    playersCount: 2,
    maxPlayers: 2,
    stakes: 150,
    status: 'In Progress',
    mode: '1v1 Battle',
  },
];

// Helper Storage Functions
export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return DEFAULT_USER;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const saved = localStorage.getItem(THEME_KEY);
  if (!saved) return DEFAULT_THEME;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_THEME;
  }
}

export function saveThemeSettings(theme: ThemeSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

export function loadDailyMissions(): DailyMission[] {
  if (typeof window === 'undefined') return DEFAULT_MISSIONS;
  const saved = localStorage.getItem(MISSIONS_KEY);
  if (!saved) return DEFAULT_MISSIONS;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_MISSIONS;
  }
}

export function saveDailyMissions(missions: DailyMission[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
}

export function loadAchievements(): Achievement[] {
  if (typeof window === 'undefined') return DEFAULT_ACHIEVEMENTS;
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (!saved) return DEFAULT_ACHIEVEMENTS;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export function loadGameSessions(): GameSessionResult[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SESSIONS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

export function saveGameSession(session: GameSessionResult) {
  if (typeof window === 'undefined') return;
  const sessions = loadGameSessions();
  sessions.unshift(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
}
