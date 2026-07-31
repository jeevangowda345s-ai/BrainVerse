import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Globe, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Bot, 
  Gamepad2, 
  ArrowRight,
  Shield,
  Activity,
  KeyRound
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInAnonymously 
} from '../lib/firebase';
import { UserProfile } from '../types';
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from '../services/firebaseService';
import { audioHaptics } from '../utils/audioHaptics';

interface AuthScreenProps {
  currentUser: UserProfile;
  onAuthSuccess: (userProfile: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'register' | 'signin' | 'forgot'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }

    setLoading(true);
    audioHaptics.playClick();

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg(`Password reset email sent to ${email.trim()}. Please check your inbox or spam folder.`);
      audioHaptics.playFanfare();
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send password reset email.';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No registered user account found with this email address.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      audioHaptics.triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    audioHaptics.playClick();

    try {
      if (tab === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim()) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCred.user;

        const newProfile: UserProfile = {
          ...currentUser,
          id: firebaseUser.uid,
          name: name.trim(),
          username: username.trim() || name.toLowerCase().replace(/\s+/g, '_'),
          email: firebaseUser.email || email.trim(),
          level: 1,
          xp: 0,
          brainScore: 100,
          rank: 'Apprentice Mind',
          isOnboarded: true,
          isReturningUser: false,
          isGuest: false,
        };

        await saveUserProfileToFirestore(newProfile);
        onAuthSuccess(newProfile);
        setSuccessMsg('Account registered successfully! Welcome to BrainVerse.');
        audioHaptics.playFanfare();
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please fill in both email and password.');
        }

        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCred.user;

        const existingProfile = await getUserProfileFromFirestore(firebaseUser.uid);

        const updatedProfile: UserProfile = existingProfile ? {
          ...existingProfile,
          id: firebaseUser.uid,
          email: firebaseUser.email || email.trim(),
          isReturningUser: true,
          isGuest: false,
        } : {
          ...currentUser,
          id: firebaseUser.uid,
          email: firebaseUser.email || email.trim(),
          name: firebaseUser.displayName || currentUser.name,
          isReturningUser: true,
          isGuest: false,
        };

        if (!existingProfile) {
          await saveUserProfileToFirestore(updatedProfile);
        }

        onAuthSuccess(updatedProfile);
        setSuccessMsg('Signed in successfully! Access granted.');
        audioHaptics.playCorrect();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      const code = err.code || '';

      if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Email/Password auth requires Firebase provider activation. You can also sign in with Google or continue as Guest.';
      } else if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please switch to "Sign In" above to log in.';
      } else if (code === 'auth/weak-password' || msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters long.';
      } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        msg = 'Invalid email address format.';
      } else if (
        code === 'auth/user-not-found' || 
        code === 'auth/wrong-password' || 
        code === 'auth/invalid-credential' ||
        msg.includes('invalid-credential') ||
        msg.includes('user-not-found') ||
        msg.includes('wrong-password')
      ) {
        msg = 'Incorrect email or password. Please check your details or register a new account.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network connection error. Please verify your internet connection.';
      }

      setError(msg);
      audioHaptics.triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    audioHaptics.playClick();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const existingProfile = await getUserProfileFromFirestore(gUser.uid);

      const profile: UserProfile = existingProfile ? {
        ...existingProfile,
        id: gUser.uid,
        name: gUser.displayName || existingProfile.name,
        avatar: gUser.photoURL || existingProfile.avatar || '🧠',
        email: gUser.email || existingProfile.email || '',
        isReturningUser: true,
        isGuest: false,
      } : {
        ...currentUser,
        id: gUser.uid,
        name: gUser.displayName || 'Neural Master',
        username: (gUser.email ? gUser.email.split('@')[0] : 'user') + '_' + Math.floor(Math.random() * 1000),
        email: gUser.email || '',
        avatar: gUser.photoURL || currentUser.avatar || '🧠',
        level: 1,
        xp: 0,
        brainScore: 100,
        rank: 'Apprentice Mind',
        isOnboarded: true,
        isReturningUser: false,
        isGuest: false,
      };

      await saveUserProfileToFirestore(profile);
      onAuthSuccess(profile);
      setSuccessMsg('Signed in with Google! Syncing profile...');
      audioHaptics.playFanfare();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Google pop-up was blocked. Please allow popups or use email registration.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
      audioHaptics.triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    audioHaptics.playClick();

    try {
      let uid = 'guest_' + Date.now();
      try {
        const res = await signInAnonymously(auth);
        if (res?.user?.uid) uid = res.user.uid;
      } catch (err: any) {
        console.warn('Anonymous auth falling back to instant guest session:', err);
      }

      const profile: UserProfile = {
        ...currentUser,
        id: uid,
        name: currentUser.name && !currentUser.name.startsWith('Neural Explorer') ? currentUser.name : 'Guest Player #' + Math.floor(Math.random() * 900 + 100),
        level: 1,
        xp: 0,
        brainScore: 100,
        rank: 'Apprentice Mind',
        isReturningUser: false,
        isGuest: true,
      };
      await saveUserProfileToFirestore(profile);
      onAuthSuccess(profile);
      audioHaptics.playCorrect();
    } catch (err) {
      console.error('Guest auth failed:', err);
      setError('Could not start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
      
      {/* Background Neon Grid & Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00F5FF]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Header Branding Bar */}
      <header className="relative z-10 border-b border-[#1A1A22] bg-[#0A0A10]/80 backdrop-blur-md py-4 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5FF] via-purple-600 to-pink-500 p-0.5 shadow-[0_0_20px_rgba(0,245,255,0.4)]">
              <div className="w-full h-full rounded-[10px] bg-[#050508] flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#00F5FF] animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-[#00F5FF] via-purple-300 to-white bg-clip-text text-transparent">
                BrainVerse
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF]">
                Cognitive Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Secure Authentication</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Hero Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Product Showcase & Value Props */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF] text-xs font-bold shadow-[0_0_15px_rgba(0,245,255,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to Next-Gen Brain Training</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Unlock Your <span className="bg-gradient-to-r from-[#00F5FF] via-purple-400 to-pink-500 bg-clip-text text-transparent">Peak Cognitive</span> Potential.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Sign in or create an account to access 15+ interactive mini-games, earn XP, climb real-time global leaderboards, and get AI coaching.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#0C0C14] border border-slate-800/80 space-y-2 hover:border-[#00F5FF]/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center text-[#00F5FF] group-hover:scale-110 transition">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">15+ Mini-Games</h3>
              <p className="text-xs text-slate-400">Memory, math, logic, maze, word intelligence & coding puzzles.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C0C14] border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Coach Jeevu</h3>
              <p className="text-xs text-slate-400">Personalized cognitive analysis, workout advice, and score feedback.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C0C14] border border-slate-800/80 space-y-2 hover:border-amber-500/40 transition group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Live Leaderboards</h3>
              <p className="text-xs text-slate-400">Compete with global players, earn coins, and unlock tier badges.</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-4 flex items-center gap-8 border-t border-slate-900 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00F5FF]" />
              <span>Real-Time Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Cloud Saves</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Card (Register / Login) */}
        <div className="lg:col-span-5">
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0A0A12]/90 border border-slate-800/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
            
            {/* Top Cyan Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00F5FF] via-purple-500 to-pink-500 rounded-t-3xl" />

            {/* Header / Switch Tabs */}
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  {tab === 'forgot' && <KeyRound className="w-6 h-6 text-[#00F5FF]" />}
                  {tab === 'register' ? 'Create Your Account' : tab === 'signin' ? 'Welcome Back' : 'Reset Password'}
                </h2>
                <p className="text-xs text-slate-400">
                  {tab === 'register' 
                    ? 'Register to save your brain scores, coins, and live rank.' 
                    : tab === 'signin'
                    ? 'Sign in to resume your cognitive training sessions.'
                    : 'Enter your registered email address to receive a password reset link.'}
                </p>
              </div>

              {/* Tab Selector */}
              {tab !== 'forgot' && (
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#050508] border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(null); setSuccessMsg(null); }}
                    className={`py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
                      tab === 'register' 
                        ? 'bg-gradient-to-r from-[#00F5FF] to-blue-600 text-slate-950 shadow-md shadow-[#00F5FF]/20' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setError(null); setSuccessMsg(null); }}
                    className={`py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
                      tab === 'signin' 
                        ? 'bg-gradient-to-r from-[#00F5FF] to-blue-600 text-slate-950 shadow-md shadow-[#00F5FF]/20' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Error / Success Notifications */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {tab === 'forgot' ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#050508] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00F5FF] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F5FF] via-blue-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-[#00F5FF]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setError(null); setSuccessMsg(null); }}
                    className="text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Google 1-Click Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-[#050508] hover:bg-slate-900 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-[#0A0A12] px-3 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                    or email
                  </span>
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {tab === 'register' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Alex Mercer"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#050508] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00F5FF] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Username (Optional)</label>
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. alex_mindforge"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#050508] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00F5FF] transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#050508] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00F5FF] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">Password</label>
                      {tab === 'signin' && (
                        <button
                          type="button"
                          onClick={() => { setTab('forgot'); setError(null); setSuccessMsg(null); }}
                          className="text-[11px] font-bold text-[#00F5FF] hover:underline transition"
                        >
                          Forgot Password?
                        </button>
                      )}
                      {tab === 'register' && (
                        <span className={`text-[10px] font-mono ${password.length > 0 && password.length < 6 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                          Min. 6 chars
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#050508] border rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition ${
                          tab === 'register' && password.length > 0 && password.length < 6
                            ? 'border-amber-500/70 focus:border-amber-400'
                            : 'border-slate-800 focus:border-[#00F5FF]'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F5FF] via-blue-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-[#00F5FF]/20 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Processing...' : tab === 'register' ? 'Register & Start Training' : 'Sign In To Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {/* Instant Guest Mode Option */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="text-xs font-bold text-slate-400 hover:text-[#00F5FF] transition flex items-center justify-center gap-1.5 mx-auto py-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Play Instantly as Guest</span>
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-[#1A1A22] bg-[#0A0A10]/60 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        BrainVerse MindForge Platform • Built for Cognitive Excellence
      </footer>

    </div>
  );
};
