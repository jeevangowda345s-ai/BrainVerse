export type CognitiveCategory = 
  | 'memory' 
  | 'logic' 
  | 'focus' 
  | 'math' 
  | 'spatial' 
  | 'language' 
  | 'coding' 
  | 'lab';

export type GameId = 
  | 'memory_matrix' 
  | 'number_sequence' 
  | 'pattern_recognition' 
  | 'mental_math' 
  | 'sudoku' 
  | 'maze_escape' 
  | 'logic_puzzle' 
  | 'visual_rotation' 
  | 'color_shape_memory' 
  | 'quick_decision' 
  | 'attention_challenge' 
  | 'word_intelligence' 
  | 'spatial_intelligence' 
  | 'coding_logic' 
  | 'brain_lab';

export interface CognitiveRatings {
  memory: number;
  logic: number;
  focus: number;
  math: number;
  attention: number;
  speed: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  avatarFrame: string;
  title: string;
  age: number;
  occupation: string;
  education: string;
  dailyGoalMins: number;
  streak: number;
  lastActiveDate: string;
  brainScore: number;
  xp: number;
  level: number;
  coins: number;
  diamonds: number;
  brainEnergy: number;
  maxEnergy: number;
  rank: string;
  goals: string[];
  ratings: CognitiveRatings;
  badges: string[];
  unlockedCosmetics: string[];
  isPremium: boolean;
  isAdmin?: boolean;
  isOnboarded: boolean;
  isReturningUser?: boolean;
  isGuest?: boolean;
  lastWheelSpinDate?: string;
  aiRoadmap?: AIRoadmap;
  redemptionHistory?: RedemptionRecord[];
}

export interface QRMerchantConfig {
  upiId: string;
  merchantName: string;
  qrImageUrl?: string;
  wheelSpinFeeINR: number;
  redemptionFeeINR: number;
  premiumFeeINR: number;
  freeSpinsForPremium: boolean;
  freeSpinCoinsForPremium: number;
  officialEmail?: string;
  businessAddress?: string;
  verifiedMerchantSeal?: boolean;
}

export interface ProUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  utrNumber: string;
  amountINR: number;
  status: 'pending' | 'approved' | 'declined';
  timestamp: string;
  declineReason?: string;
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  userName: string;
  coinsRedeemed: number;
  inrAmount: number;
  paymentMethod: 'upi' | 'bank' | 'voucher';
  payoutDestination: string;
  feePaidAmount: number;
  utrNumber: string;
  screenshotUrl?: string;
  status: 'PENDING_VERIFICATION' | 'FEE_RECEIVED' | 'PROCESSING_PAYOUT' | 'SUCCESS' | 'REJECTED';
  timestamp: string;
  estimatedDelivery: string;
  notes?: string;
}

export interface AIRoadmap {
  title: string;
  summary: string;
  recommendedDailyRoutine: {
    time: string;
    game: string;
    duration: string;
    focus: string;
  }[];
  projected30DayGrowth: string;
}

export interface GameInfo {
  id: GameId;
  name: string;
  category: CognitiveCategory;
  description: string;
  iconName: string;
  accentColor: string;
  bgGradient: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  highScore: number;
  timesPlayed: number;
  ratingCategory: keyof CognitiveRatings;
}

export interface DailyMission {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  rewardXP: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
}

export interface ThemeSettings {
  mode: 'midnight' | 'cyber' | 'dark' | 'light';
  palette: 'midnight' | 'cyber' | 'emerald_matrix' | 'deep_amethyst' | 'solarized_ocean' | 'minimal_light' | 'sunset_ember';
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  colorBlindMode: boolean;
  leftHanded: boolean;
}

export interface MultiplayerRoom {
  id: string;
  gameId: GameId;
  gameTitle: string;
  hostName: string;
  hostRating: number;
  playersCount: number;
  maxPlayers: number;
  stakes: number;
  status: 'Waiting' | 'In Progress' | 'Finished';
  mode: '1v1 Battle' | 'Team Clash' | 'Quiz Duel' | 'Ranked Arena';
}

export interface GameSessionResult {
  gameId: GameId;
  gameName: string;
  score: number;
  accuracy: number; // percentage
  reactionTimeMs: number; // average ms
  xpEarned: number;
  coinsEarned: number;
  category: CognitiveCategory;
  timestamp: string;
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestions?: string[];
  recommendedGameId?: string;
  takeawayTip?: string;
  insights?: {
    strength?: string;
    weakness?: string;
    actionItem?: string;
  };
}
