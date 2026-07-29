import React, { useState } from 'react';
import { ShieldAlert, Users, Server, Bot, Bell, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface AdminPanelProps {
  user: UserProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [aiTemp, setAiTemp] = useState<number>(0.7);

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7" />
            BrainVerse Master Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System health monitoring, AI parameters configuration, user roles & global push notifications.
          </p>
        </div>

        <div className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
          ADMIN ACCESS
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Registered Users</div>
          <div className="text-xl font-black text-white">24,580</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active AI Sessions</div>
          <div className="text-xl font-black text-cyan-400">1,420</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Container Latency</div>
          <div className="text-xl font-black text-emerald-400">18ms</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Gemini API Status</div>
          <div className="text-xl font-black text-purple-400">ONLINE (v3.6)</div>
        </div>
      </div>

      {/* AI Model Controls & Global Broadcast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Parameters */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Coach Jeevu Parameters
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
            Current Model Target: <span className="text-cyan-300 font-bold">gemini-3.6-flash</span>
          </div>
        </div>

        {/* Global Broadcast */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Broadcast Push Notification
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
              <CheckCircle2 className="w-4 h-4" /> Notification broadcasted to all active players!
            </div>
          )}

          <button
            onClick={handleBroadcast}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
          >
            Send Broadcast Alert
          </button>
        </div>

      </div>

    </div>
  );
};
