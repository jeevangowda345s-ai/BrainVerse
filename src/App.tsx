/**
 * BrainVerse (MindForge developed by Jeevu)
 * AI-Powered Brain Training Platform with Real-Time Firebase Auth & Sync
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GamesCatalog } from './components/GamesCatalog';
import { AICoach } from './components/AICoach';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MultiplayerHub } from './components/MultiplayerHub';
import { GamificationHub } from './components/GamificationHub';
import { AdminPanel } from './components/AdminPanel';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';

// Mini Games
import { MemoryMatrix } from './components/games/MemoryMatrix';
import { NumberSequence } from './components/games/NumberSequence';
import { MentalMath } from './components/games/MentalMath';
import { MazeEscape } from './components/games/MazeEscape';
import { SudokuGame } from './components/games/SudokuGame';
import { QuickDecision } from './components/games/QuickDecision';
import { WordIntelligence } from './components/games/WordIntelligence';
import { CodingLogic } from './components/games/CodingLogic';
import { BrainLab } from './components/games/BrainLab';

import {
  UserProfile,
  ThemeSettings,
  DailyMission,
  Achievement,
  GameSessionResult,
  GameId
} from './types';

import {
  loadUserProfile,
  saveUserProfile,
  loadThemeSettings,
  saveThemeSettings,
  loadDailyMissions,
  saveDailyMissions,
  loadAchievements,
  saveAchievements,
  loadGameSessions,
  saveGameSession,
  DEFAULT_USER
} from './utils/storage';

import { audioHaptics } from './utils/audioHaptics';
import { processDailyStreak } from './utils/streak';
import { evaluateAchievements } from './utils/achievementChecker';
import { AchievementToast } from './components/AchievementToast';
import { getThemeConfig } from './utils/theme';

// Firebase Real-time Imports
import { auth, onAuthStateChanged, signInAnonymously } from './lib/firebase';
import { 
  subscribeToUserProfile, 
  saveUserProfileToFirestore, 
  logGameSessionToFirestore, 
  addCoinsInFirestore,
  addWheelRewardsInFirestore
} from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  
  // Storage & Profile States
  const [user, setUser] = useState<UserProfile>(loadUserProfile());
  const [theme, setTheme] = useState<ThemeSettings>(loadThemeSettings());
  const [missions, setMissions] = useState<DailyMission[]>(loadDailyMissions());
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements());
  const [sessions, setSessions] = useState<GameSessionResult[]>(loadGameSessions());

  // Modals & Toast State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [unlockedToastAchievement, setUnlockedToastAchievement] = useState<Achievement | null>(null);

  // Authentication Enforcement State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Subscribe to Firebase Auth state & Firestore real-time User Profile sync
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        if (unsubProfile) unsubProfile();
        unsubProfile = subscribeToUserProfile(firebaseUser.uid, (firestoreProfile) => {
          if (firestoreProfile) {
            setUser(prev => ({
              ...prev,
              ...firestoreProfile,
              id: firebaseUser.uid,
              email: firebaseUser.email || prev.email,
            }));
          }
        });
      } else {
        // When no active Firebase user is logged in, require Register / Login screen first
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {}
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setActiveGameId(null);
  };

  // Handle User Profile Updates (Streak, Coins, Wheel, Settings)
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    if (updatedUser.id) {
      saveUserProfileToFirestore(updatedUser);
    }
  };

  // Sync to local storage & Firestore backup
  useEffect(() => {
    saveUserProfile(user);
    if (user.id) {
      saveUserProfileToFirestore(user);
    }
  }, [user]);

  useEffect(() => {
    saveThemeSettings(theme);
    audioHaptics.setPreferences(theme.soundEnabled, theme.hapticsEnabled);

    // Apply global Tailwind CSS class & data-theme attribute
    const root = document.documentElement;
    root.classList.remove('theme-midnight', 'theme-cyber');
    if (theme.palette === 'cyber' || theme.mode === 'cyber') {
      root.classList.add('theme-cyber');
      root.setAttribute('data-theme', 'cyber');
    } else {
      root.classList.add('theme-midnight');
      root.setAttribute('data-theme', 'midnight');
    }
  }, [theme]);

  // Handle Daily Lucky Wheel Reward Claim (Atomically adds Brain Score, Coins, Diamonds & XP)
  const handleClaimWheelReward = (rewards: { coins?: number; brainScore?: number; diamonds?: number; xp?: number }) => {
    audioHaptics.playCorrect();
    audioHaptics.triggerHaptic('success');

    setUser(prevUser => {
      const addedCoins = rewards.coins || 0;
      const addedBrain = rewards.brainScore || 0;
      const addedDiamonds = rewards.diamonds || 0;
      const addedXP = rewards.xp || 0;

      const newXP = (prevUser.xp || 0) + addedXP;
      const newLevel = Math.floor(newXP / 300) + 1;

      return {
        ...prevUser,
        coins: (prevUser.coins || 0) + addedCoins,
        brainScore: (prevUser.brainScore || 0) + addedBrain,
        diamonds: (prevUser.diamonds || 0) + addedDiamonds,
        xp: newXP,
        level: newLevel,
      };
    });

    if (user.id) {
      addWheelRewardsInFirestore(user.id, rewards);
    }
  };

  useEffect(() => {
    saveDailyMissions(missions);
  }, [missions]);

  useEffect(() => {
    saveAchievements(achievements);
  }, [achievements]);

  // Handle Game Selection
  const handleSelectGame = (gameId: string) => {
    setActiveGameId(gameId as GameId);
    setActiveTab('game_active');
  };

  // Handle Game Completion Result with Functional State Update (Fixes Coins Not Adding Up)
  const handleGameFinish = (score: number, accuracy: number, reactionTimeMs: number) => {
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const xpGained = Math.max(20, Math.round(score / 2));
    const coinsGained = Math.max(15, Math.round(score / 10));

    const categoryRatingKey: keyof UserProfile['ratings'] = 
      activeGameId === 'memory_matrix' || activeGameId === 'color_shape_memory' ? 'memory'
      : activeGameId === 'mental_math' ? 'math'
      : activeGameId === 'quick_decision' || activeGameId === 'visual_rotation' ? 'speed'
      : activeGameId === 'attention_challenge' || activeGameId === 'word_intelligence' ? 'attention'
      : activeGameId === 'sudoku' || activeGameId === 'maze_escape' ? 'focus'
      : 'logic';

    // Functional State Update to guarantee coins and XP add up correctly without stale closures
    setUser(prevUser => {
      const newXP = (prevUser.xp || 0) + xpGained;
      const newLevel = Math.floor(newXP / 300) + 1;
      const newBrainScore = (prevUser.brainScore || 1000) + Math.round(score / 20);
      const currentRating = prevUser.ratings[categoryRatingKey] || 1200;
      const newRating = Math.min(2500, currentRating + Math.round(score / 30));

      return {
        ...prevUser,
        xp: newXP,
        level: newLevel,
        coins: (prevUser.coins || 0) + coinsGained,
        brainScore: newBrainScore,
        ratings: {
          ...prevUser.ratings,
          [categoryRatingKey]: newRating,
        },
      };
    });

    // Save Session Record to Local & Real-time Firestore
    const sessionRecord: GameSessionResult = {
      gameId: activeGameId || 'memory_matrix',
      gameName: activeGameId ? activeGameId.toUpperCase().replace(/_/g, ' ') : 'MINI GAME',
      score,
      accuracy,
      reactionTimeMs,
      xpEarned: xpGained,
      coinsEarned: coinsGained,
      category: 'memory',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    saveGameSession(sessionRecord);
    setSessions(prev => [sessionRecord, ...prev]);

    // Firestore atomic session and coin logger
    if (user.id) {
      logGameSessionToFirestore(user.id, user.name, sessionRecord);
    }

    // Evaluate Achievements & Trigger Toast Notification
    const { updatedAchievements, newlyUnlocked, bonusXP, bonusCoins } = evaluateAchievements(
      achievements,
      sessionRecord,
      user
    );

    setAchievements(updatedAchievements);

    if (newlyUnlocked.length > 0) {
      setUnlockedToastAchievement(newlyUnlocked[0]);

      if (bonusXP > 0 || bonusCoins > 0) {
        setUser(prev => ({
          ...prev,
          xp: (prev.xp || 0) + bonusXP,
          coins: (prev.coins || 0) + bonusCoins,
        }));
      }
    }

    // Return to dashboard
    setActiveGameId(null);
    setActiveTab('dashboard');
  };

  // Claim Mission with Functional State Update
  const handleClaimMission = (missionId: string) => {
    audioHaptics.playCorrect();
    audioHaptics.triggerHaptic('success');
    confetti({ particleCount: 35 });

    const targetMission = missions.find(m => m.id === missionId);
    if (targetMission && !targetMission.claimed) {
      const rewardCoins = targetMission.rewardCoins || 50;
      const rewardXP = targetMission.rewardXP || 100;

      setUser(prev => ({
        ...prev,
        xp: (prev.xp || 0) + rewardXP,
        coins: (prev.coins || 0) + rewardCoins,
      }));

      if (user.id) {
        addCoinsInFirestore(user.id, rewardCoins);
      }

      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true, completed: true } : m));
    }
  };

  const handleUpdateCoins = (amount: number) => {
    audioHaptics.playCorrect();
    setUser(prev => ({ ...prev, coins: (prev.coins || 0) + amount }));
    if (user.id) {
      addCoinsInFirestore(user.id, amount);
    }
  };

  const handleCompleteOnboarding = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const handleResetData = () => {
    localStorage.clear();
    setUser(DEFAULT_USER);
    window.location.reload();
  };

  // Show Loading screen while Firebase Auth checks session
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#00F5FF]/20 border-t-[#00F5FF] rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 animate-pulse">Initializing BrainVerse Platform...</p>
      </div>
    );
  }

  // Enforce Registration & Login Page when user is not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
        currentUser={user}
        onAuthSuccess={(newProfile) => {
          setUser(newProfile);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const themeConfig = getThemeConfig(theme.palette);

  return (
    <div className={`min-h-screen font-sans ${themeConfig.bgClass} bg-grid-pattern transition-colors duration-300`}>
      
      {/* First-Time Onboarding Popup */}
      {!user.isOnboarded && (
        <OnboardingModal user={user} onComplete={handleCompleteOnboarding} />
      )}

      {/* Auth Modal (Register & Login Details) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={user}
        onAuthSuccess={(newProfile) => setUser(newProfile)}
      />

      {/* Main Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            missions={missions}
            onSelectGame={handleSelectGame}
            onNavigateTab={setActiveTab}
            onClaimMission={handleClaimMission}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'games' && (
          <GamesCatalog onSelectGame={handleSelectGame} />
        )}

        {activeTab === 'coach' && (
          <AICoach user={user} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard user={user} sessions={sessions} />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerHub user={user} />
        )}

        {activeTab === 'missions' && (
          <GamificationHub
            user={user}
            missions={missions}
            achievements={achievements}
            onClaimMission={handleClaimMission}
            onUpdateCoins={handleUpdateCoins}
            onClaimWheelReward={handleClaimWheelReward}
            onTestTriggerToast={(ach) => setUnlockedToastAchievement(ach)}
          />
        )}

        {activeTab === 'lab' && (
          <BrainLab
            onBack={() => setActiveTab('games')}
            onFinish={handleGameFinish}
          />
        )}

        {/* ACTIVE MINI GAME RUNNER */}
        {activeTab === 'game_active' && (
          <div>
            {activeGameId === 'memory_matrix' && (
              <MemoryMatrix onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'number_sequence' && (
              <NumberSequence onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'mental_math' && (
              <MentalMath onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'maze_escape' && (
              <MazeEscape onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'sudoku' && (
              <SudokuGame onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'quick_decision' && (
              <QuickDecision onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'word_intelligence' && (
              <WordIntelligence onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {activeGameId === 'coding_logic' && (
              <CodingLogic onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
            {(activeGameId === 'brain_lab' || activeGameId === 'pattern_recognition' || activeGameId === 'logic_puzzle' || activeGameId === 'visual_rotation' || activeGameId === 'color_shape_memory' || activeGameId === 'attention_challenge' || activeGameId === 'spatial_intelligence') && (
              <BrainLab onBack={() => setActiveTab('games')} onFinish={handleGameFinish} />
            )}
          </div>
        )}

      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          theme={theme}
          setTheme={setTheme}
          onClose={() => setShowSettings(false)}
          onResetData={handleResetData}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <AdminPanel user={user} />
          </div>
        </div>
      )}

      {/* Achievement Unlocked Toast Notification System */}
      <AchievementToast
        achievement={unlockedToastAchievement}
        onClose={() => setUnlockedToastAchievement(null)}
      />

    </div>
  );
}
