import React, { useState } from 'react';
import { ArrowLeft, Trophy, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface SudokuGameProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({ onBack, onFinish }) => {
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [score, setScore] = useState<number>(0);

  // Initial Sudoku puzzle grid (0 means empty)
  const [grid, setGrid] = useState<number[][]>([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]);

  const initialMask = [
    [true, true, false, false, true, false, false, false, false],
    [true, false, false, true, true, true, false, false, false],
    [false, true, true, false, false, false, false, true, false],
    [true, false, false, false, true, false, false, false, true],
    [true, false, false, true, false, true, false, false, true],
    [true, false, false, false, true, false, false, false, true],
    [false, true, false, false, false, false, true, true, false],
    [false, false, false, true, true, true, false, false, true],
    [false, false, false, false, true, false, false, true, true],
  ];

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialMask[r][c]) return; // Fixed initial cell

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');

    const newG = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setGrid(newG);
    setScore(score + 15);
  };

  const handleAIHint = () => {
    audioHaptics.playCorrect();
    audioHaptics.triggerHaptic('success');
    if (!selectedCell) {
      setSelectedCell([0, 2]);
      return;
    }
    const [r, c] = selectedCell;
    if (!initialMask[r][c]) {
      // Provide AI suggestion (e.g. 4 for 0,2)
      const newG = grid.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? 4 : val))
      );
      setGrid(newG);
      setScore(score + 50);
    }
  };

  const handleFinish = () => {
    onFinish(score + 500, 95, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-amber-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-amber-400">Sudoku Master ({difficulty})</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
          <button
            onClick={handleAIHint}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Hint
          </button>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Sudoku Logic Matrix
        </h2>
        <p className="text-xs text-slate-400">Fill the 9x9 grid so every row, column, and 3x3 box contains numbers 1-9.</p>
      </div>

      {/* Sudoku Grid */}
      <div className="flex justify-center my-4">
        <div className="grid grid-cols-9 gap-1 p-2 bg-slate-950 rounded-2xl border-2 border-slate-800">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isFixed = initialMask[r][c];
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;

              let cellStyle = 'bg-slate-900 text-slate-200';
              if (isFixed) cellStyle = 'bg-slate-800 text-cyan-300 font-extrabold';
              if (isSelected) cellStyle = 'bg-amber-500/30 border border-amber-400 text-white font-black';

              const is3x3Border = (r % 3 === 2 ? 'border-b-2 border-b-slate-700 ' : '') +
                                  (c % 3 === 2 ? 'border-r-2 border-r-slate-700 ' : '');

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => {
                    audioHaptics.playClick();
                    setSelectedCell([r, c]);
                  }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${cellStyle} ${is3x3Border}`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Numpad Selector */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-black text-sm hover:bg-cyan-500 hover:text-slate-950 transition"
          >
            {num}
          </button>
        ))}
      </div>

      <div className="pt-2 flex justify-between items-center text-xs">
        <button
          onClick={() => {
            audioHaptics.playClick();
            setGrid(grid.map((row, r) => row.map((val, c) => (initialMask[r][c] ? val : 0))));
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Board
        </button>

        <button onClick={handleFinish} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
          Submit Sudoku
        </button>
      </div>
    </div>
  );
};
