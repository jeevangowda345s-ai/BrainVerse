import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Brain, 
  ArrowUpRight, 
  Zap, 
  Play, 
  Lightbulb, 
  Compass,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { UserProfile, AICoachMessage, GameId, AIRoadmap } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface AICoachProps {
  user: UserProfile;
  onSelectGame?: (gameId: GameId) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ user, onSelectGame }) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'm1',
      sender: 'coach',
      text: `Greetings ${user.name}! I'm Jeevu, your MindForge AI Cognitive Coach. I've analyzed your performance profile:\n\n• Logic Rating: ${user.ratings.logic} pts\n• Memory Rating: ${user.ratings.memory} pts\n• Focus Rating: ${user.ratings.focus} pts\n\nWhat cognitive skill would you like to level up today?`,
      timestamp: 'Just now',
      suggestions: [
        'Analyze my weak skills',
        'How can I improve working memory?',
        'Recommend today\'s practice plan',
        'Predict my 30-day score growth',
      ],
      recommendedGameId: 'memory_matrix',
      takeawayTip: 'Daily focused training builds persistent cognitive reserve.',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // AI Roadmap Modal State
  const [showRoadmapModal, setShowRoadmapModal] = useState<boolean>(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState<boolean>(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<AIRoadmap | null>(user.aiRoadmap || null);

  const sendMessage = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim() || loading) return;

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');

    const userMsg: AICoachMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          history: historyPayload,
          userProfile: user,
        }),
      });

      const data = await res.json();
      const coachMsg: AICoachMessage = {
        id: `c-${Date.now()}`,
        sender: 'coach',
        text: data.reply || 'Keep pushing your cognitive boundaries every day!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || ['Analyze my progress', 'Give me another tip'],
        recommendedGameId: data.recommendedGameId || '',
        takeawayTip: data.takeawayTip || '',
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (e) {
      const errorMsg: AICoachMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: "I experienced a temporary neural link delay, but here's my core recommendation: practice Memory Matrix & Mental Math to keep your focus sharp!",
        timestamp: 'Just now',
        recommendedGameId: 'memory_matrix',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRoadmap = async () => {
    setLoadingRoadmap(true);
    audioHaptics.playClick();
    try {
      const res = await fetch('/api/ai-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: user.age || 22,
          occupation: user.occupation || 'Mind Explorer',
          dailyTime: `${user.dailyGoalMins || 15} mins`,
          goals: user.goals || ['Improve Memory', 'Boost Processing Speed'],
        }),
      });
      const data = await res.json();
      if (data.roadmap) {
        setGeneratedRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error('Roadmap generation failed', e);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const getGameTitle = (gameId?: string) => {
    switch (gameId) {
      case 'memory_matrix': return 'Memory Matrix';
      case 'number_sequence': return 'Number Sequence';
      case 'mental_math': return 'Mental Math';
      case 'maze_escape': return 'Maze Escape';
      case 'sudoku': return 'Sudoku Deduction';
      case 'quick_decision': return 'Quick Decision';
      case 'word_intelligence': return 'Word Intelligence';
      case 'coding_logic': return 'Coding Logic';
      case 'brain_lab': return 'Brain Lab';
      default: return 'Mini Game';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-500 p-0.5 shadow-xl shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-300">
              <Bot className="w-8 h-8 animate-pulse text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Jeevu AI Cognitive Coach
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-purple-500/40 tracking-wider">
                GEMINI 3.6 FLASH
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-turn AI cognitive analysis, customized neural diagnostics & practice roadmaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowRoadmapModal(true);
              if (!generatedRoadmap) generateAIRoadmap();
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <Compass className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>AI 30-Day Roadmap</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>{user.brainScore} Brain Score</span>
          </div>
        </div>
      </div>

      {/* Quick AI Intelligence Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: '🧠 Neural Audit', prompt: 'Perform a full audit of my cognitive skill ratings and give me actionable feedback.' },
          { label: '⚡ Practice Routine', prompt: 'Create an optimized 15-minute daily practice routine based on my goals.' },
          { label: '🎯 Focus Protocol', prompt: 'Give me a scientific protocol to eliminate mental fatigue and maximize concentration.' },
          { label: '💡 Memory Chunking', prompt: 'Explain how memory chunking works and how I can apply it in games.' },
          { label: '📈 Score Growth', prompt: 'Analyze my ratings and predict my expected score growth over the next month.' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(chip.prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 hover:border-purple-500/40"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 h-[500px] flex flex-col justify-between shadow-2xl relative">
        
        {/* Messages Container */}
        <div className="overflow-y-auto space-y-4 pr-2 scrollbar-none flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'coach' && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Golden Takeaway Tip Badge */}
                {msg.sender === 'coach' && msg.takeawayTip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-200">Key AI Takeaway: </span>
                      <span>{msg.takeawayTip}</span>
                    </div>
                  </div>
                )}

                {/* Recommended Mini Game Direct Launcher */}
                {msg.sender === 'coach' && msg.recommendedGameId && onSelectGame && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Recommended Training:
                    </span>
                    <button
                      onClick={() => onSelectGame(msg.recommendedGameId as GameId)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black hover:brightness-110 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch {getGameTitle(msg.recommendedGameId)}</span>
                    </button>
                  </div>
                )}

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(s)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <span>{s}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-right text-slate-500 font-mono">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs text-purple-300 font-bold flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                Jeevu Gemini AI is reasoning about your neural stats...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Jeevu AI Coach anything about your cognitive training..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-cyan-300 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-slate-950 font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* AI Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Compass className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">AI 30-Day Growth Roadmap</h2>
                  <p className="text-xs text-slate-400">Personalized cognitive plan by Jeevu AI</p>
                </div>
              </div>

              <button
                onClick={() => setShowRoadmapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {loadingRoadmap ? (
              <div className="py-12 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
                <p className="text-sm font-bold text-purple-300">
                  Jeevu AI is building your custom 30-day cognitive roadmap...
                </p>
              </div>
            ) : generatedRoadmap ? (
              <div className="space-y-6">
                
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <h3 className="text-base font-black text-purple-200">{generatedRoadmap.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{generatedRoadmap.summary}</p>
                </div>

                {/* Daily Routine Schedule */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Recommended Daily Training Schedule
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {generatedRoadmap.recommendedDailyRoutine.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-extrabold text-white block">{item.time} — {item.game}</span>
                            <span className="text-slate-400 text-[11px]">Focus: {item.focus}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/20">
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projected Skill Growth */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                  <Award className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Projected 30-Day Skill Growth</h5>
                    <p className="text-sm font-extrabold text-white">{generatedRoadmap.projected30DayGrowth}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={generateAIRoadmap}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Regenerate Roadmap
                  </button>
                  <button
                    onClick={() => setShowRoadmapModal(false)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 text-xs font-bold hover:brightness-110 transition"
                  >
                    Got It!
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
};

