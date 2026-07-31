import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Globe,
  KeyRound,
  ArrowRight
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAuthSuccess: (userProfile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'register' | 'forgot'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
        setTimeout(() => onClose(), 1200);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please fill in both email and password.');
        }

        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCred.user;

        // Fetch existing document from Firestore if it exists
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
        setSuccessMsg('Signed in successfully! Synced your brain scores & coins.');
        audioHaptics.playCorrect();
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      const code = err.code || '';

      if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        msg = 'Email/Password authentication is not enabled in Firebase Console. You can continue as Guest or enable Email/Password provider in Firebase console.';
      } else if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please click "Sign In" above to log in.';
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
        msg = 'Incorrect email or password. Please verify your credentials or register a new account.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Access temporarily disabled for security. Please try again later.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network connection error. Please check your internet connection.';
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
      setSuccessMsg('Signed in with Google! Synced real-time profile.');
      audioHaptics.playFanfare();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Google pop-up was blocked by your browser. Please allow popups or use Email sign in.');
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in popup was closed before completing.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is disabled in your Firebase console settings. Enable Google provider in Firebase to use it.');
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
        console.warn('Anonymous auth in Firebase disabled or unavailable, continuing local guest session:', err);
      }

      const profile: UserProfile = {
        ...currentUser,
        id: uid,
        name: currentUser.name && !currentUser.name.startsWith('Neural Explorer') ? currentUser.name : 'Guest Player #' + Math.floor(Math.random() * 900 + 100),
        level: 1,
        xp: 0,
        brainScore: 100,
        rank: 'Apprentice Mind',
      };
      await saveUserProfileToFirestore(profile);
      onAuthSuccess(profile);
      setSuccessMsg('Logged in as Guest Player!');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error('Guest auth failed:', err);
      setError('Could not start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6 text-white overflow-hidden">
        
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {tab === 'register' ? 'Create BrainVerse Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            Register to sync coins, save brain scores, climb real-time leaderboards & play live duals!
          </p>
        </div>

        {/* Tabs: Sign In / Register */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
                tab === 'register' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
                tab === 'signin' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        )}

        {/* Notification Messages */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {tab === 'forgot' ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
            {/* Google 1-Click Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                or email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Mercer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Username (Optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. alex_mindforge"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-400">Password</label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setTab('forgot'); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] font-bold text-cyan-400 hover:underline transition"
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition ${
                      tab === 'register' && password.length > 0 && password.length < 6
                        ? 'border-amber-500/70 focus:border-amber-400'
                        : 'border-slate-800 focus:border-cyan-400'
                    }`}
                  />
                </div>
                {tab === 'register' && password.length > 0 && password.length < 6 && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Password is currently {password.length} char{password.length > 1 ? 's' : ''}. Need at least 6 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 mt-2"
              >
                {loading ? 'Processing...' : tab === 'register' ? 'Register Account' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {/* Guest Mode Fallback */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Continue as Instant Guest Player
          </button>
        </div>

      </div>
    </div>
  );
};
