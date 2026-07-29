import React, { useState } from 'react';
import { ArrowLeft, Trophy, Code, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface CodingLogicProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const CodingLogic: React.FC<CodingLogicProps> = ({ onBack, onFinish }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [program, setProgram] = useState<string[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [robotPos, setRobotPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [targetPos, setTargetPos] = useState<{ r: number; c: number }>({ r: 2, c: 2 });

  const availableCommands = [
    { id: 'MOVE_FORWARD', label: 'Move Forward ➡️', action: 'move' },
    { id: 'TURN_RIGHT', label: 'Turn Right ⤵️', action: 'turn' },
    { id: 'REPEAT_2X', label: 'Repeat 2x 🔁', action: 'loop' },
  ];

  const handleAddCommand = (cmdId: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    if (program.length < 6) {
      setProgram([...program, cmdId]);
    }
  };

  const handleRunProgram = () => {
    if (program.length === 0) return;
    setRunning(true);
    audioHaptics.playClick();

    let r = 0;
    let c = 0;

    program.forEach((cmd) => {
      if (cmd === 'MOVE_FORWARD') {
        c = Math.min(2, c + 1);
      } else if (cmd === 'REPEAT_2X') {
        r = Math.min(2, r + 2);
      } else if (cmd === 'TURN_RIGHT') {
        r = Math.min(2, r + 1);
      }
    });

    setTimeout(() => {
      setRobotPos({ r, c });
      setRunning(false);

      if (r === targetPos.r && c === targetPos.c) {
        audioHaptics.playFanfare();
        audioHaptics.triggerHaptic('levelUp');
        confetti({ particleCount: 40 });
        setScore(score + 250);
        setTimeout(() => {
          setLevel(level + 1);
          setProgram([]);
          setRobotPos({ r: 0, c: 0 });
        }, 1200);
      } else {
        audioHaptics.playError();
        audioHaptics.triggerHaptic('error');
      }
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-indigo-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-indigo-400">Coding Stage {level}</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Coding Logic & Algorithms
        </h2>
        <p className="text-xs text-slate-400">Assemble instruction nodes to navigate the neural agent 🤖 to destination 🎯.</p>
      </div>

      {/* Grid Arena */}
      <div className="flex justify-center my-4">
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const isRobot = robotPos.r === r && robotPos.c === c;
              const isTarget = targetPos.r === r && targetPos.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl"
                >
                  {isRobot ? '🤖' : isTarget ? '🎯' : ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Program Sequence */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Program Queue ({program.length}/6)</div>
        <div className="flex gap-2 overflow-x-auto py-1 min-h-[44px]">
          {program.length === 0 ? (
            <span className="text-xs text-slate-600 italic">Click commands below to build algorithm...</span>
          ) : (
            program.map((cmd, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold whitespace-nowrap">
                {cmd}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Available Commands */}
      <div className="grid grid-cols-3 gap-2">
        {availableCommands.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => handleAddCommand(cmd.id)}
            className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 hover:border-indigo-400 transition"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setProgram([])}
          className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
        <button
          onClick={handleRunProgram}
          disabled={running}
          className="w-2/3 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-indigo-500 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Execute Algorithm
        </button>
      </div>

      <div className="pt-2 flex justify-end">
        <button onClick={() => onFinish(score, 100, 900)} className="px-5 py-2 rounded-xl bg-indigo-500 text-slate-950 font-bold text-xs">
          Save Result
        </button>
      </div>
    </div>
  );
};
