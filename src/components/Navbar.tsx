import React from 'react';
import { 
  Brain, 
  Flame, 
  Zap, 
  Coins, 
  Trophy, 
  Bot, 
  BarChart3, 
  Gamepad2, 
  Gift, 
  Sparkles, 
  Settings, 
  UserCheck, 
  ShieldAlert,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { UserProfile, ThemeSettings } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  theme,
  setTheme,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'games', label: '15 Mini-Games', icon: Gamepad2 },
    { id: 'coach', label: 'AI Coach Jeevu', icon: Bot, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'multiplayer', label: 'Multiplayer & Ranks', icon: Trophy },
    { id: 'missions', label: 'Missions & Rewards', icon: Gift },
    { id: 'lab', label: 'Brain Lab', icon: Sparkles, badge: 'New' },
  ];

  const handleTabChange = (id: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    setActiveTab(id);
  };

  const toggleMode = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    setTheme(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
  };

  const toggleSound = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    const newSound = !theme.soundEnabled;
    setTheme(prev => ({ ...prev, soundEnabled: newSound }));
    audioHaptics.setPreferences(newSound, theme.hapticsEnabled);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/90 border-b border-[#1A1A1A] text-[#E0E0E0] shadow-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('dashboard')}>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-[#00F5FF]/20 blur-md group-hover:bg-[#00F5FF]/40 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-[#0A0A0B] border border-[#1A1A1A] group-hover:border-[#00F5FF]/50 flex items-center justify-center text-[#00F5FF] shadow-inner transition">
                <Brain className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
                  BrainVerse
                </span>
                <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 font-bold uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#888888] tracking-wider uppercase">
                MindForge by <span className="text-[#00F5FF] font-bold">Jeevu</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#0A0A0C] p-1.5 rounded-2xl border border-[#1A1A1A]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/40 shadow-[0_0_15px_rgba(0,245,255,0.15)] font-bold'
                      : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#121215]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F5FF]' : 'text-[#888888]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Brain Score & Streak */}
            <div className="hidden sm:flex items-center gap-2.5 bg-[#0A0A0C] px-3 py-1.5 rounded-xl border border-[#1A1A1A]">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs" title="Daily Streak">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{user.streak}d</span>
              </div>
              <div className="h-3 w-px bg-[#222222]" />
              <div className="flex items-center gap-1 text-[#00F5FF] font-bold text-xs" title="Brain Score">
                <Brain className="w-4 h-4 text-[#00F5FF]" />
                <span>{user.brainScore}</span>
              </div>
              <div className="h-3 w-px bg-[#222222]" />
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs" title="MindForge Coins">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.coins}</span>
              </div>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-1.5 bg-[#0F0D1A] px-2.5 py-1.5 rounded-xl border border-[#2B1F4D]">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-purple-300">LVL {user.level}</span>
            </div>

            {/* Quick Toggle Controls */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-[#0A0A0C] border border-[#1A1A1A] text-[#888888] hover:text-[#00F5FF] hover:border-[#00F5FF]/30 transition-all"
              title={theme.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {theme.soundEnabled ? <Volume2 className="w-4 h-4 text-[#00F5FF]" /> : <VolumeX className="w-4 h-4 text-[#555555]" />}
            </button>

            <button
              onClick={toggleMode}
              className="p-2 rounded-xl bg-[#0A0A0C] border border-[#1A1A1A] text-[#888888] hover:text-purple-400 hover:border-purple-500/30 transition-all"
              title="Toggle Theme"
            >
              {theme.mode === 'dark' ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-[#0A0A0C] border border-[#1A1A1A] text-[#888888] hover:text-[#FFFFFF] hover:border-[#333333] transition-all"
              title="Settings & Accessibility"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-[#0A0A0C] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
              title="Admin Panel"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* User Avatar */}
            <div 
              onClick={() => handleTabChange('dashboard')}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00F5FF]/20 p-0.5 border border-[#00F5FF]/40 group-hover:border-[#00F5FF] transition shadow-[0_0_10px_rgba(0,245,255,0.2)]">
                <div className="w-full h-full rounded-[10px] bg-[#050505] flex items-center justify-center text-lg font-bold">
                  {user.avatar || '🧠'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Sub-Bar */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1 border-t border-[#1A1A1A] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/40 font-bold'
                    : 'text-[#888888] hover:text-white bg-[#0A0A0C]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F5FF]' : 'text-[#888888]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
