import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Crown, 
  Coins, 
  Brain, 
  Zap, 
  Trophy, 
  Sparkles, 
  Camera, 
  QrCode, 
  ExternalLink, 
  AlertCircle,
  Copy,
  Check,
  IndianRupee,
  Lock
} from 'lucide-react';
import { UserProfile, ProUpgradeRequest } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadProUpgradeRequests, maskUpiId } from '../utils/storage';
import { fetchProUpgradeRequestsFromFirestore } from '../services/firebaseService';

interface UserProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAvatarModal?: () => void;
  onOpenPremium?: () => void;
  onOpenRedeemCash?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdateUser,
  onOpenAvatarModal,
  onOpenPremium,
  onOpenRedeemCash,
}) => {
  const [requests, setRequests] = useState<ProUpgradeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const fetchStatusHistory = async () => {
    setRefreshing(true);
    const local = loadProUpgradeRequests();
    let remote: ProUpgradeRequest[] = [];
    try {
      remote = await fetchProUpgradeRequestsFromFirestore();
    } catch (e) {
      console.warn('Firestore request load error:', e);
    }

    const map = new Map<string, ProUpgradeRequest>();
    remote.forEach(r => map.set(r.id, r));
    local.forEach(r => {
      if (!map.has(r.id)) map.set(r.id, r);
    });

    const userRequests = Array.from(map.values())
      .filter(r => r.userId === user.id || r.userEmail === user.email || (user.email && r.userEmail === user.email))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setRequests(userRequests);
    setLoading(false);
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    fetchStatusHistory();
    const interval = setInterval(fetchStatusHistory, 5000); // 5 sec auto poll
    return () => clearInterval(interval);
  }, [user.id, user.email]);

  const handleCopy = (text: string) => {
    audioHaptics.playClick();
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const getPaymentTypeName = (type?: string) => {
    switch (type) {
      case 'PRO_MEMBERSHIP':
        return '👑 PRO VIP Membership Upgrade';
      case 'WHEEL_SPIN_FEE':
        return '🎡 Lucky Wheel Spin Fee Pass';
      case 'REDEMPTION_FEE':
        return '💸 Real Cash Payout Verification';
      default:
        return '📱 Merchant PhonePe Payment';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const declinedCount = requests.filter(r => r.status === 'declined').length;

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl mx-auto text-slate-100">
      
      {/* PROFILE HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            
            <div 
              onClick={onOpenAvatarModal}
              className="relative group cursor-pointer shrink-0"
              title="Click to change or capture profile photo"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 p-1 border-2 border-cyan-400 group-hover:border-purple-400 transition shadow-[0_0_25px_rgba(0,245,255,0.2)] overflow-hidden flex items-center justify-center">
                {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.includes('/')) ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl">{user.avatar || '🧠'}</span>
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-cyan-400 text-slate-950 font-black shadow-lg group-hover:scale-110 transition">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {user.rank || 'Scholar'}
                </span>
                {(user.isAdmin || user.email?.toLowerCase().trim() === 'jeevangowda345s@gmail.com') && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/60 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-amber-500/20">
                    <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> 👑 Master Admin (All Features 100% FREE)
                  </span>
                )}
                {user.isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> PRO 5X Member
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold uppercase">
                    Free Explorer
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.name || 'MindForge Scholar'}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {user.email || 'Guest Explorer'} • ID: <span className="text-slate-500">{user.id || 'local'}</span>
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Brain className="w-4 h-4" /> {user.brainScore} pts
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-purple-400">
                  <Zap className="w-4 h-4" /> LVL {user.level}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Coins className="w-4 h-4" /> {user.coins.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-col items-center gap-2.5 w-full sm:w-auto shrink-0">
            {!user.isPremium && onOpenPremium && (
              <button
                onClick={() => { audioHaptics.playClick(); onOpenPremium(); }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Upgrade PRO (₹99)</span>
              </button>
            )}

            {onOpenRedeemCash && (
              <button
                onClick={() => { audioHaptics.playClick(); onOpenRedeemCash(); }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <IndianRupee className="w-4 h-4 text-slate-950" />
                <span>Redeem Cash (₹)</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* TRANSACTION STATUS TRACKER SECTION */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-black text-white">Transaction Status & UTR Verification</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track real-time admin approval status for your PhonePe payments (PRO Membership, Lucky Wheel, Cash Redemptions).
            </p>
          </div>

          <button
            onClick={fetchStatusHistory}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase transition flex items-center gap-2 border border-slate-700 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Live Refresh'}</span>
          </button>
        </div>

        {/* Stats Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400 animate-pulse" /> Pending
            </div>
            <div className="text-xl font-black text-amber-300 font-mono">{pendingCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
            </div>
            <div className="text-xl font-black text-emerald-300 font-mono">{approvedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" /> Declined
            </div>
            <div className="text-xl font-black text-rose-300 font-mono">{declinedCount}</div>
          </div>
        </div>

        {/* Real-time Admin Notice */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-cyan-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" /> Master Admin Verification Authority:
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All submitted 12-digit UTR payment references are directly reviewed by Master Admin (<strong className="text-amber-300">jeevangowda345s@gmail.com</strong>). Verification updates sync automatically in real-time.
          </p>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <div>Fetching live transaction records...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-3">
            <QrCode className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-sm font-bold text-slate-300">No Payment Requests Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you pay via PhonePe for PRO Membership or Wheel Spins and submit your UTR, your live transaction verification status will appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isDeclined = req.status === 'declined';

              return (
                <div 
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    isPending 
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                      : isApproved 
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                      : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                  }`}
                >
                  {/* Top Row: Type & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{getPaymentTypeName(req.paymentType)}</span>
                        <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          ₹{req.amountINR}.00
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Submitted: {new Date(req.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPending && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Payment Processing (Pending Verification)</span>
                        </div>
                      )}

                      {isApproved && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approved & Verified by Admin</span>
                        </div>
                      )}

                      {isDeclined && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Invalid UTR (Payment Declined)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: UTR & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans font-medium">12-Digit UTR Ref:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300">{req.utrNumber}</span>
                        <button
                          onClick={() => handleCopy(req.utrNumber)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Copy UTR"
                        >
                          {copiedUtr === req.utrNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans font-medium">Verifying Admin:</span>
                      <span className="font-bold text-slate-200">jeevangowda345s@gmail.com</span>
                    </div>
                  </div>

                  {/* Bottom Row: Explanatory Note */}
                  {isPending && (
                    <div className="text-[11px] text-amber-200/90 leading-relaxed bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20">
                      ⏳ Your payment request is in queue. Master Admin is cross-referencing your UTR with the merchant PhonePe account statement. Once approved, your feature/spin will automatically activate!
                    </div>
                  )}

                  {isApproved && (
                    <div className="text-[11px] text-emerald-200/90 leading-relaxed bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                      ✅ Payment verified! Your UTR matched the deposit record. Thank you for supporting MindForge Brainverse!
                    </div>
                  )}

                  {isDeclined && (
                    <div className="text-[11px] text-rose-200/90 leading-relaxed bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20 space-y-1">
                      <div className="font-bold text-rose-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Declined Note from Admin:</span>
                      </div>
                      <div className="font-mono bg-slate-950 p-2 rounded border border-rose-500/30 text-rose-200">
                        {req.declineReason || 'Invalid UTR reference number. Transaction not verified in merchant bank statement.'}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
