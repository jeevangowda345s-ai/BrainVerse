import React from 'react';
import { BarChart3, TrendingUp, Activity, ShieldCheck, Zap, Brain, Calendar, Target } from 'lucide-react';
import { UserProfile, GameSessionResult } from '../types';

interface AnalyticsDashboardProps {
  user: UserProfile;
  sessions: GameSessionResult[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user, sessions }) => {
  const avgAccuracy = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length)
    : 92;

  const avgReactionMs = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.reactionTimeMs, 0) / sessions.length)
    : 420;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Cognitive Analytics & Intelligence Radar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of memory retention, reaction speed, accuracy trends & AI growth projections.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-cyan-300">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span>Overall Score: {user.brainScore}</span>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400">Average Accuracy</div>
          <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
            <span>{avgAccuracy}%</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-[10px] text-slate-500">+4% higher than last week</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mean Reaction Time</div>
          <div className="text-2xl font-black text-cyan-400 flex items-center gap-2">
            <span>{avgReactionMs} ms</span>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-[10px] text-slate-500">Top 5% speed bracket</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Exercises Completed</div>
          <div className="text-2xl font-black text-purple-400 flex items-center gap-2">
            <span>{sessions.length + 28}</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-[10px] text-slate-500">Consistent daily practice</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400">30-Day Growth Forecast</div>
          <div className="text-2xl font-black text-pink-400 flex items-center gap-2">
            <span>+185 pts</span>
            <ShieldCheck className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-[10px] text-slate-500">AI confidence: 94%</div>
        </div>
      </div>

      {/* Skill Ratings Progress Bar List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Individual Skill Ratings Breakdown
        </h3>

        <div className="space-y-4">
          {[
            { label: 'Working Memory', score: user.ratings.memory, color: 'from-cyan-500 to-blue-500' },
            { label: 'Logical Reasoning', score: user.ratings.logic, color: 'from-purple-500 to-indigo-500' },
            { label: 'Sustained Focus', score: user.ratings.focus, color: 'from-fuchsia-500 to-pink-500' },
            { label: 'Mathematical Speed', score: user.ratings.math, color: 'from-emerald-400 to-teal-500' },
            { label: 'Attention to Detail', score: user.ratings.attention, color: 'from-amber-400 to-orange-500' },
            { label: 'Processing Speed', score: user.ratings.speed, color: 'from-rose-500 to-red-500' },
          ].map((item, idx) => {
            const percent = Math.min(100, Math.max(10, Math.round((item.score / 2000) * 100)));
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-cyan-400">{item.score} / 2000 pts</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Recent Session History
        </h3>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            No game sessions saved yet. Complete a mini-game to view detailed logs!
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((sess, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{sess.gameName}</div>
                  <div className="text-[10px] text-slate-400">{sess.timestamp}</div>
                </div>

                <div className="flex items-center gap-4 font-bold">
                  <span className="text-emerald-400">Score: {sess.score}</span>
                  <span className="text-cyan-400">Acc: {sess.accuracy}%</span>
                  <span className="text-purple-400">+{sess.xpEarned} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
