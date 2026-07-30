import React, { useState } from 'react';
import { Flame, Check, Gift, Sparkles, Award, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { getWeekDaysStatus, processDailyStreak } from '../utils/streak';
import { audioHaptics } from '../utils/audioHaptics';

interface DailyStreakTrackerProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const DailyStreakTracker: React.FC<DailyStreakTrackerProps> = ({
  user,
  onUpdateUser,
}) => {
  const [claiming, setClaiming] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = user.lastActiveDate === todayStr;

  const weekStatus = getWeekDaysStatus(user.streak || 0, user.lastActiveDate);

  // Milestones
  const MILESTONES = [
    { target: 3, label: '3-Day Fire', reward: '+100 Coins & +150 XP' },
    { target: 7, label: '7-Day Titan', reward: '+500 Coins & Diamond Badge' },
    { target: 14, label: '14-Day Legend', reward: '+1,000 Coins & Cyber Frame' },
    { target: 30, label: '30-Day Master', reward: '+2,500 Coins & Crown Avatar' },
  ];

  const currentMilestone = MILESTONES.find(m => (user.streak || 0) < m.target) || MILESTONES[MILESTONES.length - 1];
  const milestoneProgress = Math.min(100, Math.round(((user.streak || 0) / currentMilestone.target) * 100));

  const handleClaimCheckIn = () => {
    if (claiming) return;
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setClaiming(true);

    setTimeout(() => {
      const { updatedUser } = processDailyStreak(user);
      onUpdateUser(updatedUser);
      setClaiming(false);

      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#080808] border border-amber-500/30 p-5 sm:p-6 shadow-2xl shadow-amber-500/10">
      
      {/* Background Flame Gradient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-5">
        
        {/* Header: Flame Icon + Streak Count + Active Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {/* Pulsing Flame Circle */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-30 blur-md animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-950/80 via-orange-950/80 to-slate-950 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-xl">
                <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  <span className="text-amber-400">{user.streak || 0}</span> Day Streak
                </h2>
                {isCheckedInToday ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Active Today
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                    ✨ Check-In Ready
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {isCheckedInToday 
                  ? "Your daily brain habit is secured! Keep training daily to level up your streak multiplier."
                  : "Check in today to maintain your daily flame and claim +50 Coins & +100 XP!"}
              </p>
            </div>
          </div>

          {/* Action / Check-In Button */}
          {!isCheckedInToday ? (
            <button
              onClick={handleClaimCheckIn}
              disabled={claiming}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{claiming ? 'Updating Streak...' : 'Claim Daily Check-In (+50 Coins)'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1.5x XP Streak Multiplier Unlocked</span>
            </div>
          )}
        </div>

        {/* 7-Day Weekly Calendar Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Weekly Habit Consistency</span>
            <span className="text-amber-400 font-mono font-bold">Week Progress</span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {weekStatus.map((day, idx) => (
              <div 
                key={idx}
                className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${
                  day.status === 'completed'
                    ? 'bg-gradient-to-b from-amber-950/60 to-slate-950 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : day.status === 'today'
                    ? 'bg-amber-950/20 border-amber-500/80 text-amber-400 ring-2 ring-amber-500/40 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider mb-1">
                  {day.label}
                </span>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center">
                  {day.status === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : day.status === 'today' ? (
                    <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  )}
                </div>

                {day.isToday && (
                  <span className="text-[9px] font-bold text-amber-400 mt-1 uppercase">Today</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Next Milestone: {currentMilestone.label} ({currentMilestone.target} Days)</span>
              </div>
              <div className="text-[11px] text-slate-400">Reward: {currentMilestone.reward}</div>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>{user.streak || 0} / {currentMilestone.target} Days</span>
              <span className="text-amber-400">{milestoneProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
