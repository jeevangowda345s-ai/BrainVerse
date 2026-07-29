import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Zap, Brain, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface MemoryMatrixProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const MemoryMatrix: React.FC<MemoryMatrixProps> = ({ onBack, onFinish }) => {
  const [level, setLevel] = useState<number>(1);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3
  const [targetCount, setTargetCount] = useState<number>(3);
  const [targets, setTargets] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  // Start new round
  const startRound = (currentLevel: number, currentSize: number, count: number) => {
    const totalCells = currentSize * currentSize;
    const newTargets: number[] = [];
    while (newTargets.length < count) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!newTargets.includes(idx)) newTargets.push(idx);
    }

    setTargets(newTargets);
    setSelected([]);
    setPhase('memorize');

    // Reveal timer
    setTimeout(() => {
      setPhase('recall');
      setStartTime(Date.now());
    }, Math.max(1200, 2500 - currentLevel * 100));
  };

  useEffect(() => {
    startRound(level, gridSize, targetCount);
  }, []);

  const handleTileClick = (idx: number) => {
    if (phase !== 'recall' || selected.includes(idx)) return;

    audioHaptics.playTileFlip(300 + idx * 20);
    audioHaptics.triggerHaptic('tap');

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    // Check if mistake
    if (!targets.includes(idx)) {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
      setPhase('result');
      const timeSpent = Date.now() - startTime;
      setReactionTimes([...reactionTimes, timeSpent]);
      return;
    }

    // Check if round completed successfully
    if (newSelected.length === targets.length) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      
      const timeSpent = Date.now() - startTime;
      const newReactionTimes = [...reactionTimes, timeSpent];
      setReactionTimes(newReactionTimes);

      const points = 100 * level + streak * 25;
      const newScore = score + points;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (level % 3 === 0) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }

      // Progress level
      const nextLevel = level + 1;
      let nextSize = gridSize;
      let nextCount = targetCount + 1;

      if (nextCount > Math.floor((gridSize * gridSize) / 2)) {
        nextSize = Math.min(6, gridSize + 1);
        nextCount = 3 + Math.floor(nextLevel / 2);
      }

      setLevel(nextLevel);
      setGridSize(nextSize);
      setTargetCount(nextCount);

      setTimeout(() => {
        startRound(nextLevel, nextSize, nextCount);
      }, 800);
    }
  };

  const handleGameOver = () => {
    const avgReaction = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 800;
    const accuracy = Math.min(100, Math.round((level / (level + 1)) * 100));
    onFinish(score, accuracy, avgReaction);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 bg-slate-900 border border-cyan-500/30 rounded-3xl text-white shadow-2xl">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-cyan-400">Level {level}</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
          <span className="text-purple-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Streak {streak}
          </span>
        </div>
      </div>

      {/* Game Instruction */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Memory Matrix
        </h2>
        <p className="text-xs text-slate-400">
          {phase === 'memorize' && 'Memorize the glowing cyan tiles!'}
          {phase === 'recall' && 'Tap the tiles you remembered!'}
          {phase === 'result' && 'Round Over!'}
        </p>
      </div>

      {/* Grid Canvas */}
      <div className="flex justify-center my-6">
        <div 
          className="grid gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const isTarget = targets.includes(idx);
            const isSelected = selected.includes(idx);
            
            let tileClass = 'bg-slate-900 border-slate-800 hover:border-slate-700';

            if (phase === 'memorize' && isTarget) {
              tileClass = 'bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-95';
            } else if (phase === 'recall') {
              if (isSelected && isTarget) {
                tileClass = 'bg-emerald-400 border-emerald-300 shadow-lg shadow-emerald-500/50';
              } else if (isSelected && !isTarget) {
                tileClass = 'bg-rose-500 border-rose-400 animate-shake';
              }
            } else if (phase === 'result') {
              if (isTarget) tileClass = 'bg-cyan-500/60 border-cyan-400';
              if (isSelected && !isTarget) tileClass = 'bg-rose-500 border-rose-400';
            }

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={phase !== 'recall'}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border transition-all duration-200 ${tileClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* Result Footer */}
      {phase === 'result' && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
          <h3 className="text-base font-bold text-rose-300">Memory Test Complete</h3>
          <p className="text-xs text-slate-300">Final Level: {level} | Total Score: {score} pts</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setLevel(1);
                setGridSize(3);
                setTargetCount(3);
                setScore(0);
                setStreak(0);
                startRound(1, 3, 3);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Play Again
            </button>
            <button
              onClick={handleGameOver}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Save Result
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
