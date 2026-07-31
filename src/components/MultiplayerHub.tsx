import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Swords, 
  Zap, 
  Shield, 
  Play, 
  Bot, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Sparkles, 
  Medal,
  Copy,
  Check,
  Key,
  Flame,
  ArrowRight,
  Clock,
  X,
  Target,
  Brain,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, GameId } from '../types';
import { 
  subscribeToLeaderboard, 
  subscribeToMultiplayerRooms, 
  subscribeToRoom,
  createRealtimeRoom, 
  joinRealtimeRoom, 
  joinRoomByCode,
  updateMultiplayerScore,
  finishMultiplayerMatch,
  addCoinsInFirestore,
  RealtimeRoomData 
} from '../services/firebaseService';
import { DEFAULT_MULTIPLAYER_ROOMS } from '../utils/storage';
import { audioHaptics } from '../utils/audioHaptics';

interface MultiplayerHubProps {
  user: UserProfile;
}

// Interactive 2-Player Math Challenge Question Generator
interface Question {
  text: string;
  options: number[];
  answer: number;
}

function generateMathQuestion(): Question {
  const op = ['+', '-', 'x'][Math.floor(Math.random() * 3)];
  let a = 0, b = 0, ans = 0;
  if (op === '+') {
    a = Math.floor(Math.random() * 40) + 10;
    b = Math.floor(Math.random() * 40) + 10;
    ans = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 20;
    b = Math.floor(Math.random() * 20) + 5;
    ans = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    ans = a * b;
  }

  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 4) {
    const offset = (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = ans + offset;
    if (wrong >= 0) optionsSet.add(wrong);
  }

  return {
    text: `${a} ${op === 'x' ? '×' : op} ${b} = ?`,
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    answer: ans
  };
}

export const MultiplayerHub: React.FC<MultiplayerHubProps> = ({ user }) => {
  const [matchState, setMatchState] = useState<'lobby' | 'waiting' | 'playing' | 'result'>('lobby');
  const [activeRoom, setActiveRoom] = useState<RealtimeRoomData | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  // Real-time Scores
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  // Challenge Input & Modals
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('Speed Math Duel');
  const [selectedStakes, setSelectedStakes] = useState<number>(50);
  const [showHostModal, setShowHostModal] = useState<boolean>(false);
  const [directChallengeUser, setDirectChallengeUser] = useState<UserProfile | null>(null);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Firestore Real-time Collections
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [firestoreRooms, setFirestoreRooms] = useState<RealtimeRoomData[]>([]);

  // Interactive Live Game Round State
  const [currentQuestion, setCurrentQuestion] = useState<Question>(generateMathQuestion());
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Subscribe to Leaderboard & Public Rooms
  useEffect(() => {
    const unsubLeaderboard = subscribeToLeaderboard((players) => {
      if (players && players.length > 0) setLeaderboard(players);
    });

    const unsubRooms = subscribeToMultiplayerRooms((rooms) => {
      setFirestoreRooms(rooms);
    });

    return () => {
      unsubLeaderboard();
      unsubRooms();
    };
  }, []);

  // Subscribe to Active Room state changes in real-time
  useEffect(() => {
    if (!activeRoomId) return;

    const unsubSingleRoom = subscribeToRoom(activeRoomId, (roomData) => {
      if (!roomData) return;
      setActiveRoom(roomData);

      const isHost = roomData.hostId === user.id;
      const hostScore = roomData.hostScore || 0;
      const guestScore = roomData.guestScore || 0;

      if (isHost) {
        setMyScore(hostScore);
        setOpponentScore(guestScore);
      } else {
        setMyScore(guestScore);
        setOpponentScore(hostScore);
      }

      // If room was in waiting state and guest joined -> Start match!
      if (roomData.status === 'In Progress' && matchState === 'waiting') {
        setMatchState('playing');
        startBattleGameLoop(roomData);
      }

      // If room status changed to Finished by either player reaching target first -> End Match!
      if (roomData.status === 'Finished' && matchState === 'playing') {
        if (timerRef.current) clearInterval(timerRef.current);
        setMatchState('result');
        const iWon = roomData.winnerId === user.id;
        if (iWon) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          audioHaptics.playFanfare();
          addCoinsInFirestore(user.id, roomData.stakes ? roomData.stakes * 2 : 100);
        } else {
          audioHaptics.playCorrect();
          addCoinsInFirestore(user.id, 25);
        }
      }
    });

    return () => {
      unsubSingleRoom();
    };
  }, [activeRoomId, matchState, user.id]);

  // Start the 30-second live match timer and bot opponent simulation if playing against a bot
  const startBattleGameLoop = (room: RealtimeRoomData) => {
    audioHaptics.playFanfare();
    setTimeLeft(30);
    setStreak(0);
    setMyScore(0);
    setOpponentScore(0);
    setCurrentQuestion(generateMathQuestion());

    if (timerRef.current) clearInterval(timerRef.current);

    // Bot opponent simulation if playing vs Bot/Practice
    const isBotOpponent = room.hostId === 'bot' || room.guestId === 'bot' || !room.guestId;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleEndMatch(room);
          return 0;
        }

        // If opponent is a bot/AI, simulate periodic opponent points
        if (isBotOpponent && Math.random() > 0.4) {
          const inc = Math.floor(Math.random() * 40) + 10;
          setOpponentScore((opPrev) => {
            const nextOp = opPrev + inc;
            if (room.id) {
              updateMultiplayerScore(room.id, false, nextOp);
            }
            return nextOp;
          });
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Handle player selecting an answer in the live 2-player duel
  const handleAnswerClick = (option: number) => {
    if (matchState !== 'playing') return;

    if (option === currentQuestion.answer) {
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      setFeedback('correct');
      const pts = 50 + streak * 10;
      const newScore = myScore + pts;
      setMyScore(newScore);
      setStreak((prev) => prev + 1);

      // Push real-time score to Firestore!
      if (activeRoomId && activeRoom) {
        const isHost = activeRoom.hostId === user.id;
        updateMultiplayerScore(activeRoomId, isHost, newScore);

        // First player to reach 500 points wins the race immediately!
        if (newScore >= 500) {
          if (timerRef.current) clearInterval(timerRef.current);
          finishMultiplayerMatch(activeRoomId, user.id, user.name);
        }
      }
    } else {
      audioHaptics.playError();
      audioHaptics.triggerHaptic('error');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateMathQuestion());
    }, 400);
  };

  // Match end handler when timer expires
  const handleEndMatch = async (room: RealtimeRoomData) => {
    if (matchState === 'result') return;
    setMatchState('result');
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');

    const isHost = room.hostId === user.id;
    const iWon = myScore >= opponentScore;
    const winnerId = iWon ? user.id : (isHost ? (room.guestId || 'opponent') : room.hostId);
    const winnerName = iWon ? user.name : (isHost ? (room.guestName || 'Opponent') : room.hostName);

    if (iWon) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      await addCoinsInFirestore(user.id, room.stakes ? room.stakes * 2 : 100);
    } else {
      await addCoinsInFirestore(user.id, 25);
    }

    if (activeRoomId) {
      await finishMultiplayerMatch(activeRoomId, winnerId, winnerName);
    }
  };

  // Create & Host a room
  const handleCreateRoomSubmit = async () => {
    audioHaptics.playClick();
    setCreating(true);
    setJoinError(null);

    try {
      const { roomId, roomCode } = await createRealtimeRoom(
        user,
        selectedGame,
        selectedStakes,
        directChallengeUser?.id
      );

      setActiveRoomId(roomId);
      setActiveRoom({
        id: roomId,
        roomCode,
        gameTitle: selectedGame,
        hostId: user.id,
        hostName: user.name,
        hostAvatar: user.avatar,
        hostScore: 0,
        hostReady: true,
        status: 'Waiting',
        stakes: selectedStakes,
        createdAt: new Date().toISOString()
      });

      setShowHostModal(false);
      setDirectChallengeUser(null);
      setMatchState('waiting');
      audioHaptics.playCorrect();
    } catch (err: any) {
      console.error('Error hosting room:', err);
      setJoinError('Failed to create match room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Join existing room by Room Code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    audioHaptics.playClick();
    setJoinError(null);

    try {
      const room = await joinRoomByCode(roomCodeInput.trim(), user);
      if (room) {
        setActiveRoomId(room.id);
        setActiveRoom(room);
        setMatchState('playing');
        startBattleGameLoop(room);
      } else {
        // Fallback: create or search in firestoreRooms
        const matched = firestoreRooms.find((r) => r.roomCode === roomCodeInput.trim());
        if (matched) {
          await joinRealtimeRoom(matched.id, user);
          setActiveRoomId(matched.id);
          setActiveRoom(matched);
          setMatchState('playing');
          startBattleGameLoop(matched);
        } else {
          setJoinError(`No active room found with code #${roomCodeInput.trim()}.`);
        }
      }
    } catch (err) {
      console.error('Error joining room by code:', err);
      setJoinError('Failed to join room. Please verify the 6-digit code.');
    }
  };

  // Direct Join Room from list
  const handleJoinDirect = async (room: RealtimeRoomData) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setActiveRoomId(room.id);
    setActiveRoom(room);

    if (room.id && room.hostId !== 'bot') {
      await joinRealtimeRoom(room.id, user);
    }

    setMatchState('playing');
    startBattleGameLoop(room);
  };

  // Copy 6-digit room code
  const copyRoomCode = () => {
    if (!activeRoom?.roomCode) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCodeCopied(true);
    audioHaptics.playClick();
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
            <Swords className="w-4 h-4 text-purple-400" />
            2-Player Live Real-Time Challenges
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Challenge Opponents & Play Head-to-Head
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Challenge friends or leaderboard rivals in real-time cognitive duels. Host match rooms with custom game modes, share 6-digit room codes, and claim live winner rewards!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setDirectChallengeUser(null);
              setShowHostModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            Host 2-Player Match
          </button>
        </div>
      </div>

      {/* Quick Join by Room Code Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Join via 6-Digit Room Code</div>
            <div className="text-[10px] text-slate-400">Enter a challenge code sent by another player to enter match</div>
          </div>
        </div>

        <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. 482910"
            maxLength={6}
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-center text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-full sm:w-36 transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition"
          >
            Join Challenge
          </button>
        </form>
      </div>

      {joinError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
          <span>⚠️ {joinError}</span>
        </div>
      )}

      {/* WAITING ROOM STATE (Host waiting for guest or copy code) */}
      {matchState === 'waiting' && activeRoom && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-purple-500/50 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <Clock className="w-4 h-4 animate-spin text-purple-400" />
            WAITING FOR OPPONENT TO JOIN...
          </div>

          <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Your Challenge Code</div>
            <div className="text-4xl font-mono font-black text-cyan-400 tracking-widest">{activeRoom.roomCode}</div>
            <p className="text-xs text-slate-400">
              Share this 6-digit code with a friend or opponent so they can join your duel!
            </p>
            <button
              onClick={copyRoomCode}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-2 transition"
            >
              {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {codeCopied ? 'Code Copied!' : 'Copy Room Code'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-300">
            <span>Game: <strong className="text-white">{activeRoom.gameTitle}</strong></span>
            <span>•</span>
            <span>Stake: <strong className="text-amber-400">{activeRoom.stakes} Coins</strong></span>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                // Launch match with AI practice opponent if host wants to play immediately
                const botRoom = { ...activeRoom, guestId: 'bot', guestName: 'MindForge Bot 🤖' };
                setActiveRoom(botRoom);
                setMatchState('playing');
                startBattleGameLoop(botRoom);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <Bot className="w-4 h-4" />
              Practice vs AI Bot Now
            </button>

            <button
              onClick={() => setMatchState('lobby')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition"
            >
              Cancel Room
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE LIVE 2-PLAYER INTERACTIVE BATTLE */}
      {matchState === 'playing' && activeRoom && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
          
          {/* Top Score Bar & Live 2-Player Race Track */}
          <div className="space-y-4 border-b border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Host Player */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg">
                  {activeRoom.hostAvatar || '🧠'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{activeRoom.hostName}</div>
                  <div className="text-xl font-mono font-black text-cyan-400">
                    {activeRoom.hostId === user.id ? myScore : opponentScore} / 500 pts
                  </div>
                </div>
              </div>

              {/* VS Badge & Timer */}
              <div className="text-center">
                <div className="text-xs font-black tracking-widest text-purple-400 uppercase">FIRST TO 500 PTS WINS!</div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 mt-1 mx-auto w-max">
                  <Clock className="w-3.5 h-3.5" />
                  <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
              </div>

              {/* Guest / Opponent Player */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 w-full sm:w-auto text-right justify-end">
                <div>
                  <div className="text-xs font-bold text-slate-300">{activeRoom.guestName || 'Opponent'}</div>
                  <div className="text-xl font-mono font-black text-rose-400">
                    {activeRoom.hostId === user.id ? opponentScore : myScore} / 500 pts
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg">
                  {activeRoom.guestAvatar || '⚡'}
                </div>
              </div>
            </div>

            {/* Visual Race Progress Bars */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span>{activeRoom.hostId === user.id ? 'You' : activeRoom.hostName}:</span>
                  <span>{Math.min(100, Math.round((myScore / 500) * 100))}%</span>
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span>{activeRoom.hostId === user.id ? (activeRoom.guestName || 'Friend') : activeRoom.hostName}:</span>
                  <span>{Math.min(100, Math.round((opponentScore / 500) * 100))}%</span>
                </span>
              </div>

              {/* Player 1 Progress */}
              <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (myScore / 500) * 100)}%` }}
                />
              </div>

              {/* Player 2 Progress */}
              <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (opponentScore / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Game Challenge Round */}
          <div className="text-center space-y-6 max-w-xl mx-auto py-4">
            
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Challenge: <span className="text-cyan-400 font-black">{activeRoom.gameTitle}</span>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wide">
                {currentQuestion.text}
              </div>

              {feedback && (
                <div className={`text-xs font-extrabold uppercase tracking-wider animate-bounce ${
                  feedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {feedback === 'correct' ? '⚡ +50 PTS! EXCELLENT!' : '❌ INCORRECT - TRY AGAIN!'}
                </div>
              )}
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(opt)}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800 hover:bg-cyan-500/20 hover:border-cyan-400 border border-slate-700 text-white font-mono font-black text-xl sm:text-2xl transition shadow-md active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500">
              Solve fast! Every correct response updates your score in real-time against your opponent.
            </p>
          </div>
        </div>
      )}

      {/* MATCH RESULT MODAL */}
      {matchState === 'result' && activeRoom && (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 text-center space-y-6 shadow-2xl animate-fade-in max-w-lg mx-auto">
          <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">
              {myScore >= opponentScore ? 'VICTORY! 🏆' : 'RACE COMPLETE'}
            </h2>
            <div className="text-base font-extrabold text-cyan-300">
              {activeRoom.winnerName ? (
                <span>🏆 <strong className="text-amber-400">{activeRoom.winnerName}</strong> Finished First & Won!</span>
              ) : (
                myScore >= opponentScore ? 'You Finished First & Won the Match!' : 'Match Finished!'
              )}
            </div>
            <p className="text-xs font-bold text-slate-400">
              {myScore >= opponentScore 
                ? `You won +${activeRoom.stakes ? activeRoom.stakes * 2 : 100} Coins and +100 Level XP!` 
                : `Great duel! +25 Coins & +30 Level XP awarded.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 font-bold">Your Score</div>
              <div className="text-2xl font-mono font-black text-cyan-400">{myScore} / 500 pts</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold">Opponent Score</div>
              <div className="text-2xl font-mono font-black text-rose-400">{opponentScore} / 500 pts</div>
            </div>
          </div>

          <button
            onClick={() => setMatchState('lobby')}
            className="w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-400 transition"
          >
            Return to Arena Lobby
          </button>
        </div>
      )}

      {/* ACTIVE FIRESTORE PUBLIC MATCH ROOMS GRID */}
      {matchState === 'lobby' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Active Firestore Match Rooms
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {firestoreRooms.length} Rooms Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {firestoreRooms.length > 0 ? (
              firestoreRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between"
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
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Status: {room.status}</span>
                      <span>•</span>
                      <span className="font-mono text-cyan-400">Code: #{room.roomCode || room.id.slice(0, 5)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-500">2-Player Room</span>
                    <button
                      onClick={() => handleJoinDirect(room)}
                      disabled={room.status === 'Finished' || room.hostId === user.id}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-40"
                    >
                      {room.hostId === user.id ? 'Your Room' : 'Join Match'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              DEFAULT_MULTIPLAYER_ROOMS.map((room) => (
                <div
                  key={room.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between"
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
                      onClick={() => handleJoinDirect({
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
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
                    >
                      Challenge Bot
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REAL-TIME GLOBAL LEADERBOARD & DIRECT CHALLENGE */}
      {matchState === 'lobby' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" />
              Global Leaderboard — Direct 2-Player Challenges
            </h3>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time Firestore Sync
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
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm overflow-hidden shrink-0">
                      {player.avatar && (player.avatar.startsWith('http') || player.avatar.startsWith('data:') || player.avatar.includes('/')) ? (
                        <img 
                          src={player.avatar} 
                          alt={player.name} 
                          className="w-full h-full object-cover rounded-lg" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = '🧠';
                            }
                          }}
                        />
                      ) : (
                        player.avatar || '🧠'
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.id === user.id && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        LVL {player.level} • {player.brainScore} pts
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {player.id !== user.id && (
                      <button
                        onClick={() => {
                          setDirectChallengeUser(player);
                          setShowHostModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500 hover:text-white text-purple-300 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Challenge</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Leaderboard syncing with active Firebase players...
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / HOST MATCH MODAL */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                {directChallengeUser ? `Challenge ${directChallengeUser.name}` : 'Host 2-Player Match'}
              </h2>
              <button onClick={() => setShowHostModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Select Cognitive Game */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Game Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Speed Math Duel',
                    'Memory Matrix Clash',
                    'Quick Decision Reflex',
                    'Word Intelligence Sprint'
                  ].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGame(g)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                        selectedGame === g
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Stakes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Coin Stakes</label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedStakes(amt)}
                      className={`py-2 rounded-xl border text-center text-xs font-mono font-black transition ${
                        selectedStakes === amt
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {amt} Coins
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowHostModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoomSubmit}
                disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                <span>{creating ? 'Creating...' : 'Create Room Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
