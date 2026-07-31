import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Coins, 
  Zap, 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Star,
  Gem,
  Gift
} from 'lucide-react';
import { UserProfile } from '../types';
import { getRankForLevel } from '../utils/ranks';
import { audioHaptics } from '../utils/audioHaptics';

interface LevelUpModalProps {
  isOpen: boolean;
  oldLevel: number;
  newLevel: number;
  user: UserProfile;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  oldLevel,
  newLevel,
  user,
  onClose,
}) => {
  const newRank = getRankForLevel(newLevel);
  const oldRank = getRankForLevel(oldLevel);
  const rankChanged = newRank.title !== oldRank.title;

  // Reward calculations
  const bonusCoins = newLevel * 100;
  const bonusDiamonds = 15;

  useEffect(() => {
    if (isOpen) {
      // Play celebratory sound & haptics
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');

      // Double confetti burst
      const end = Date.now() + 1500;
      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#38bdf8', '#a855f7', '#fbbf24', '#f43f5e']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#38bdf8', '#a855f7', '#fbbf24', '#f43f5e']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      
      {/* Full-screen backdrop blur with dramatic dark atmosphere */}
      <div 
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl transition-opacity"
        onClick={handleClaim}
      />

      {/* Rotating Background Rays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-30">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main Level Up Card Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-center space-y-6 z-10 my-auto transform transition-all duration-300 scale-100">
        
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-black uppercase tracking-widest shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>LEVEL UP ACHIEVED!</span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>

        {/* Level Progression Crest */}
        <div className="relative py-2 flex items-center justify-center gap-4">
          
          {/* Old Level Crest */}
          <div className="opacity-60 scale-90 transition-transform">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PREVIOUS</div>
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-400 font-mono font-black">
              <span className="text-2xl">{oldLevel}</span>
              <span className="text-[9px] text-slate-500">LVL</span>
            </div>
          </div>

          {/* Animated Glow Arrow */}
          <div className="flex items-center text-amber-400 animate-bounce px-1">
            <ArrowRight className="w-8 h-8" />
          </div>

          {/* New Level Crest */}
          <div className="relative group">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">NEW LEVEL</div>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 p-[2px] shadow-2xl shadow-amber-500/40">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-mono font-black relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />
                <span className="text-4xl drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">{newLevel}</span>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-extrabold uppercase">LEVEL</span>
              </div>
            </div>
          </div>

        </div>

        {/* New Rank Announcement */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>COGNITIVE RANK PROMOTION</span>
          </div>
          <div className={`text-2xl font-black bg-gradient-to-r ${newRank.gradient} bg-clip-text text-transparent`}>
            {newRank.badgeEmoji} {newRank.title}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            "{newRank.description}"
          </p>
        </div>

        {/* Rewards Earned Grid */}
        <div className="space-y-2 text-left">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-cyan-400" />
            <span>LEVEL UP REWARDS EARNED</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            
            {/* Bonus Coins */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-xs font-mono font-black text-amber-400">+{bonusCoins}</div>
              <div className="text-[10px] text-slate-400 font-bold">Brain Coins</div>
            </div>

            {/* Bonus Diamonds */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Gem className="w-4 h-4" />
              </div>
              <div className="text-xs font-mono font-black text-cyan-400">+{bonusDiamonds}</div>
              <div className="text-[10px] text-slate-400 font-bold">Diamonds</div>
            </div>

            {/* Full Energy Refill */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-mono font-black text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-400 font-bold">Energy Refill</div>
            </div>

          </div>
        </div>

        {/* Claim Rewards Button */}
        <button
          onClick={handleClaim}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 group"
        >
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>CLAIM REWARDS & CONTINUE</span>
          <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>

    </div>
  );
};
