import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Brain, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { UserProfile, AICoachMessage } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface AICoachProps {
  user: UserProfile;
}

export const AICoach: React.FC<AICoachProps> = ({ user }) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'm1',
      sender: 'coach',
      text: `Greetings ${user.name}! I'm Jeevu, your MindForge AI Cognitive Coach. I've analyzed your performance profile:\n\n• Logic Rating: ${user.ratings.logic} pts (Strong)\n• Memory Rating: ${user.ratings.memory} pts\n• Focus Rating: ${user.ratings.focus} pts\n\nWhat cognitive skill would you like to level up today?`,
      timestamp: 'Just now',
      suggestions: [
        'Analyze my weak skills',
        'How can I improve working memory?',
        'Recommend today\'s practice plan',
        'Predict my 30-day score growth',
      ],
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim() || loading) return;

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');

    const userMsg: AICoachMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          userProfile: user,
        }),
      });

      const data = await res.json();
      const coachMsg: AICoachMessage = {
        id: `c-${Date.now()}`,
        sender: 'coach',
        text: data.reply || 'Keep pushing your cognitive boundaries every day!',
        timestamp: 'Just now',
        suggestions: data.suggestions || ['Analyze my progress', 'Give me another tip'],
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (e) {
      const errorMsg: AICoachMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: "I experienced a temporary neural link delay, but here's my core recommendation: practice Memory Matrix & Mental Math to keep your focus sharp!",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-300">
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Jeevu AI Cognitive Coach
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ACTIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by Gemini AI — Personal performance analysis, error diagnostics & practice roadmaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          <Brain className="w-4 h-4" />
          <span>Brain Score: {user.brainScore}</span>
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[480px] flex flex-col justify-between shadow-2xl">
        
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
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Optional Suggestions */}
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
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-purple-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                Jeevu AI is analyzing your neural stats...
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
            placeholder="Ask Jeevu AI Coach anything about your brain training..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-cyan-300 focus:border-purple-500 focus:outline-none"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
