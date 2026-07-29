import React, { useState } from 'react';
import { Gift, Award, Flame, Sparkles, CheckCircle2, RotateCw, Trophy, Zap, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyMission, Achievement } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface GamificationHubProps {
  user: UserProfile;
  missions: DailyMission[];
  achievements: Achievement[];
  onClaimMission: (id: string) => void;
  onUpdateCoins: (amount: number) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  user,
  missions,
  achievements,
  onClaimMission,
  onUpdateCoins,
}) => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);

  const handleSpinWheel = () => {
    if (spinning) return;
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setSpinning(true);
    setWheelPrize(null);

    const prizes = ['+250 Coins', '+100 XP', 'Mystery Box 🎁', '+50 Diamonds', '+5 Brain Energy'];

    setTimeout(() => {
      const winner = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelPrize(winner);
      setSpinning(false);
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 40 });
      onUpdateCoins(150);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-pink-400" />
            Missions, Battle Pass & Rewards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Claim daily cognitive streak bonuses, spin the lucky wheel & unlock achievement trophies.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{user.coins} MindForge Coins</span>
        </div>
      </div>

      {/* Lucky Wheel & Mystery Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lucky Wheel Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5 text-cyan-400" />
            Daily Lucky Wheel
          </h3>

          <div className="relative w-40 h-40 mx-auto my-4 rounded-full border-4 border-cyan-400/50 bg-slate-950 flex items-center justify-center shadow-2xl">
            <div className={`text-4xl transition-all duration-[2500ms] ${spinning ? 'rotate-[1440deg] scale-110' : ''}`}>
              🎡
            </div>
          </div>

          {wheelPrize && (
            <div className="text-sm font-black text-cyan-300 animate-bounce">
              Won Reward: {wheelPrize}!
            </div>
          )}

          <button
            onClick={handleSpinWheel}
            disabled={spinning}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50"
          >
            {spinning ? 'Spinning Wheel...' : 'Spin Wheel Free'}
          </button>
        </div>

        {/* Battle Pass Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              MindForge Season Battle Pass
            </h3>
            <span className="text-xs font-bold text-purple-300">Tier {user.level}</span>
          </div>

          <p className="text-xs text-slate-400">Unlock custom avatars, neon themes, and AI tutor hours.</p>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '65%' }} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">👑</div>
              <div className="text-[10px] font-bold text-cyan-300 mt-1">Tier 10 Avatar</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">💎</div>
              <div className="text-[10px] font-bold text-pink-300 mt-1">200 Diamonds</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">🤖</div>
              <div className="text-[10px] font-bold text-purple-300 mt-1">AI Coach Pro</div>
            </div>
          </div>
        </div>

      </div>

      {/* Achievement Badges List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Achievement Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                ach.unlocked
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-xs font-bold text-white">{ach.title}</div>
                <div className="text-[10px] text-slate-400">{ach.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
