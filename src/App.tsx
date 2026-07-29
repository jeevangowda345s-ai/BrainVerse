/**
 * BrainVerse (MindForge developed by Jeevu)
 * AI-Powered Brain Training Platform
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  
  // Storage States
  const [user, setUser] = useState<UserProfile>(loadUserProfile());
  const [theme, setTheme] = useState<ThemeSettings>(loadThemeSettings());
  const [missions, setMissions] = useState<DailyMission[]>(loadDailyMissions());
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements());
  const [sessions, setSessions] = useState<GameSessionResult[]>(loadGameSessions());

  // Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveUserProfile(user);
  }, [user]);

  useEffect(() => {
    saveThemeSettings(theme);
    audioHaptics.setPreferences(theme.soundEnabled, theme.hapticsEnabled);
  }, [theme]);

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

  // Handle Game Completion Result
  const handleGameFinish = (score: number, accuracy: number, reactionTimeMs: number) => {
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const xpGained = Math.round(score / 2);
    const coinsGained = Math.round(score / 10);
    const newXP = user.xp + xpGained;
    const newLevel = Math.floor(newXP / 300) + 1;
    const levelUpOccurred = newLevel > user.level;

    const newBrainScore = user.brainScore + Math.round(score / 20);

    // Update Skill Category Ratings
    const categoryRatingKey: keyof UserProfile['ratings'] = 
      activeGameId === 'memory_matrix' || activeGameId === 'color_shape_memory' ? 'memory'
      : activeGameId === 'mental_math' ? 'math'
      : activeGameId === 'quick_decision' || activeGameId === 'visual_rotation' ? 'speed'
      : activeGameId === 'attention_challenge' || activeGameId === 'word_intelligence' ? 'attention'
      : activeGameId === 'sudoku' || activeGameId === 'maze_escape' ? 'focus'
      : 'logic';

    const currentRating = user.ratings[categoryRatingKey];
    const newRating = Math.min(2000, currentRating + Math.round(score / 30));

    const updatedProfile: UserProfile = {
      ...user,
      xp: newXP,
      level: newLevel,
      coins: user.coins + coinsGained,
      brainScore: newBrainScore,
      ratings: {
        ...user.ratings,
        [categoryRatingKey]: newRating,
      },
    };

    setUser(updatedProfile);

    // Save Session Record
    const sessionRecord: GameSessionResult = {
      gameId: activeGameId || 'memory_matrix',
      gameName: activeGameId ? activeGameId.toUpperCase().replace('_', ' ') : 'MINI GAME',
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

    // Return to dashboard
    setActiveGameId(null);
    setActiveTab('dashboard');
  };

  const handleClaimMission = (missionId: string) => {
    audioHaptics.playCorrect();
    audioHaptics.triggerHaptic('success');
    confetti({ particleCount: 30 });

    const updatedMissions = missions.map(m => {
      if (m.id === missionId) {
        setUser(prev => ({
          ...prev,
          xp: prev.xp + m.rewardXP,
          coins: prev.coins + m.rewardCoins,
        }));
        return { ...m, claimed: true, completed: true };
      }
      return m;
    });

    setMissions(updatedMissions);
  };

  const handleCompleteOnboarding = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  const handleResetData = () => {
    localStorage.clear();
    setUser(DEFAULT_USER);
    window.location.reload();
  };

  return (
    <div className="min-h-screen font-sans bg-[#050505] text-[#E0E0E0] bg-grid-pattern transition-colors duration-300">
      
      {/* First-Time Onboarding Popup */}
      {!user.isOnboarded && (
        <OnboardingModal user={user} onComplete={handleCompleteOnboarding} />
      )}

      {/* Main Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
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
            onUpdateCoins={(amt) => setUser(prev => ({ ...prev, coins: prev.coins + amt }))}
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

    </div>
  );
}
