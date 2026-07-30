import React, { useState, useEffect } from 'react';
import { Trophy, Users, Swords, Zap, Shield, Play, Bot, CheckCircle2, RefreshCw, Plus, Sparkles, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MultiplayerRoom } from '../types';
import { 
  subscribeToLeaderboard, 
  subscribeToMultiplayerRooms, 
  createRealtimeRoom, 
  joinRealtimeRoom, 
  updateMultiplayerScore,
  addCoinsInFirestore,
  RealtimeRoomData 
} from '../services/firebaseService';
import { DEFAULT_MULTIPLAYER_ROOMS } from '../utils/storage';
import { audioHaptics } from '../utils/audioHaptics';

interface MultiplayerHubProps {
  user: UserProfile;
}

export const MultiplayerHub: React.FC<MultiplayerHubProps> = ({ user }) => {
  const [matchState, setMatchState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [activeRoom, setActiveRoom] = useState<RealtimeRoomData | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  // Real-time Firestore State
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [firestoreRooms, setFirestoreRooms] = useState<RealtimeRoomData[]>([]);
  const [creating, setCreating] = useState(false);

  // Subscribe to Leaderboard & Rooms real-time
  useEffect(() => {
    const unsubLeaderboard = subscribeToLeaderboard((players) => {
      if (players && players.length > 0) {
        setLeaderboard(players);
      }
    });

    const unsubRooms = subscribeToMultiplayerRooms((rooms) => {
      setFirestoreRooms(rooms);
    });

    return () => {
      unsubLeaderboard();
      unsubRooms();
    };
  }, []);

  const handleCreateRoom = async () => {
    audioHaptics.playClick();
    setCreating(true);
    try {
      const roomId = await createRealtimeRoom(user, 'Speed Memory Duel', 50);
      audioHaptics.playCorrect();
    } catch (err) {
      console.error('Error creating room:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (room: RealtimeRoomData) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setActiveRoom(room);
    setMatchState('playing');
    setUserScore(0);
    setOpponentScore(0);

    if (room.id) {
      await joinRealtimeRoom(room.id, user);
    }

    // Match execution loop
    const interval = setInterval(() => {
      const myInc = Math.floor(Math.random() * 80) + 20;
      const opInc = Math.floor(Math.random() * 70) + 15;
      
      setUserScore(prev => {
        const next = prev + myInc;
        if (room.id) updateMultiplayerScore(room.id, room.hostId === user.id, next);
        return next;
      });

      setOpponentScore(prev => prev + opInc);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setMatchState('result');
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 60 });
      // Award coins for battle victory
      addCoinsInFirestore(user.id, 100);
    }, 6000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Swords className="w-8 h-8 text-purple-400" />
            1v1 Live Real-Time Arena & Global Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Challenge active players in real-time Firestore duels. Scores and ranks sync live.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Division: {user.rank}</span>
        </div>
      </div>

      {/* Active Battle Arena */}
      {matchState === 'playing' && activeRoom && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-purple-500/50 text-center space-y-6 shadow-2xl animate-pulse">
          <div className="text-xs uppercase font-black text-purple-400 tracking-widest">
            REAL-TIME BATTLE IN PROGRESS
          </div>

          <div className="grid grid-cols-3 gap-4 items-center max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{userScore} pts</div>
            </div>

            <div className="text-2xl font-black text-purple-400">VS</div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-sm font-bold text-slate-300">{activeRoom.hostName || 'Opponent'}</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{opponentScore} pts</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">Fastest response time gains live victory coins!</p>
        </div>
      )}

      {/* Match Result Modal */}
      {matchState === 'result' && activeRoom && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 text-center space-y-4 shadow-2xl">
          <h2 className="text-3xl font-black text-cyan-300">
            {userScore >= opponentScore ? 'VICTORY! 🏆 (+100 Coins)' : 'BATTLE COMPLETE (+25 Coins)'}
          </h2>
          <p className="text-xs text-slate-300">
            Final Score: {userScore} pts vs {opponentScore} pts
          </p>
          <button
            onClick={() => setMatchState('lobby')}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase hover:bg-cyan-400 transition"
          >
            Return to Arena Lobby
          </button>
        </div>
      )}

      {/* Action Header: Create Room */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Live Firestore Multiplayer Match Rooms
        </h3>

        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-90 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating Room...' : 'Host New Match Room'}
        </button>
      </div>

      {/* Live Match Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {firestoreRooms.length > 0 ? (
          firestoreRooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition"
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-purple-400">{room.gameTitle || '1v1 Duel'}</span>
                <span className="text-amber-400">Stake: {room.stakes || 50} Coins</span>
              </div>

              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{room.hostAvatar || '🧠'}</span>
                  <span>{room.hostName}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Status: {room.status}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500">Room: #{room.roomCode || room.id.slice(0, 5)}</span>
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                >
                  Join Battle
                </button>
              </div>
            </div>
          ))
        ) : (
          DEFAULT_MULTIPLAYER_ROOMS.map((room) => (
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
                <div className="text-xs text-slate-400">Host: {room.hostName}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500">Practice Match</span>
                <button
                  onClick={() => handleJoinRoom({
                    id: room.id,
                    roomCode: '100100',
                    gameTitle: room.gameTitle,
                    hostId: 'bot',
                    hostName: room.hostName,
                    hostAvatar: '🧠',
                    hostScore: 0,
                    hostReady: true,
                    status: 'Waiting',
                    stakes: room.stakes,
                    createdAt: null
                  })}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                >
                  Join Match
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Real-time Global Leaderboard */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-400" />
            Live Global Leaderboard (Synced with Firestore)
          </h3>
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Real-Time Updates
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, idx) => (
              <div key={player.id || idx} className="py-3.5 px-3 flex items-center justify-between hover:bg-slate-950/40 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className={`w-7 text-center font-mono font-black text-sm ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                    {player.avatar || '🧠'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{player.name}</div>
                    <div className="text-[10px] text-slate-400">Level {player.level} • {player.coins} Coins</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black text-cyan-400">{player.brainScore} pts</div>
                  <div className="text-[10px] text-slate-500">Brain Score</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              Register or sign in to feature on the live global leaderboard!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
