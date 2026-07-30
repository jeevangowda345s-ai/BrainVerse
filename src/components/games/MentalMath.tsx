import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface MentalMathProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const MentalMath: React.FC<MentalMathProps> = ({ onBack, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [score, setScore] = useState<number>(0);
  const [problem, setProblem] = useState<{ eq: string; answer: number; options: number[] } | null>(null);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(true);

  const generateEquation = () => {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0, b = 0, ans = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 80) + 10;
      b = Math.floor(Math.random() * 80) + 10;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 90) + 20;
      b = Math.floor(Math.random() * a) + 5;
      ans = a - b;
    } else if (op === '×') {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      ans = a * b;
    } else {
      b = Math.floor(Math.random() * 10) + 2;
      ans = Math.floor(Math.random() * 12) + 2;
      a = b * ans;
    }

    const options = [ans];
    while (options.length < 4) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 1);
      const wrong = ans + offset;
      if (!options.includes(wrong)) options.push(wrong);
    }
    options.sort(() => Math.random() - 0.5);

    return { eq: `${a} ${op} ${b} = ?`, answer: ans, options };
  };

  useEffect(() => {
    setProblem(generateEquation());
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      audioHaptics.playFanfare();
    }
  }, [timeLeft, gameActive]);

  const handleSelectOption = (opt: number) => {
    if (!gameActive || !problem) return;

    setAnsweredCount(prev => prev + 1);

    if (opt === problem.answer) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setScore(prev => prev + 120);
      setCorrectCount(prev => prev + 1);
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
    }

    setProblem(generateEquation());
  };

  const handleFinish = () => {
    const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 100;
    const avgReact = answeredCount > 0 ? Math.round((45000) / answeredCount) : 600;
    onFinish(score, acc, avgReact);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          Mental Math Speed Sprint
        </h2>
        <p className="text-xs text-slate-400">Solve as many calculations as possible before time runs out.</p>
      </div>

      {gameActive && problem ? (
        <div className="space-y-6">
          <div className="py-8 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-wider">
              {problem.eq}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {problem.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="py-4 rounded-2xl bg-slate-950 border border-slate-800 text-xl font-extrabold text-white hover:border-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-4">
          <h3 className="text-xl font-black text-emerald-400">Time's Up!</h3>
          <p className="text-xs text-slate-300">
            Solved {correctCount} of {answeredCount} problems correctly. Total score: {score} pts.
          </p>
          <button
            onClick={handleFinish}
            className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
          >
            Save Result
          </button>
        </div>
      )}
    </div>
  );
};
