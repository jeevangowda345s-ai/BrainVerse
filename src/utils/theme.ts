import { ThemeSettings } from '../types';

export interface ThemeConfig {
  id: ThemeSettings['palette'];
  name: string;
  description: string;
  mode: 'dark' | 'light';
  badgeColor: string;
  bgClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  primaryTextClass: string;
  secondaryTextClass: string;
  accentTextClass: string;
  accentBgClass: string;
  glowClass: string;
  gradientHeader: string;
  previewColors: string[];
}

export const APP_THEMES: Record<ThemeSettings['palette'], ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Obsidian',
    description: 'Deep space dark with electric cyan highlights',
    mode: 'dark',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bgClass: 'bg-[#05050A] text-slate-100',
    cardBgClass: 'bg-slate-900/90',
    cardBorderClass: 'border-slate-800',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-slate-400',
    accentTextClass: 'text-cyan-400',
    accentBgClass: 'bg-cyan-500',
    glowClass: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]',
    gradientHeader: 'from-cyan-400 to-blue-600',
    previewColors: ['#05050A', '#0F172A', '#38BDF8', '#3B82F6']
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    description: 'Cyberpunk dark canvas with hot pink & neon purple accents',
    mode: 'dark',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    bgClass: 'bg-[#09020F] text-pink-50',
    cardBgClass: 'bg-[#130722]/90',
    cardBorderClass: 'border-pink-500/20',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-pink-300/60',
    accentTextClass: 'text-pink-400',
    accentBgClass: 'bg-pink-500',
    glowClass: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    gradientHeader: 'from-pink-500 via-purple-500 to-indigo-500',
    previewColors: ['#09020F', '#130722', '#EC4899', '#A855F7']
  },
  emerald_matrix: {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    description: 'Terminal hacker dark canvas with glowing green phosphorus',
    mode: 'dark',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgClass: 'bg-[#020D08] text-emerald-50',
    cardBgClass: 'bg-[#061810]/90',
    cardBorderClass: 'border-emerald-500/20',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-emerald-300/60',
    accentTextClass: 'text-emerald-400',
    accentBgClass: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    gradientHeader: 'from-emerald-400 to-teal-600',
    previewColors: ['#020D08', '#061810', '#10B981', '#059669']
  },
  deep_amethyst: {
    id: 'deep_amethyst',
    name: 'Deep Amethyst',
    description: 'Royal violet dark canvas with glowing gold & purple accents',
    mode: 'dark',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bgClass: 'bg-[#0A0514] text-purple-50',
    cardBgClass: 'bg-[#140A26]/90',
    cardBorderClass: 'border-purple-500/20',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-purple-300/60',
    accentTextClass: 'text-purple-400',
    accentBgClass: 'bg-purple-500',
    glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    gradientHeader: 'from-purple-500 via-indigo-500 to-amber-400',
    previewColors: ['#0A0514', '#140A26', '#A855F7', '#F59E0B']
  },
  solarized_ocean: {
    id: 'solarized_ocean',
    name: 'Solarized Ocean',
    description: 'Abyssal ocean dark blue with turquoise highlights',
    mode: 'dark',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    bgClass: 'bg-[#030F1C] text-sky-50',
    cardBgClass: 'bg-[#081B30]/90',
    cardBorderClass: 'border-sky-500/20',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-sky-300/60',
    accentTextClass: 'text-sky-400',
    accentBgClass: 'bg-sky-500',
    glowClass: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]',
    gradientHeader: 'from-sky-400 to-teal-500',
    previewColors: ['#030F1C', '#081B30', '#38BDF8', '#14B8A6']
  },
  minimal_light: {
    id: 'minimal_light',
    name: 'Minimal Light',
    description: 'Crisp high-contrast light canvas with indigo & slate accents',
    mode: 'light',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bgClass: 'bg-[#F8FAFC] text-slate-900',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-200',
    primaryTextClass: 'text-slate-900',
    secondaryTextClass: 'text-slate-500',
    accentTextClass: 'text-indigo-600',
    accentBgClass: 'bg-indigo-600',
    glowClass: 'shadow-[0_4px_20px_rgba(79,70,229,0.12)]',
    gradientHeader: 'from-indigo-600 to-blue-600',
    previewColors: ['#F8FAFC', '#FFFFFF', '#4F46E5', '#2563EB']
  },
  sunset_ember: {
    id: 'sunset_ember',
    name: 'Sunset Ember',
    description: 'Warm volcanic dark canvas with amber, gold & crimson highlights',
    mode: 'dark',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgClass: 'bg-[#0F0705] text-amber-50',
    cardBgClass: 'bg-[#1C0D08]/90',
    cardBorderClass: 'border-amber-500/20',
    primaryTextClass: 'text-white',
    secondaryTextClass: 'text-amber-200/60',
    accentTextClass: 'text-amber-400',
    accentBgClass: 'bg-amber-500',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    gradientHeader: 'from-amber-400 via-orange-500 to-rose-600',
    previewColors: ['#0F0705', '#1C0D08', '#F59E0B', '#E11D48']
  }
};

export function getThemeConfig(palette?: ThemeSettings['palette']): ThemeConfig {
  if (palette && APP_THEMES[palette]) {
    return APP_THEMES[palette];
  }
  return APP_THEMES['midnight'];
}
