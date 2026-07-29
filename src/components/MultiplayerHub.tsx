import React, { useState } from 'react';
import { Trophy, Users, Swords, Zap, Shield, Play, Bot, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MultiplayerRoom } from '../types';
import { DEFAULT_MULTIPLAYER_ROOMS } from '../utils/storage';
import { audioHaptics } from '../utils/audioHaptics';

interface MultiplayerHubProps {
  user: UserProfile;
}

export const MultiplayerHub: React.FC<MultiplayerHubProps> = ({ user }) => {
  const [activeMatch, setActiveMatch] = useState<MultiplayerRoom | null>(null);
  const [matchState, setMatchState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [userScore, setUserScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  const handleJoinRoom = (room: MultiplayerRoom) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setActiveMatch(room);
    setMatchState('playing');
    setUserScore(0);
    setOpponentScore(0);

    // Simulate match progression
    const interval = setInterval(() => {
      setUserScore(prev => prev + Math.floor(Math.random() * 80) + 20);
      setOpponentScore(prev => prev + Math.floor(Math.random() * 70) + 15);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setMatchState('result');
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 50 });
    }, 6000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Swords className="w-8 h-8 text-purple-400" />
            1v1 Brain Battle & Ranked Arena
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Challenge players globally in real-time speed memory, math duels, and logic races.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Division: {user.rank}</span>
        </div>
      </div>

      {/* Active Battle Arena */}
      {matchState === 'playing' && activeMatch && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-purple-500/50 text-center space-y-6 shadow-2xl animate-pulse">
          <div className="text-xs uppercase font-black text-purple-400 tracking-widest">
            {activeMatch.mode} IN PROGRESS
          </div>

          <div className="grid grid-cols-3 gap-4 items-center max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{userScore} pts</div>
            </div>

            <div className="text-2xl font-black text-purple-400">VS</div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-sm font-bold text-slate-300">{activeMatch.hostName}</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{opponentScore} pts</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">Fastest response time gains streak multiplier bonus!</p>
        </div>
      )}

      {/* Match Result Modal */}
      {matchState === 'result' && activeMatch && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 text-center space-y-4 shadow-2xl">
          <h2 className="text-3xl font-black text-cyan-300">
            {userScore >= opponentScore ? 'VICTORY! 🏆' : 'DEFEAT'}
          </h2>
          <p className="text-xs text-slate-300">
            Final Score: {userScore} pts vs {opponentScore} pts (+150 Rating Points)
          </p>
          <button
            onClick={() => setMatchState('lobby')}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase"
          >
            Return to Arena Lobby
          </button>
        </div>
      )}

      {/* Live Battle Rooms List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Active Live Multiplayer Match Rooms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_MULTIPLAYER_ROOMS.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition"
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-purple-400">{room.mode}</span>
                <span className="text-amber-400">Stake: {room.stakes} Coins</span>
              </div>

              <div>
                <div className="text-base font-bold text-white">{room.gameTitle}</div>
                <div className="text-xs text-slate-400">Host: {room.hostName} ({room.hostRating} Rating)</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500">Players: {room.playersCount}/{room.maxPlayers}</span>
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                >
                  Join Match
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
