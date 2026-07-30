import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Sparkles, X, Award, Flame, Brain, Zap, Target, Gauge, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (achievement) {
      // Ensure feedback only plays ONCE per achievement ID
      if (handledIdRef.current !== achievement.id) {
        handledIdRef.current = achievement.id;
        setVisible(true);

        // Play official audio & haptic celebration ONCE
        audioHaptics.playAchievementUnlock();
        audioHaptics.triggerHaptic('levelUp');

        // Trigger Confetti Burst
        confetti({
          particleCount: 70,
          spread: 90,
          origin: { y: 0.2, x: 0.8 },
          colors: ['#F59E0B', '#10B981', '#06B6D4', '#EC4899', '#8B5CF6'],
        });
      }

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          handledIdRef.current = null;
          onClose();
        }, 300); // allow exit transition
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'brain': return <Brain className="w-7 h-7 text-amber-400" />;
      case 'flame': return <Flame className="w-7 h-7 text-orange-400" />;
      case 'zap': return <Zap className="w-7 h-7 text-yellow-400" />;
      case 'gauge': return <Gauge className="w-7 h-7 text-cyan-400" />;
      case 'target': return <Target className="w-7 h-7 text-emerald-400" />;
      case 'lightbulb': return <Lightbulb className="w-7 h-7 text-purple-400" />;
      case 'award': return <Award className="w-7 h-7 text-pink-400" />;
      default: return <Trophy className="w-7 h-7 text-amber-400" />;
    }
  };

  const getTierBadge = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze':
        return { label: 'BRONZE TIER', color: 'bg-amber-800/40 border-amber-600/50 text-amber-300' };
      case 'silver':
        return { label: 'SILVER TIER', color: 'bg-slate-700/50 border-slate-400/50 text-slate-200' };
      case 'gold':
        return { label: 'GOLD TIER', color: 'bg-amber-500/20 border-amber-400/60 text-amber-300' };
      case 'diamond':
        return { label: 'DIAMOND TIER', color: 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300' };
      case 'master':
        return { label: 'MASTER TIER', color: 'bg-purple-500/20 border-purple-400/60 text-purple-300' };
      default:
        return { label: 'ACHIEVEMENT', color: 'bg-amber-500/20 border-amber-400/60 text-amber-300' };
    }
  };

  const tierInfo = getTierBadge(achievement.tier);

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 transition-all duration-500 ease-out transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
      }`}
    >
      {/* Outer Glow Border Box */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/95 border-2 border-amber-500/80 p-4 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-xl">
        
        {/* Animated Top Shimmer Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 animate-pulse" />

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Animated Achievement Icon Badge */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-50 blur-sm animate-pulse" />
            <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-amber-400/60 flex items-center justify-center shadow-inner">
              {getIcon(achievement.icon)}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-spin" />
                Achievement Unlocked!
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${tierInfo.color}`}>
                {tierInfo.label}
              </span>
            </div>

            <h4 className="text-sm font-black text-white tracking-tight">
              {achievement.title}
            </h4>

            <p className="text-xs text-slate-300 leading-snug">
              {achievement.description}
            </p>

            <div className="pt-1.5 flex items-center gap-2 text-[10px] text-amber-300 font-extrabold">
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30">
                +150 XP
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30">
                +50 Coins
              </span>
            </div>
          </div>
        </div>

        {/* Auto-Dismiss Progress Countdown Bar */}
        <div className="mt-3 w-full h-1 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-[5000ms] ease-linear"
            style={{ width: visible ? '0%' : '100%' }}
          />
        </div>

      </div>
    </div>
  );
};
