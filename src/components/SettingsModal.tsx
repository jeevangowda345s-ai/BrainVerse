import React from 'react';
import { Settings, X, Volume2, VolumeX, Smartphone, Moon, Sun, Eye, Type, RotateCcw } from 'lucide-react';
import { ThemeSettings } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface SettingsModalProps {
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  setTheme,
  onClose,
  onResetData,
}) => {
  const toggleSound = () => {
    audioHaptics.playClick();
    const newS = !theme.soundEnabled;
    setTheme(prev => ({ ...prev, soundEnabled: newS }));
    audioHaptics.setPreferences(newS, theme.hapticsEnabled);
  };

  const toggleHaptics = () => {
    audioHaptics.playClick();
    const newH = !theme.hapticsEnabled;
    setTheme(prev => ({ ...prev, hapticsEnabled: newH }));
    audioHaptics.setPreferences(theme.soundEnabled, newH);
  };

  const toggleColorBlind = () => {
    audioHaptics.playClick();
    setTheme(prev => ({ ...prev, colorBlindMode: !prev.colorBlindMode }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Settings & Accessibility
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Audio & Haptics */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Synthesizer Sound Effects</div>
                <div className="text-[10px] text-slate-400">Web Audio API tones & fanfares</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                theme.soundEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {theme.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Haptic Vibration Feedback</div>
                <div className="text-[10px] text-slate-400">Tactile pulses for answers & level ups</div>
              </div>
            </div>
            <button
              onClick={toggleHaptics}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                theme.hapticsEnabled ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {theme.hapticsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Colorblind Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-pink-400" />
              <div>
                <div className="text-xs font-bold text-white">Colorblind Friendly Contrast</div>
                <div className="text-[10px] text-slate-400">High-contrast matrix color patterns</div>
              </div>
            </div>
            <button
              onClick={toggleColorBlind}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                theme.colorBlindMode ? 'bg-pink-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {theme.colorBlindMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all MindForge progress data?')) {
                onResetData();
              }
            }}
            className="text-xs text-rose-400 font-bold hover:text-rose-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Local Data
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
