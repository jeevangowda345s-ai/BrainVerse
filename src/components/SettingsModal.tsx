import React from 'react';
import { Settings, X, Volume2, VolumeX, Smartphone, Moon, Sun, Eye, Sparkles, RotateCcw, Palette } from 'lucide-react';
import { ThemeSettings } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { APP_THEMES } from '../utils/theme';

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

  const selectPalette = (paletteKey: ThemeSettings['palette']) => {
    audioHaptics.playClick();
    const config = APP_THEMES[paletteKey];
    setTheme(prev => ({
      ...prev,
      palette: paletteKey,
      mode: config.mode === 'light' ? 'light' : 'midnight'
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Settings & Visual Theme Themes
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">

          {/* Expanded Theme Palette Selection */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">App Color Theme & Palette</div>
                <div className="text-[10px] text-slate-400">Choose from 7 bespoke visual atmospheres</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(Object.keys(APP_THEMES) as Array<ThemeSettings['palette']>).map((paletteKey) => {
                const item = APP_THEMES[paletteKey];
                const isSelected = theme.palette === paletteKey;

                return (
                  <button
                    key={paletteKey}
                    type="button"
                    onClick={() => selectPalette(paletteKey)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-400 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 font-bold uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {item.description}
                      </div>
                    </div>

                    {/* Color Swatch Bullets */}
                    <div className="flex items-center gap-1 shrink-0 p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {item.previewColors.map((col, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/30"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Audio & Haptics Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Synthesizer Audio</div>
                  <div className="text-[10px] text-slate-400">Web Audio API tones</div>
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
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Haptic Pulses</div>
                  <div className="text-[10px] text-slate-400">Vibration feedback</div>
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
          </div>

          {/* Colorblind Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-pink-400" />
              <div>
                <div className="text-xs font-bold text-white">Colorblind High Contrast Mode</div>
                <div className="text-[10px] text-slate-400">Optimized high-contrast matrix color patterns</div>
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
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
