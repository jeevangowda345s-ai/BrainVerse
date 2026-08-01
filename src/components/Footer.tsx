import React from 'react';
import { Brain, ShieldCheck, Heart, Sparkles, Coins, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenRedeemCash: () => void;
  onOpenPremium: () => void;
  user: UserProfile;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenRedeemCash,
  onOpenPremium,
  user
}) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#050508]/80 backdrop-blur-md text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand info */}
        <div className="flex flex-col items-center md:items-start space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-base tracking-tight">
              BrainVerse <span className="text-cyan-400 text-xs font-mono">PRO</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Empowering cognitive intelligence through scientifically designed mini-games, AI coaching, and gamified progress rewards.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official NPCI Instant UPI Payment Verified</span>
          </div>
        </div>

        {/* Center: Quick navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
          <button 
            onClick={() => onNavigateTab('dashboard')} 
            className="hover:text-cyan-400 transition"
          >
            Dashboard
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => onNavigateTab('games')} 
            className="hover:text-cyan-400 transition"
          >
            15 Mini-Games
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => onNavigateTab('coach')} 
            className="hover:text-cyan-400 transition"
          >
            AI Coach Jeevu
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => onNavigateTab('analytics')} 
            className="hover:text-cyan-400 transition"
          >
            Analytics
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => onNavigateTab('missions')} 
            className="hover:text-cyan-400 transition"
          >
            Missions & Hub
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={onOpenRedeemCash} 
            className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-extrabold"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redeem Cash</span>
          </button>
        </div>

        {/* Right: Copyright & Creator Credit */}
        <div className="flex flex-col items-center md:items-end space-y-1.5 text-center md:text-right text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <span>Created with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by <strong className="text-cyan-400">Jeevu</strong></span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            © 2026 MindForge BrainVerse. All rights reserved.
          </p>
          <button
            onClick={onOpenPremium}
            className="mt-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{user.isPremium ? 'PRO Account Active (5X)' : 'Upgrade to PRO'}</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
