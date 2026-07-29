import React, { useState } from 'react';
import { Brain, Sparkles, CheckCircle2, ArrowRight, User, Target, Clock, GraduationCap, Briefcase } from 'lucide-react';
import { UserProfile, AIRoadmap } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface OnboardingModalProps {
  user: UserProfile;
  onComplete: (updatedProfile: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(user.name || '');
  const [age, setAge] = useState<number>(user.age || 24);
  const [occupation, setOccupation] = useState<string>(user.occupation || 'Professional');
  const [education, setEducation] = useState<string>(user.education || 'Bachelor Degree');
  const [dailyTime, setDailyTime] = useState<number>(user.dailyGoalMins || 15);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.goals || ['Improve Memory', 'Improve Logic']);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<AIRoadmap | null>(null);

  const goalOptions = [
    'Improve Memory',
    'Improve Focus',
    'Improve Logic',
    'Improve Mathematics',
    'Improve Attention',
    'Improve Processing Speed',
    'Competitive Exam Preparation',
    'Personal Development',
  ];

  const toggleGoal = (goal: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('tap');
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleGenerateRoadmap = async () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setLoadingAI(true);

    try {
      const res = await fetch('/api/ai-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          occupation,
          education,
          dailyTime: `${dailyTime} minutes`,
          goals: selectedGoals,
        }),
      });

      const data = await res.json();
      if (data.roadmap) {
        setGeneratedRoadmap(data.roadmap);
      }
    } catch (e) {
      // Fallback roadmap
      setGeneratedRoadmap({
        title: 'Custom Cognitive Acceleration Plan',
        summary: `Designed specifically for ${occupation} aiming to master ${selectedGoals.slice(0, 2).join(' & ')} in ${dailyTime} minutes a day.`,
        recommendedDailyRoutine: [
          { time: 'Morning Priming', game: 'Memory Matrix', duration: '5 mins', focus: 'Working Memory' },
          { time: 'Midday Focus', game: 'Mental Math', duration: '5 mins', focus: 'Processing Speed' },
          { time: 'Evening Plan', game: 'Maze Escape', duration: '5 mins', focus: 'Logical Strategy' },
        ],
        projected30DayGrowth: '+22% Memory Recall, +18% Reaction Speed',
      });
    } finally {
      setLoadingAI(false);
      setStep(3);
    }
  };

  const handleFinish = () => {
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');
    onComplete({
      name,
      age,
      occupation,
      education,
      dailyGoalMins: dailyTime,
      goals: selectedGoals,
      isOnboarded: true,
      aiRoadmap: generatedRoadmap || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 text-slate-100 overflow-hidden">
        
        {/* Glow Background Effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Brain className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Welcome to BrainVerse
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              MindForge AI Cognitive Profiling & Learning Roadmap
            </p>
          </div>
        </div>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Tell us about yourself
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Your Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Your Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Occupation
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Software Engineer / Tech">Software Engineer / Tech</option>
                  <option value="Healthcare / Medical">Healthcare / Medical</option>
                  <option value="Finance & Business">Finance & Business</option>
                  <option value="Creative / Design">Creative / Design</option>
                  <option value="Executive / Manager">Executive / Manager</option>
                  <option value="Researcher / Scientist">Researcher / Scientist</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-pink-400" /> Education Level
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate / Master">Postgraduate / Master</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Daily Target Practice Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      audioHaptics.playClick();
                      setDailyTime(mins);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      dailyTime === mins
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins} Mins/Day
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
              >
                <span>Select Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Cognitive Training Goals */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> What do you want to train?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{goal}</span>
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-700'}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
              >
                Back
              </button>

              <button
                onClick={handleGenerateRoadmap}
                disabled={loadingAI}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{loadingAI ? 'Building AI Plan...' : 'Generate AI Roadmap'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Generated AI Roadmap Preview */}
        {step === 3 && generatedRoadmap && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-cyan-300">{generatedRoadmap.title}</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4">{generatedRoadmap.summary}</p>

              <div className="space-y-2 mb-4">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Daily Routine</h5>
                {generatedRoadmap.recommendedDailyRoutine.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div>
                      <span className="text-cyan-400 font-bold">{item.time}: </span>
                      <span className="text-slate-200 font-semibold">{item.game}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-md">{item.focus}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-semibold flex items-center justify-between">
                <span>Targeted 30-Day Growth:</span>
                <span className="text-cyan-300 font-bold">{generatedRoadmap.projected30DayGrowth}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition shadow-xl shadow-cyan-500/25"
            >
              Start BrainVerse Training
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
