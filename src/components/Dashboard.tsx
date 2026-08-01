import React from 'react';
import { 
  Brain, 
  Flame, 
  Zap, 
  Trophy, 
  Target, 
  Bot, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  BarChart2, 
  Activity,
  Award,
  BookOpen,
  Crown,
  Camera
} from 'lucide-react';
import { UserProfile, GameInfo, DailyMission, CognitiveRatings } from '../types';
import { INITIAL_GAMES, loadQRMerchantConfig } from '../utils/storage';
import { audioHaptics } from '../utils/audioHaptics';
import { DailyStreakTracker } from './DailyStreakTracker';

interface DashboardProps {
  user: UserProfile;
  missions: DailyMission[];
  onSelectGame: (gameId: string) => void;
  onNavigateTab: (tab: string) => void;
  onClaimMission: (missionId: string) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenPremium?: () => void;
  onOpenAvatarModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  missions,
  onSelectGame,
  onNavigateTab,
  onClaimMission,
  onUpdateUser,
  onOpenPremium,
  onOpenAvatarModal,
}) => {
  const dailyQuotes = [
    "“The mind is not a vessel to be filled, but a fire to be kindled.” — Plutarch",
    "“Neuroplasticity proves that your brain adapts to every challenge you conquer.”",
    "“Consistency over intensity: 15 minutes of focus daily builds legendary cognitive agility.”",
    "“Logic is the anatomy of thought.” — John Locke"
  ];
  const todayQuote = dailyQuotes[Math.floor(user.brainScore / 100) % dailyQuotes.length];

  const skillMeters: { key: keyof CognitiveRatings; label: string; color: string; icon: string }[] = [
    { key: 'memory', label: 'Memory', color: 'from-cyan-500 to-blue-500', icon: '🧠' },
    { key: 'logic', label: 'Logic', color: 'from-purple-500 to-indigo-500', icon: '💡' },
    { key: 'focus', label: 'Focus', color: 'from-fuchsia-500 to-pink-500', icon: '🎯' },
    { key: 'math', label: 'Mathematics', color: 'from-emerald-400 to-teal-500', icon: '🔢' },
    { key: 'attention', label: 'Attention', color: 'from-amber-400 to-orange-500', icon: '⚡' },
    { key: 'speed', label: 'Processing Speed', color: 'from-rose-500 to-red-500', icon: '🚀' },
  ];

  const handleGameLaunch = (gameId: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    onSelectGame(gameId);
  };

  const isRegisteredAccountLogin = Boolean(user.email && user.isReturningUser !== false && !user.isGuest);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* HERO SECTION: Daily Brain Score & Today's Challenge */}
      <div className="relative overflow-hidden rounded-3xl bg-[#080808] border border-[#1A1A1A] p-6 sm:p-8 shadow-2xl shadow-[#00F5FF]/5">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F5FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Greeting & Brain Score */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* User Profile Avatar Header Banner */}
            <div className="flex items-center gap-4">
              <div 
                onClick={onOpenAvatarModal}
                className="relative group cursor-pointer shrink-0"
                title="Click to capture or change profile avatar photo"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 p-1 border-2 border-[#00F5FF] group-hover:border-purple-400 transition shadow-[0_0_20px_rgba(0,245,255,0.3)] overflow-hidden flex items-center justify-center">
                  {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.includes('/')) ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl">{user.avatar || '🧠'}</span>
                  )}
                </div>

                {/* Camera Overlay Badge */}
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#00F5FF] text-slate-950 font-black shadow-lg group-hover:scale-110 transition">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Daily Status
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {user.rank}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {isRegisteredAccountLogin ? (
                    <>Welcome back to <span className="text-[#00F5FF]">Jeevu's explorer!!</span></>
                  ) : (
                    <>Welcome to <span className="text-[#00F5FF]">Jeevu's explorer!!</span></>
                  )}
                </h1>
                <p className="text-xs text-slate-400 font-medium">{user.name} ({user.email || 'Guest Explorer'})</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#AAAAAA] italic border-l-2 border-[#00F5FF]/50 pl-3">
              {todayQuote}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#0A0A0C] p-3 rounded-2xl border border-[#1A1A1A]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#666666] font-bold">Brain Score</div>
                <div className="text-xl sm:text-2xl font-black text-[#00F5FF] flex items-center gap-1">
                  <Brain className="w-5 h-5 text-[#00F5FF]" />
                  <span>{user.brainScore}</span>
                </div>
              </div>

              <div className="bg-[#0A0A0C] p-3 rounded-2xl border border-[#1A1A1A]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#666666] font-bold">Streak</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>{user.streak} Days</span>
                </div>
              </div>

              <div className="bg-[#0A0A0C] p-3 rounded-2xl border border-[#1A1A1A]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#666666] font-bold">Level XP</div>
                <div className="text-xl sm:text-2xl font-black text-purple-400 flex items-center gap-1">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span>{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Today's Featured Challenge Card */}
          <div className="lg:col-span-5 bg-[#0D0D10] p-6 rounded-2xl border border-[#1A1A1A] hover:border-[#00F5FF]/40 transition duration-300 shadow-xl relative group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#00F5FF] bg-[#00F5FF]/10 px-2.5 py-1 rounded border border-[#00F5FF]/30">
                Master Challenge
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                +250 XP
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Memory Matrix Grid 5x5</h3>
            <p className="text-xs text-[#888888] mb-4">
              Memorize 8 flashing tiles in under 3 seconds. Strengthens working memory & spatial recall.
            </p>

            <button
              onClick={() => handleGameLaunch('memory_matrix')}
              className="w-full py-3 rounded-xl bg-[#00F5FF] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#00D6E0] transition shadow-[0_0_20px_rgba(0,245,255,0.25)] group-hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Today's Challenge</span>
            </button>
          </div>

        </div>
      </div>

      {/* DAILY STREAK TRACKING SYSTEM */}
      <DailyStreakTracker user={user} onUpdateUser={onUpdateUser} />

      {/* PRO MEMBERSHIP BANNER (5X MULTIPLIER) */}
      {(() => {
        const proFeeINR = loadQRMerchantConfig().premiumFeeINR || 99;
        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-yellow-950/40 border border-amber-500/40 p-5 sm:p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Crown className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-300 uppercase tracking-wide">
                      {user.isPremium ? '👑 VIP PRO MEMBERSHIP ACTIVE' : `⚡ MINDFORGE PRO MEMBERSHIP (₹${proFeeINR} INR)`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold">
                      5X MULTIPLIER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {user.isPremium 
                      ? "Your PRO account is active! You are earning 5X Coins, 5X Diamonds, and 5X XP on all games & events!"
                      : `Get 5X more Coins, Diamonds, and Brain Experience (XP) across all games for just ₹${proFeeINR} INR lifetime access!`}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenPremium}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-xl shadow-amber-500/20 shrink-0 flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>{user.isPremium ? 'PRO Perks (Active)' : `Join PRO ₹${proFeeINR}`}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* AI COACH RECOMMENDATION BANNER */}
      <div className="p-5 rounded-2xl bg-[#080808] border border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center text-[#00F5FF]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Jeevu AI Coach Recommendation
              <span className="text-[9px] font-mono bg-[#00F5FF]/20 text-[#00F5FF] px-2 py-0.5 rounded font-extrabold border border-[#00F5FF]/30">AI INSIGHT</span>
            </h4>
            <p className="text-xs text-[#AAAAAA]">
              "Your Logic score increased by +45pts this week! To keep momentum, try 1 session of Mental Math."
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('coach')}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#0F0D1A] text-purple-300 border border-[#2B1F4D] text-xs font-bold hover:border-purple-400 transition flex items-center gap-1.5"
        >
          <span>Chat with AI Coach</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* COGNITIVE SKILLS METERS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00F5FF]" />
            Cognitive Skill Breakdown
          </h2>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-mono font-semibold text-[#00F5FF] hover:underline flex items-center gap-1"
          >
            <span>Full Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {skillMeters.map((m) => {
            const score = user.ratings[m.key];
            const percent = Math.min(100, Math.max(10, Math.round((score / 2000) * 100)));
            return (
              <div key={m.key} className="bg-[#080808] border border-[#1A1A1A] p-3.5 rounded-2xl space-y-2 hover:border-[#00F5FF]/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs font-mono font-bold text-[#00F5FF]">{score}</span>
                </div>
                <div className="text-xs font-bold text-white">{m.label}</div>
                <div className="w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.5)]" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK PLAY MINI GAMES CAROUSEL / GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Featured Cognitive Exercises
          </h2>
          <button
            onClick={() => onNavigateTab('games')}
            className="text-xs font-mono font-semibold text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All 15 Games</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_GAMES.slice(0, 4).map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameLaunch(game.id)}
              className="bg-[#080808] border border-[#1A1A1A] p-5 rounded-2xl hover:border-[#00F5FF]/40 transition cursor-pointer group hover:shadow-[0_0_20px_rgba(0,245,255,0.08)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#121214] text-[#00F5FF] border border-[#1A1A1A]">
                    {game.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    🏆 {game.highScore}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#00F5FF] transition mb-1">
                  {game.name}
                </h3>

                <p className="text-xs text-[#888888] line-clamp-2 mb-4">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                <span className="text-[10px] font-mono text-[#666666] font-medium">DIFF: {game.difficulty.toUpperCase()}</span>
                <span className="p-2 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF] group-hover:bg-[#00F5FF] group-hover:text-black transition">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY MISSIONS CHECKLIST */}
      <div className="bg-[#080808] border border-[#1A1A1A] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#00F5FF]" />
            <h3 className="text-base font-bold text-white">Daily Cognitive Missions</h3>
          </div>
          <button 
            onClick={() => onNavigateTab('missions')}
            className="text-xs font-mono font-semibold text-[#00F5FF] hover:underline"
          >
            Claim All Rewards
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="p-3.5 rounded-2xl bg-[#0A0A0C] border border-[#1A1A1A] flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{mission.title}</div>
                <div className="text-[10px] font-mono text-[#888888] flex items-center gap-2">
                  <span>Progress: {mission.current}/{mission.target}</span>
                  <span className="text-[#00F5FF] font-bold">+{mission.rewardXP} XP</span>
                </div>
              </div>

              {mission.completed && !mission.claimed ? (
                <button
                  onClick={() => onClaimMission(mission.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#00F5FF] text-black font-extrabold text-xs hover:bg-[#00D6E0] transition shadow-[0_0_10px_rgba(0,245,255,0.3)]"
                >
                  Claim
                </button>
              ) : mission.claimed ? (
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Claimed
                </span>
              ) : (
                <div className="w-16 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00F5FF]"
                    style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
