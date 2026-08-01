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
  Palette,
  Volume2,
  VolumeX,
  User,
  UserPlus,
  LogOut,
  IndianRupee,
  Crown
} from 'lucide-react';
import { UserProfile, ThemeSettings } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig } from '../utils/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenRedeemCash: () => void;
  onOpenPremium: () => void;
  onOpenAvatarModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  theme,
  setTheme,
  onOpenSettings,
  onOpenAdmin,
  onOpenAuth,
  onSignOut,
  onOpenRedeemCash,
  onOpenPremium,
  onOpenAvatarModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'games', label: '15 Mini-Games', icon: Gamepad2 },
    { id: 'coach', label: 'AI Coach Jeevu', icon: Bot, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'multiplayer', label: 'Multiplayer & Ranks', icon: Trophy },
    { id: 'missions', label: 'Missions & Rewards', icon: Gift },
    { id: 'lab', label: 'Brain Lab', icon: Sparkles, badge: 'New' },
    { id: 'redeem', label: 'Redeem Cash ₹', icon: IndianRupee, badge: 'PhonePe' },
  ];

  const handleTabChange = (id: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    if (id === 'redeem') {
      onOpenRedeemCash();
    } else {
      setActiveTab(id);
    }
  };

  const [showVolumePopover, setShowVolumePopover] = React.useState<boolean>(false);

  const themeCycle: Array<ThemeSettings['palette']> = [
    'midnight',
    'cyber',
    'emerald_matrix',
    'deep_amethyst',
    'solarized_ocean',
    'sunset_ember',
    'pure_white',
    'minimal_light',
    'soft_snow',
  ];

  const currentVolume = theme.soundVolume !== undefined ? theme.soundVolume : 80;

  const toggleThemeMode = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    setTheme(prev => {
      const isCurrentlyLight = prev.palette === 'pure_white' || prev.palette === 'minimal_light' || prev.palette === 'soft_snow' || prev.mode === 'light';
      if (isCurrentlyLight) {
        return {
          ...prev,
          mode: 'midnight',
          palette: 'midnight',
        };
      } else {
        return {
          ...prev,
          mode: 'light',
          palette: 'pure_white',
        };
      }
    });
  };

  const toggleThemePalette = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    setTheme(prev => {
      const currentIdx = themeCycle.indexOf(prev.palette || 'midnight');
      const nextIdx = (currentIdx + 1) % themeCycle.length;
      const nextPalette = themeCycle[nextIdx];
      const isLight = nextPalette === 'pure_white' || nextPalette === 'minimal_light' || nextPalette === 'soft_snow';
      return {
        ...prev,
        mode: isLight ? 'light' : 'midnight',
        palette: nextPalette,
      };
    });
  };

  const toggleSound = () => {
    const newSound = !theme.soundEnabled;
    setTheme(prev => ({ ...prev, soundEnabled: newSound }));
    audioHaptics.setPreferences(newSound, theme.hapticsEnabled, currentVolume);
    if (newSound) {
      audioHaptics.playClick();
    }
  };

  const handleVolumeChange = (volPercent: number) => {
    setTheme(prev => ({
      ...prev,
      soundVolume: volPercent,
      soundEnabled: volPercent > 0
    }));
    audioHaptics.setVolume(volPercent);
    audioHaptics.setPreferences(volPercent > 0, theme.hapticsEnabled, volPercent);
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
              <button 
                onClick={onOpenRedeemCash} 
                className="flex items-center gap-1 text-emerald-400 font-bold text-xs hover:text-emerald-300 transition" 
                title="Click to Redeem Coins for Real Cash (₹)"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{user.coins.toLocaleString()}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ml-0.5 font-bold">₹</span>
              </button>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-1.5 bg-[#0F0D1A] px-2.5 py-1.5 rounded-xl border border-[#2B1F4D]">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-purple-300">LVL {user.level}</span>
            </div>

            {/* Quick Access Manual Sound Control & Volume Slider */}
            <div className="relative">
              <button
                onClick={() => setShowVolumePopover(!showVolumePopover)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                  theme.soundEnabled
                    ? 'bg-[#00F5FF]/10 border-[#00F5FF]/40 text-[#00F5FF] hover:bg-[#00F5FF]/20 shadow-[0_0_10px_rgba(0,245,255,0.15)]'
                    : 'bg-[#0A0A0C] border-[#1A1A1A] text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
                title="Click to adjust manual volume percentage"
                aria-label="Adjust Volume"
              >
                {theme.soundEnabled && currentVolume > 0 ? (
                  <>
                    <Volume2 className="w-4 h-4 text-[#00F5FF]" />
                    <span className="hidden sm:inline font-mono">{currentVolume}%</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline text-slate-500">Muted</span>
                  </>
                )}
              </button>

              {/* Volume Slider Dropdown Popover */}
              {showVolumePopover && (
                <div className="absolute right-0 mt-2 w-56 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 space-y-2 animate-fade-in text-white">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> Manual Volume
                    </span>
                    <span className="font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded text-[10px]">
                      {theme.soundEnabled ? `${currentVolume}%` : 'Muted'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={theme.soundEnabled ? currentVolume : 0}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                  />

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <button
                      onClick={toggleSound}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      {theme.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
                    </button>
                    <button
                      onClick={() => setShowVolumePopover(false)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sun/Moon White Mode vs Dark Mode Switch Button */}
            <button
              onClick={toggleThemeMode}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                theme.palette === 'pure_white' || theme.palette === 'minimal_light' || theme.palette === 'soft_snow' || theme.mode === 'light'
                  ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20'
              }`}
              title="Quick Toggle: White Mode vs Dark Mode"
            >
              {theme.palette === 'pure_white' || theme.palette === 'minimal_light' || theme.palette === 'soft_snow' || theme.mode === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-amber-300">White</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden lg:inline text-indigo-300">Dark</span>
                </>
              )}
            </button>

            {/* Theme Palette Cycling Button */}
            <button
              onClick={toggleThemePalette}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#0A0A0C] border border-[#1A1A1A] text-xs font-bold hover:border-cyan-500/40 transition-all"
              title="Click to cycle through all 9 color palettes"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span className="hidden xl:inline capitalize text-slate-300">
                {theme.palette ? theme.palette.replace('_', ' ') : 'Midnight'}
              </span>
            </button>

            {/* PRO Membership Button */}
            {(() => {
              const proFeeINR = loadQRMerchantConfig().premiumFeeINR || 99;
              return (
                <button
                  onClick={onOpenPremium}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                    user.isPremium
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                  }`}
                  title={`MindForge PRO Membership - 5X Coins, Diamonds & XP (₹${proFeeINR} INR)`}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">
                    {user.isPremium ? 'PRO (5X Active)' : `Join PRO ₹${proFeeINR}`}
                  </span>
                  <span className="sm:hidden text-[10px]">
                    {user.isPremium ? '5X' : 'PRO'}
                  </span>
                </button>
              );
            })()}

            {/* Master Dev Authority / Admin Panel Button - RESTRICTED STRICTLY TO jeevangowda345s@gmail.com */}
            {user.email && user.email.toLowerCase() === 'jeevangowda345s@gmail.com' && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold"
                title="Developer Authority & Version Console"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline">Dev Console</span>
              </button>
            )}

            {/* Auth / Register Account Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F5FF]/20 to-purple-600/20 border border-[#00F5FF]/40 text-[#00F5FF] hover:border-[#00F5FF] hover:bg-[#00F5FF]/30 transition text-xs font-bold shadow-[0_0_12px_rgba(0,245,255,0.15)]"
              title={user.email ? `Logged in as ${user.email}` : 'Account Details'}
            >
              {user.email ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0A0A0C] border border-[#1A1A1A] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition text-xs font-bold"
              title="Sign Out / Change Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

            {/* User Avatar */}
            <div 
              onClick={() => {
                audioHaptics.playClick();
                if (onOpenAvatarModal) {
                  onOpenAvatarModal();
                } else {
                  handleTabChange('dashboard');
                }
              }}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
              title="Click to change or capture profile avatar photo"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00F5FF]/20 p-0.5 border border-[#00F5FF]/40 group-hover:border-[#00F5FF] transition shadow-[0_0_10px_rgba(0,245,255,0.2)] overflow-hidden">
                <div className="w-full h-full rounded-[10px] bg-[#050505] flex items-center justify-center text-lg font-bold overflow-hidden">
                  {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.includes('/')) ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-[8px]" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerText = '🧠';
                        }
                      }}
                    />
                  ) : (
                    user.avatar || '🧠'
                  )}
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
