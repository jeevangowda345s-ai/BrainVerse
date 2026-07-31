export interface RankTier {
  level: number;
  title: string;
  badgeEmoji: string;
  color: string;
  gradient: string;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  { level: 1, title: 'Apprentice Mind', badgeEmoji: '⚡', color: 'text-slate-400', gradient: 'from-slate-400 to-slate-600', description: 'Beginning the cognitive journey.' },
  { level: 2, title: 'Memory Scout', badgeEmoji: '🧠', color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500', description: 'Building neural foundation and recall.' },
  { level: 4, title: 'Synapse Catalyst', badgeEmoji: '✨', color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500', description: 'Rapid pattern matching & reflexes.' },
  { level: 6, title: 'Neural Architect', badgeEmoji: '🔮', color: 'text-indigo-400', gradient: 'from-indigo-400 to-purple-500', description: 'Designing high-dimensional mental models.' },
  { level: 8, title: 'Logic Mastermind', badgeEmoji: '👑', color: 'text-amber-400', gradient: 'from-amber-400 to-yellow-500', description: 'Unbreakable problem solving & precision.' },
  { level: 12, title: 'Quantum Thinker', badgeEmoji: '🌌', color: 'text-rose-400', gradient: 'from-rose-400 to-pink-600', description: 'Multi-threaded mental processing power.' },
  { level: 15, title: 'Grand Brainmaster', badgeEmoji: '🏆', color: 'text-purple-400', gradient: 'from-purple-400 to-fuchsia-600', description: 'Pinnacle of cognitive performance.' },
  { level: 20, title: 'Celestial Overmind', badgeEmoji: '🌠', color: 'text-amber-300', gradient: 'from-amber-300 via-yellow-400 to-orange-500', description: 'Transcendent mental supremacy.' }
];

export function getRankForLevel(level: number): RankTier {
  let matched = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.level) {
      matched = tier;
    }
  }
  return matched;
}
