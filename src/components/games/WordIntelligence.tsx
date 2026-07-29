import React, { useState } from 'react';
import { ArrowLeft, Trophy, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { audioHaptics } from '../../utils/audioHaptics';

interface WordIntelligenceProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const WordIntelligence: React.FC<WordIntelligenceProps> = ({ onBack, onFinish }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);

  const wordPuzzles = [
    {
      scrambled: 'N E U R A L',
      correct: 'NEURAL',
      hint: 'Relating to a nerve or the central nervous system.',
      options: ['NEURAL', 'LUNAR', 'RENAL', 'URBAN'],
    },
    {
      scrambled: 'M E M O R Y',
      correct: 'MEMORY',
      hint: 'The faculty by which the mind stores and remembers information.',
      options: ['MEMORY', 'MOMENT', 'MIRROR', 'MYSTERY'],
    },
    {
      scrambled: 'F O C U S',
      correct: 'FOCUS',
      hint: 'The center of interest or activity.',
      options: ['FOCUS', 'FLOCK', 'FORGE', 'FRAME'],
    },
    {
      scrambled: 'L O G I C',
      correct: 'LOGIC',
      hint: 'Reasoning conducted according to strict principles of validity.',
      options: ['LOGIC', 'MAGIC', 'PANIC', 'BASIC'],
    }
  ];

  const current = wordPuzzles[(level - 1) % wordPuzzles.length];

  const handleSelect = (opt: string) => {
    audioHaptics.playClick();
    if (opt === current.correct) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setScore(score + 200);
      setLevel(level + 1);
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-orange-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-orange-400">Word Level {level}</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
          Word Intelligence & Anagrams
        </h2>
        <p className="text-xs text-slate-400">Unscramble the letters and solve the cognitive vocabulary prompt.</p>
      </div>

      <div className="py-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
        <div className="text-2xl font-black tracking-widest text-orange-300">{current.scrambled}</div>
        <p className="text-xs text-slate-400 italic px-4">“{current.hint}”</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className="py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white hover:border-orange-400 transition"
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button onClick={() => onFinish(score, 100, 600)} className="px-5 py-2 rounded-xl bg-orange-500 text-slate-950 font-bold text-xs">
          Save Result
        </button>
      </div>
    </div>
  );
};
