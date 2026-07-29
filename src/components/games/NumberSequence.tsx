import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Zap, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface NumberSequenceProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

interface SequencePuzzle {
  sequence: (number | string)[];
  options: number[];
  correctAnswer: number;
  explanation: string;
}

export const NumberSequence: React.FC<NumberSequenceProps> = ({ onBack, onFinish }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [puzzle, setPuzzle] = useState<SequencePuzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const generatePuzzle = (lvl: number): SequencePuzzle => {
    const type = lvl % 4;
    let seq: (number | string)[] = [];
    let correct = 0;
    let exp = '';

    if (type === 0) {
      // Arithmetic progression
      const start = Math.floor(Math.random() * 20) + 1;
      const step = Math.floor(Math.random() * 8) + 2;
      correct = start + 4 * step;
      seq = [start, start + step, start + 2 * step, start + 3 * step, '?'];
      exp = `Add ${step} each step.`;
    } else if (type === 1) {
      // Geometric / Doubling
      const start = Math.floor(Math.random() * 5) + 2;
      const mult = 2;
      correct = start * Math.pow(mult, 4);
      seq = [start, start * 2, start * 4, start * 8, '?'];
      exp = `Multiply by 2 each step.`;
    } else if (type === 2) {
      // Fibonacci style
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = a + b;
      const d = b + c;
      correct = c + d;
      seq = [a, b, c, d, '?'];
      exp = `Sum of previous two numbers.`;
    } else {
      // Squares
      const offset = Math.floor(Math.random() * 5) + 1;
      correct = Math.pow(5 + offset, 2);
      seq = [
        Math.pow(1 + offset, 2),
        Math.pow(2 + offset, 2),
        Math.pow(3 + offset, 2),
        Math.pow(4 + offset, 2),
        '?'
      ];
      exp = `Sequential squares (${1 + offset}², ${2 + offset}², ...).`;
    }

    // Generate options
    const options = [correct];
    while (options.length < 4) {
      const wrong = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
      if (wrong > 0 && !options.includes(wrong)) options.push(wrong);
    }
    options.sort(() => Math.random() - 0.5);

    return { sequence: seq, options, correctAnswer: correct, explanation: exp };
  };

  useEffect(() => {
    setPuzzle(generatePuzzle(level));
    setStartTime(Date.now());
  }, [level]);

  const handleSelectOption = (opt: number) => {
    if (selectedOption !== null || !puzzle) return;

    const timeSpent = Date.now() - startTime;
    setReactionTimes([...reactionTimes, timeSpent]);
    setSelectedOption(opt);
    setTotalAttempts(totalAttempts + 1);

    if (opt === puzzle.correctAnswer) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setIsCorrect(true);
      setScore(score + 150 + level * 20);
      setCorrectCount(correctCount + 1);

      if (level % 5 === 0) {
        confetti({ particleCount: 35, spread: 50 });
      }

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setLevel(level + 1);
      }, 1200);
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
      setIsCorrect(false);
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setLevel(level + 1);
      }, 1500);
    }
  };

  const handleFinishGame = () => {
    const acc = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
    const avgReact = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length) : 700;
    onFinish(score, acc, avgReact);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-purple-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-purple-400">Puzzle #{level}</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Number Sequence Logic
        </h2>
        <p className="text-xs text-slate-400">Identify the pattern rule and select the missing number.</p>
      </div>

      {puzzle && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3 p-6 bg-slate-950 rounded-2xl border border-slate-800">
            {puzzle.sequence.map((num, idx) => (
              <div
                key={idx}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center font-black text-lg ${
                  num === '?'
                    ? 'bg-purple-500/20 border-2 border-dashed border-purple-400 text-purple-300 animate-pulse'
                    : 'bg-slate-900 border border-slate-700 text-slate-100'
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {puzzle.options.map((opt, idx) => {
              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-purple-500';
              if (selectedOption === opt) {
                btnStyle = isCorrect
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-rose-500 text-white border-rose-400 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedOption !== null}
                  className={`py-4 rounded-2xl border text-base font-extrabold transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              isCorrect ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{isCorrect ? 'Correct logic!' : `Incorrect! ${puzzle.explanation}`}</span>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleFinishGame}
          className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
        >
          Finish & Save Score
        </button>
      </div>
    </div>
  );
};
