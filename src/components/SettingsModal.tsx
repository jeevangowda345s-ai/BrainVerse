import React from 'react';
import { Settings, X, Volume2, VolumeX, Smartphone, Moon, Sun, Eye, Sparkles, RotateCcw, Palette, Volume1 } from 'lucide-react';
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
  const currentVolume = theme.soundVolume !== undefined ? theme.soundVolume : 80;

  const toggleSound = () => {
    audioHaptics.playClick();
    const newS = !theme.soundEnabled;
    setTheme(prev => ({ ...prev, soundEnabled: newS }));
    audioHaptics.setPreferences(newS, theme.hapticsEnabled, currentVolume);
  };

  const handleVolumeChange = (newVol: number) => {
    setTheme(prev => ({
      ...prev,
      soundVolume: newVol,
      soundEnabled: newVol > 0
    }));
    audioHaptics.setVolume(newVol);
    audioHaptics.setPreferences(newVol > 0, theme.hapticsEnabled, newVol);
  };

  const toggleHaptics = () => {
    audioHaptics.playClick();
    const newH = !theme.hapticsEnabled;
    setTheme(prev => ({ ...prev, hapticsEnabled: newH }));
    audioHaptics.setPreferences(theme.soundEnabled, newH, currentVolume);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-6 max-h-[90vh] flex flex-col my-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Settings & Visual Themes
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1">

          {/* Manual Volume Control & Sound Effects */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Synthesizer Sound Volume</div>
                  <div className="text-[10px] text-slate-400">Manual volume control (0% to 100%)</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {theme.soundEnabled ? `${currentVolume}%` : 'Muted'}
                </span>
                <button
                  onClick={toggleSound}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    theme.soundEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {theme.soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Range Slider for Manual Volume Adjustment */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1"><VolumeX className="w-3 h-3 text-slate-500" /> 0% (Silent)</span>
                <span className="flex items-center gap-1">50%</span>
                <span className="flex items-center gap-1"><Volume1 className="w-3 h-3 text-cyan-400" /> 100% (Max)</span>
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
            </div>
          </div>

          {/* Theme Palette Selection (Dark Modes vs White/Light Modes) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">App Color Themes & Visual Modes</div>
                <div className="text-[10px] text-slate-400">Choose between White/Light modes and Dark modes</div>
              </div>
            </div>

            {/* White / Light Modes Section */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> White & Light Modes:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['pure_white', 'minimal_light', 'soft_snow'] as Array<ThemeSettings['palette']>).map((paletteKey) => {
                  const item = APP_THEMES[paletteKey];
                  if (!item) return null;
                  const isSelected = theme.palette === paletteKey;

                  return (
                    <button
                      key={paletteKey}
                      type="button"
                      onClick={() => selectPalette(paletteKey)}
                      className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold text-white">{item.name}</span>
                        {isSelected && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-400/30 text-amber-300 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 self-start">
                        {item.previewColors.map((col, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dark Modes Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-400" /> Dark & Cyber Modes:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['midnight', 'cyber', 'emerald_matrix', 'deep_amethyst', 'solarized_ocean', 'sunset_ember'] as Array<ThemeSettings['palette']>).map((paletteKey) => {
                  const item = APP_THEMES[paletteKey];
                  if (!item) return null;
                  const isSelected = theme.palette === paletteKey;

                  return (
                    <button
                      key={paletteKey}
                      type="button"
                      onClick={() => selectPalette(paletteKey)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-400 ring-1 ring-purple-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isSelected && (
                            <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                        {item.previewColors.map((col, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Audio & Haptics Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Haptic Vibration</div>
                  <div className="text-[10px] text-slate-400">Tactile pulse responses</div>
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

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-pink-400" />
                <div>
                  <div className="text-xs font-bold text-white">High Contrast</div>
                  <div className="text-[10px] text-slate-400">Colorblind matrix patterns</div>
                </div>
              </div>
              <button
                onClick={toggleColorBlind}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  theme.colorBlindMode ? 'bg-pink-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {theme.colorBlindMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center shrink-0">
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
