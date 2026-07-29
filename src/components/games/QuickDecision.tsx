import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, Zap } from 'lucide-react';
import { audioHaptics } from '../../utils/audioHaptics';

interface QuickDecisionProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const QuickDecision: React.FC<QuickDecisionProps> = ({ onBack, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [word, setWord] = useState<string>('RED');
  const [color, setColor] = useState<string>('text-blue-500');
  const [correctMatch, setCorrectMatch] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [corrects, setCorrects] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const colors = [
    { name: 'RED', class: 'text-red-500' },
    { name: 'BLUE', class: 'text-blue-500' },
    { name: 'GREEN', class: 'text-green-500' },
    { name: 'YELLOW', class: 'text-yellow-400' },
    { name: 'PURPLE', class: 'text-purple-500' }
  ];

  const generateTrial = () => {
    const wObj = colors[Math.floor(Math.random() * colors.length)];
    const cObj = colors[Math.floor(Math.random() * colors.length)];
    const match = wObj.name === cObj.name;

    setWord(wObj.name);
    setColor(cObj.class);
    setCorrectMatch(match);
    setStartTime(Date.now());
  };

  useEffect(() => {
    generateTrial();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDecision = (userSaysMatch: boolean) => {
    if (timeLeft <= 0) return;

    const rt = Date.now() - startTime;
    setReactionTimes([...reactionTimes, rt]);
    setCount(prev => prev + 1);

    if (userSaysMatch === correctMatch) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setScore(prev => prev + 100);
      setCorrects(prev => prev + 1);
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
    }

    generateTrial();
  };

  const handleFinish = () => {
    const acc = count > 0 ? Math.round((corrects / count) * 100) : 100;
    const avgRt = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length) : 380;
    onFinish(score, acc, avgRt);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-yellow-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s
          </span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
          Quick Decision (Stroop Effect)
        </h2>
        <p className="text-xs text-slate-400">Does the written word match the text color?</p>
      </div>

      {timeLeft > 0 ? (
        <div className="space-y-6">
          <div className="py-12 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <span className={`text-4xl font-black tracking-widest ${color}`}>
              {word}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDecision(false)}
              className="py-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-lg hover:bg-rose-500 hover:text-white transition"
            >
              NO ❌
            </button>
            <button
              onClick={() => handleDecision(true)}
              className="py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-lg hover:bg-emerald-500 hover:text-slate-950 transition"
            >
              YES ✅
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950 border border-yellow-500/30 text-center space-y-4">
          <h3 className="text-xl font-black text-amber-400">Time Expired!</h3>
          <p className="text-xs text-slate-300">Total Score: {score} pts | Accuracy: {Math.round((corrects / Math.max(1, count)) * 100)}%</p>
          <button onClick={handleFinish} className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase">
            Save Result
          </button>
        </div>
      )}
    </div>
  );
};
