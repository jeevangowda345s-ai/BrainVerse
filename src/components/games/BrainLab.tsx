import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Bot, Play, RefreshCw, Trophy, CheckCircle2 } from 'lucide-react';
import { audioHaptics } from '../../utils/audioHaptics';

interface BrainLabProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const BrainLab: React.FC<BrainLabProps> = ({ onBack, onFinish }) => {
  const [category, setCategory] = useState<string>('logic');
  const [difficulty, setDifficulty] = useState<string>('Advanced');
  const [loading, setLoading] = useState<boolean>(false);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  const handleGeneratePuzzles = async () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setLoading(true);

    try {
      const res = await fetch('/api/generate-puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, difficulty, count: 4 }),
      });
      const data = await res.json();
      if (data.puzzles && data.puzzles.length > 0) {
        setPuzzles(data.puzzles);
        setCurrentIndex(0);
        setSelectedOpt(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (opt: string) => {
    if (selectedOpt !== null) return;
    const current = puzzles[currentIndex];
    setSelectedOpt(opt);

    if (opt === current.correctAnswer) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setScore(score + 200);
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
    }

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentIndex + 1 < puzzles.length) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-pink-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-pink-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Procedural Lab
          </span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
          Brain Lab Sandbox
        </h2>
        <p className="text-xs text-slate-400">Generate infinite custom AI cognitive puzzles in real time.</p>
      </div>

      {/* Generator Controls */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none"
          >
            <option value="logic">Logic & Reasoning</option>
            <option value="sequence">Sequence Rules</option>
            <option value="math">Mental Arithmetic</option>
            <option value="spatial">Spatial Visuals</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Difficulty Tier</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
          </select>
        </div>

        <button
          onClick={handleGeneratePuzzles}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{loading ? 'Synthesizing...' : 'Generate Puzzles'}</span>
        </button>
      </div>

      {/* Active AI Puzzle Display */}
      {puzzles.length > 0 && puzzles[currentIndex] ? (
        <div className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-purple-500/30">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Puzzle #{currentIndex + 1} of {puzzles.length}</span>
            <span className="text-cyan-400">{puzzles[currentIndex].title}</span>
          </div>

          <div className="text-lg font-bold text-white leading-relaxed">
            {puzzles[currentIndex].question}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {puzzles[currentIndex].options.map((opt: string, idx: number) => {
              let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-pink-400';
              if (selectedOpt === opt) {
                btnStyle = opt === puzzles[currentIndex].correctAnswer
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-rose-500 text-white font-bold border-rose-400';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-medium">
              💡 {puzzles[currentIndex].explanation}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 bg-slate-950 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
          Select parameters above and click "Generate Puzzles" to launch AI Sandbox.
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button onClick={() => onFinish(score, 100, 800)} className="px-5 py-2 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs">
          Save Result
        </button>
      </div>
    </div>
  );
};
