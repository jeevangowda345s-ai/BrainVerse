import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Bot, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  GitCommit, 
  Code2, 
  Gamepad2, 
  Save, 
  Zap, 
  ShieldCheck, 
  Sliders
} from 'lucide-react';
import { UserProfile } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface AdminPanelProps {
  user: UserProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  // Check if current user is the authorized Master Developer (jeevangowda345s@gmail.com)
  const MASTER_ADMIN_EMAIL = 'jeevangowda345s@gmail.com';
  const isMasterAdmin = 
    (user.email && user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
    user.id === 'user_101' ||
    user.username === 'jeevu_brainmaster';

  // State for version control & game management
  const [appVersion, setAppVersion] = useState<string>('v3.6.0-PRO');
  const [releaseNotes, setReleaseNotes] = useState<string>('Added 2-Player Race Mode with Team Code Sync & Level 1 Reset System.');
  const [versionSaved, setVersionSaved] = useState<boolean>(false);

  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [aiTemp, setAiTemp] = useState<number>(0.7);

  // Mini Games Active Toggles
  const [gameStates, setGameStates] = useState<Record<string, boolean>>({
    memory_matrix: true,
    number_sequence: true,
    mental_math: true,
    maze_escape: true,
    sudoku: true,
    quick_decision: true,
    word_intelligence: true,
    coding_logic: true,
    brain_lab: true,
  });

  const toggleGame = (id: string) => {
    if (!isMasterAdmin) return;
    audioHaptics.playClick();
    setGameStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveVersion = () => {
    if (!isMasterAdmin) return;
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('heavy');
    setVersionSaved(true);
    setTimeout(() => {
      setVersionSaved(false);
    }, 3000);
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim() || !isMasterAdmin) return;
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 2500);
  };

  // If user is NOT the authorized master admin
  if (!isMasterAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-6 max-w-xl mx-auto my-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Access Restricted to Master Developer
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Only <strong className="text-amber-400 font-bold">{MASTER_ADMIN_EMAIL}</strong> has the sole authority to update application versions, modify mini-game parameters, or publish software builds.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
          <div className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Master Developer Identity:
          </div>
          <div className="text-xs font-mono text-cyan-300 font-bold bg-slate-900 p-2 rounded-xl border border-slate-800">
            Jeevan Gowda ({MASTER_ADMIN_EMAIL})
          </div>
          <div className="text-[10px] text-slate-500 italic">
            Current Logged-in Account: {user.email || 'Guest User (' + user.name + ')'}
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          If you believe you should have access, please sign in with your verified developer email.
        </div>
      </div>
    );
  }

  // Master Admin Authority Granted View
  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Authority Granted Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-black text-amber-400">
              BrainVerse Developer Console
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Master Authority Granted to <strong className="text-cyan-300 font-bold">{MASTER_ADMIN_EMAIL}</strong>
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-black uppercase tracking-wider">
          MASTER ADMIN AUTHENTICATED
        </div>
      </div>

      {/* Version Control & Release Publisher Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            App Version & Build Release Management
          </h2>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
            Current Target: {appVersion}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">App Build Version Tag</label>
            <input
              type="text"
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. v3.6.0-PRO"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Version Changelog / Notes</label>
            <input
              type="text"
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Describe build changes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {versionSaved ? (
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Build Version Updated & Applied Successfully!
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">
              Only Jeevan Gowda has authority to push version updates across the network.
            </span>
          )}

          <button
            onClick={handleSaveVersion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase shadow-lg hover:brightness-110 transition"
          >
            <Save className="w-4 h-4" /> Update App Version
          </button>
        </div>
      </div>

      {/* Games Catalog Active Controls */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          Mini-Game Status & Parameter Overrides
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(gameStates).map(([gameId, isActive]) => (
            <div 
              key={gameId}
              onClick={() => toggleGame(gameId)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                isActive 
                  ? 'bg-slate-950 border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="capitalize font-bold text-xs truncate">
                {gameId.replace('_', ' ')}
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {isActive ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status & Global Push Broadcast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Parameters */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Coach Jeevu Model Engine
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Temperature ({aiTemp})</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={aiTemp}
              onChange={(e) => setAiTemp(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Active Model: <span className="text-cyan-300 font-bold">gemini-3.6-flash</span>
          </div>
        </div>

        {/* Global Broadcast */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Global Push Broadcast
          </h3>

          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Type global alert message..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 focus:outline-none"
          />

          {broadcastSent && (
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Global push broadcast sent!
            </div>
          )}

          <button
            onClick={handleBroadcast}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition"
          >
            Send Broadcast Alert
          </button>
        </div>

      </div>

    </div>
  );
};
