import React, { useState } from 'react';
import { Gift, Award, Flame, Sparkles, CheckCircle2, RotateCw, Trophy, Zap, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyMission, Achievement } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

export interface WheelReward {
  label: string;
  coins: number;
  brainScore: number;
  diamonds: number;
  xp?: number;
  icon: string;
}

const WHEEL_PRIZES: WheelReward[] = [
  { label: '+250 Coins', coins: 250, brainScore: 0, diamonds: 0, icon: '🪙' },
  { label: '+150 Brain Score', coins: 0, brainScore: 150, diamonds: 0, icon: '🧠' },
  { label: '+50 Diamonds', coins: 0, brainScore: 0, diamonds: 50, icon: '💎' },
  { label: '+500 Coins', coins: 500, brainScore: 0, diamonds: 0, icon: '💰' },
  { label: '+200 Brain Score', coins: 0, brainScore: 200, diamonds: 0, icon: '⚡' },
  { label: '+100 Diamonds', coins: 0, brainScore: 0, diamonds: 100, icon: '✨' },
  { label: 'Jackpot 🎉 (+500 Coins, +200 Brain, +75 Diamonds)', coins: 500, brainScore: 200, diamonds: 75, icon: '👑' }
];

interface GamificationHubProps {
  user: UserProfile;
  missions: DailyMission[];
  achievements: Achievement[];
  onClaimMission: (id: string) => void;
  onUpdateCoins: (amount: number) => void;
  onClaimWheelReward?: (rewards: { coins?: number; brainScore?: number; diamonds?: number; xp?: number; spinDate?: string }) => void;
  onTestTriggerToast?: (achievement: Achievement) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  user,
  missions,
  achievements,
  onClaimMission,
  onUpdateCoins,
  onClaimWheelReward,
  onTestTriggerToast,
}) => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelPrize, setWheelPrize] = useState<WheelReward | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasFreeSpinToday = user.lastWheelSpinDate !== todayStr;
  const EXTRA_SPIN_COST = 1000;

  const handleSpinWheel = () => {
    if (spinning) return;

    if (!hasFreeSpinToday) {
      if ((user.coins || 0) < EXTRA_SPIN_COST) {
        audioHaptics.triggerHaptic('error');
        alert(`You need at least 1,000 coins for an extra spin today! You currently have ${user.coins || 0} coins.`);
        return;
      }
    }

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setSpinning(true);
    setWheelPrize(null);

    setTimeout(() => {
      const winner = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
      setWheelPrize(winner);
      setSpinning(false);
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 50, spread: 80 });

      // Deduct 1000 coins if extra spin, or 0 if free spin
      const spinCost = hasFreeSpinToday ? 0 : EXTRA_SPIN_COST;
      const netCoins = winner.coins - spinCost;

      if (onClaimWheelReward) {
        onClaimWheelReward({
          coins: netCoins,
          brainScore: winner.brainScore,
          diamonds: winner.diamonds,
          xp: winner.xp || 0,
          spinDate: todayStr,
        });
      } else if (netCoins !== 0) {
        onUpdateCoins(netCoins);
      }
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

        <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold">
          <span className="text-cyan-400 flex items-center gap-1">
            🧠 {user.brainScore} pts
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> {user.coins}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-pink-400 flex items-center gap-1">
            💎 {user.diamonds || 0}
          </span>
        </div>
      </div>

      {/* Lucky Wheel & Mystery Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lucky Wheel Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <RotateCw className="w-5 h-5 text-cyan-400" />
              Daily Lucky Wheel
            </h3>

            {hasFreeSpinToday ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold">
                ✨ 1 FREE SPIN TODAY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold">
                🪙 Extra Spin: 1,000 Coins
              </span>
            )}
          </div>

          <div className="relative w-44 h-44 mx-auto my-3 rounded-full border-4 border-cyan-400/50 bg-slate-950 flex items-center justify-center shadow-2xl overflow-hidden">
            <div className={`text-5xl transition-all duration-[2500ms] ${spinning ? 'rotate-[1440deg] scale-125' : ''}`}>
              {wheelPrize ? wheelPrize.icon : '🎡'}
            </div>
          </div>

          {wheelPrize && (
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-300 animate-bounce space-y-1">
              <div>Won: {wheelPrize.label}!</div>
              <div className="text-[11px] text-cyan-200/80 font-mono">
                {wheelPrize.coins !== 0 && `${wheelPrize.coins > 0 ? '+' : ''}${wheelPrize.coins} Coins `}
                {wheelPrize.brainScore > 0 && `+${wheelPrize.brainScore} Brain Score `}
                {wheelPrize.diamonds > 0 && `+${wheelPrize.diamonds} Diamonds`}
              </div>
            </div>
          )}

          <button
            onClick={handleSpinWheel}
            disabled={spinning || (!hasFreeSpinToday && (user.coins || 0) < EXTRA_SPIN_COST)}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition disabled:opacity-50 ${
              hasFreeSpinToday
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 hover:opacity-95 shadow-lg shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20'
            }`}
          >
            {spinning
              ? 'Spinning Wheel...'
              : hasFreeSpinToday
              ? '✨ Spin Wheel (Free Today) ✨'
              : (user.coins || 0) >= EXTRA_SPIN_COST
              ? 'Spin Extra for 🪙 1,000 Coins'
              : 'Need 🪙 1,000 Coins to Spin'}
          </button>

          {!hasFreeSpinToday && (
            <p className="text-[10px] text-slate-400 font-medium">
              Free spin claimed today! Additional spins deduct 🪙 1,000 coins.
            </p>
          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievement Badges
            </h3>
            <p className="text-xs text-slate-400">
              Complete game milestones & training challenges to unlock badges, XP, and coins.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-extrabold self-start sm:self-auto">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <button
                key={ach.id}
                onClick={() => {
                  if (onTestTriggerToast) {
                    onTestTriggerToast(ach);
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                  ach.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-2xl p-2 rounded-xl flex-shrink-0 ${
                    ach.unlocked ? 'bg-amber-500/20 border border-amber-400/40' : 'bg-slate-900 border border-slate-800'
                  }`}>
                    {ach.unlocked ? '🏆' : '🔒'}
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        {ach.title}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        ach.unlocked
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {ach.tier}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {ach.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{ach.unlocked ? 'UNLOCKED' : `${ach.progress} / ${ach.maxProgress}`}</span>
                        <span className="text-amber-400 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            ach.unlocked ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-700'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[9px] font-mono text-slate-500 text-right opacity-0 group-hover:opacity-100 transition">
                  Click to preview notification 🔔
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
