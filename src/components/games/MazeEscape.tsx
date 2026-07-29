import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Compass, Key, Lock, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioHaptics } from '../../utils/audioHaptics';

interface MazeEscapeProps {
  onBack: () => void;
  onFinish: (score: number, accuracy: number, reactionTimeMs: number) => void;
}

export const MazeEscape: React.FC<MazeEscapeProps> = ({ onBack, onFinish }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [fogOfWar, setFogOfWar] = useState<boolean>(true);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Simple 7x7 grid maze layout generator
  const mazeRows = 7;
  const mazeCols = 7;

  // 0 = path, 1 = wall, 2 = key, 3 = locked door, 4 = exit
  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 2, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 3, 1, 1],
    [0, 0, 0, 1, 0, 0, 4],
  ]);

  const handleMove = (dr: number, dc: number) => {
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    if (nr < 0 || nr >= mazeRows || nc < 0 || nc >= mazeCols) return;

    const cell = grid[nr][nc];

    if (cell === 1) {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
      return; // Wall
    }

    if (cell === 3 && !hasKey) {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
      return; // Locked door without key
    }

    // Valid move
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    setMovesCount(movesCount + 1);

    if (cell === 2) {
      setHasKey(true);
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      // clear key from grid
      const newG = grid.map((row, r) => row.map((col, c) => (r === nr && c === nc ? 0 : col)));
      setGrid(newG);
    }

    if (cell === 3 && hasKey) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      // unlock door
      const newG = grid.map((row, r) => row.map((col, c) => (r === nr && c === nc ? 0 : col)));
      setGrid(newG);
    }

    if (cell === 4) {
      // Reached Exit!
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 50, spread: 60 });

      const newScore = score + 300 + level * 50;
      setScore(newScore);

      setTimeout(() => {
        setLevel(level + 1);
        setPlayerPos({ r: 0, c: 0 });
        setHasKey(false);
      }, 1000);
      return;
    }

    setPlayerPos({ r: nr, c: nc });
  };

  const isVisible = (r: number, c: number) => {
    if (!fogOfWar) return true;
    const dist = Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c);
    return dist <= 2;
  };

  const handleFinish = () => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    onFinish(score, 100, Math.round((totalTime * 1000) / Math.max(1, movesCount)));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-900 border border-blue-500/30 rounded-3xl text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-cyan-400">Maze Level {level}</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {score} pts
          </span>
          <button
            onClick={() => setFogOfWar(!fogOfWar)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
          >
            Fog: {fogOfWar ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Procedural Maze Escape
        </h2>
        <p className="text-xs text-slate-400">Collect the key 🔑, unlock the door 🔒, and reach the portal 🌀.</p>
      </div>

      {/* Grid Canvas */}
      <div className="flex justify-center my-4">
        <div className="grid grid-cols-7 gap-1.5 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const visible = isVisible(r, c);
              const isPlayer = playerPos.r === r && playerPos.c === c;

              if (!visible) {
                return (
                  <div key={`${r}-${c}`} className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-900 opacity-20" />
                );
              }

              let bg = 'bg-slate-900 border-slate-800';
              let icon = null;

              if (isPlayer) {
                bg = 'bg-cyan-500 border-cyan-400 shadow-md shadow-cyan-500/50';
                icon = '🧠';
              } else if (cell === 1) {
                bg = 'bg-slate-800 border-slate-700'; // Wall
              } else if (cell === 2) {
                bg = 'bg-amber-500/20 border-amber-500/40 text-amber-400';
                icon = '🔑';
              } else if (cell === 3) {
                bg = 'bg-purple-500/20 border-purple-500/40 text-purple-400';
                icon = '🔒';
              } else if (cell === 4) {
                bg = 'bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse';
                icon = '🌀';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${bg}`}
                >
                  {icon}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* D-Pad Navigation Controls */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => handleMove(-1, 0)}
          className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-sm hover:bg-cyan-500 hover:text-slate-950 transition"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleMove(0, -1)}
            className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-sm hover:bg-cyan-500 hover:text-slate-950 transition"
          >
            ◄
          </button>
          <button
            onClick={() => handleMove(1, 0)}
            className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-sm hover:bg-cyan-500 hover:text-slate-950 transition"
          >
            ▼
          </button>
          <button
            onClick={() => handleMove(0, 1)}
            className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-sm hover:bg-cyan-500 hover:text-slate-950 transition"
          >
            ►
          </button>
        </div>
      </div>

      <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800">
        <span>Has Key: {hasKey ? 'YES 🔑' : 'NO ❌'}</span>
        <button onClick={handleFinish} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
          Save Result
        </button>
      </div>
    </div>
  );
};
