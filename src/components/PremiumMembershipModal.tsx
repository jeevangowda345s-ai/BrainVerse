import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Coins, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  ArrowRight, 
  IndianRupee,
  Star,
  Award,
  RotateCw,
  Gift,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { UserProfile, ProUpgradeRequest } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig, saveUserProfile, loadProUpgradeRequests, saveProUpgradeRequest, maskUpiId } from '../utils/storage';
import { saveUserProfileToFirestore, submitProUpgradeRequestToFirestore } from '../services/firebaseService';

interface PremiumMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const PremiumMembershipModal: React.FC<PremiumMembershipModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [revealUpi, setRevealUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [submittedUtr, setSubmittedUtr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const local = loadProUpgradeRequests();
      const pending = local.find(
        r => (r.userId === user.id || r.userEmail === user.email) && r.status === 'pending' && r.paymentType === 'PRO_MEMBERSHIP'
      );
      if (pending) {
        setIsSubmittedPending(true);
        setSubmittedUtr(pending.utrNumber);
      }
    }
  }, [isOpen, user.id, user.email]);

  const isMasterAdmin = Boolean(user.isAdmin || (user.email && user.email.toLowerCase().trim() === 'jeevangowda345s@gmail.com'));
  const qrConfig = loadQRMerchantConfig();
  const merchantUpi = qrConfig.upiId || 'jeevanms@ybl';
  const merchantName = qrConfig.merchantName || 'Jeevan M S';
  const MEMBERSHIP_FEE_INR = isMasterAdmin ? 0 : (qrConfig.premiumFeeINR || 99);
  const upiPayString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${MEMBERSHIP_FEE_INR}.00&cu=INR&tn=${encodeURIComponent(`BrainVerse PRO Membership ${MEMBERSHIP_FEE_INR} INR`)}`;

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpi(true);
    audioHaptics.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(MEMBERSHIP_FEE_INR.toString());
    setCopiedAmount(true);
    audioHaptics.playClick();
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSubmitUTRForAdminApproval = () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit PhonePe / Gateway Transaction Ref (UTR) number.');
      audioHaptics.triggerHaptic('error');
      return;
    }

    if (cleanUtr.length < 8) {
      setUtrError('Please enter a valid 12-digit UTR reference number.');
      audioHaptics.triggerHaptic('error');
      return;
    }

    setIsVerifying(true);
    setUtrError(null);
    audioHaptics.playClick();

    setTimeout(() => {
      setIsVerifying(false);
      
      // Submit UTR Upgrade Record to Admin Panel with 'pending' status
      const reqId = 'pro_req_' + Date.now();
      const proReq: ProUpgradeRequest = {
        id: reqId,
        userId: user.id || 'guest',
        userName: user.name || 'MindForge Scholar',
        userEmail: user.email || 'user@brainverse.app',
        utrNumber: cleanUtr,
        amountINR: MEMBERSHIP_FEE_INR,
        status: 'pending',
        timestamp: new Date().toISOString(),
        paymentType: 'PRO_MEMBERSHIP',
      };
      saveProUpgradeRequest(proReq);
      submitProUpgradeRequestToFirestore(proReq).catch(e => console.warn(e));

      setSubmittedUtr(cleanUtr);
      setIsSubmittedPending(true);
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#08080C] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
            <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>VIP PRO Membership</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">
            Unlock 5X Power & VIP Perks
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isMasterAdmin ? (
              <span className="text-amber-300 font-bold">👑 Master Admin Pass Active: PRO VIP & 5X Multipliers are 100% FREE for jeevangowda345s@gmail.com!</span>
            ) : (
              <>Upgrade to MindForge PRO for just <span className="text-emerald-400 font-bold font-mono">₹{MEMBERSHIP_FEE_INR} INR</span> and enjoy <span className="text-amber-400 font-black">5X Multiplier</span> on all earned Coins, Diamonds, & Brain Experience!</>
            )}
          </p>
        </div>

        {/* PRO Perks 5X Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          
          {/* 5X Coins */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-start gap-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 font-black text-lg">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">5X Brain Coins Multiplier</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">5X</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Earn 5 times more coins from every game victory, daily mission, and streak milestone!
              </p>
            </div>
          </div>

          {/* 5X Diamonds */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-pink-500/30 flex items-start gap-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center shrink-0 font-black text-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">5X Diamonds Drop</span>
                <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold">5X</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Receive 5x diamond rewards across achievements, daily events, and special games.
              </p>
            </div>
          </div>

          {/* 5X Brain Score & XP */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-start gap-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 font-black text-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">5X Brain XP & Score</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">5X</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Level up 5 times faster with 5x brain experience gained per training session!
              </p>
            </div>
          </div>

          {/* Unlimited Daily Lucky Wheel Spins */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-start gap-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 font-black text-lg">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Unlimited Free Spins</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">FREE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Zero spin fee and zero daily lock on the Daily Lucky Wheel for PRO members.
              </p>
            </div>
          </div>

        </div>

        {/* Pricing & PhonePe Scanner Section */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membership Pricing</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono">₹{MEMBERSHIP_FEE_INR} INR</span>
                <span className="text-xs text-slate-400 font-medium">/ Lifetime Unlimited Access</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                ✓ No Monthly Subscription
              </span>
            </div>
          </div>

          {/* Spotify Premium Style Checkout Pass Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Spotify Green Accent Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Plan Info */}
              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spotify-Style Direct Premium Checkout</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">BrainVerse PRO 1-Month Pass</h3>
                <p className="text-xs text-slate-300">
                  Instant VIP unlocks with 5x Coin Multiplier, Unlimited Wheel Spins & Priority 24/7 Redemptions.
                </p>
                <div className="text-2xl font-black text-emerald-400 font-mono pt-1">
                  ₹{MEMBERSHIP_FEE_INR}.00 <span className="text-xs text-slate-400 font-normal">/ month</span>
                </div>
              </div>

              {/* Direct Checkout Action Box */}
              <div className="w-full md:w-auto text-center space-y-2 shrink-0">
                <a
                  href={qrConfig.paymentLink || upiPayString}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audioHaptics.playClick()}
                  className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group"
                >
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                  <span>Pay via Checkout Link</span>
                  <ExternalLink className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <div className="text-[10px] text-slate-400 font-medium">
                  Secure NPCI SSL Encrypted Checkout Link
                </div>
              </div>
            </div>

            {/* Plan Perks Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 relative z-10">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                <div className="text-emerald-400 font-black text-xs">5x Coins</div>
                <div className="text-[10px] text-slate-400">On every quiz answer</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                <div className="text-amber-400 font-black text-xs">Free Spins</div>
                <div className="text-[10px] text-slate-400">Zero entry fees for wheel</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                <div className="text-cyan-400 font-black text-xs">Instant Cashout</div>
                <div className="text-[10px] text-slate-400">Priority admin verification</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                <div className="text-purple-400 font-black text-xs">VIP Badge</div>
                <div className="text-[10px] text-slate-400">Leaderboard highlight</div>
              </div>
            </div>
          </div>

          {/* UTR Reference Input & Verification */}
          {user.isPremium ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>VIP PRO Account Active (5X Multiplier Granted)</span>
            </div>
          ) : isSubmittedPending ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/40 text-center space-y-3 shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  UTR Reference Submitted to Admin
                </div>
                <h4 className="text-base font-black text-white">Payment Verification Pending</h4>
                <div className="text-xs font-mono text-amber-300 font-bold">
                  UTR Reference: {submittedUtr}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Your payment UTR of <span className="text-emerald-400 font-bold">₹{MEMBERSHIP_FEE_INR} INR</span> has been logged and sent to Master Admin (<span className="text-amber-300 font-mono font-bold">jeevangowda345s@gmail.com</span>).
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-medium leading-normal">
                🛡️ <strong className="text-slate-200">Payment Succeeded Guarantee:</strong> Your VIP PRO membership (5X Multiplier) will be activated immediately as soon as the Admin accepts your UTR payment in the Admin Console.
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300">
                Step 2: Enter 12-Digit Transaction Reference (UTR) from Payment
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 420918739182"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-400 tracking-wider"
                />
                <button
                  type="button"
                  onClick={handleSubmitUTRForAdminApproval}
                  disabled={isVerifying || utrNumber.length < 8}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  {isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Sending to Admin...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950 fill-slate-950" />
                      <span>Submit UTR for Admin Verification</span>
                    </>
                  )}
                </button>
              </div>

              {utrError && (
                <p className="text-xs text-rose-400 font-medium">{utrError}</p>
              )}

              <p className="text-[10px] text-slate-400 text-center font-medium">
                🔒 Requests are verified strictly by Master Admin (<span className="text-amber-300 font-mono font-bold">jeevangowda345s@gmail.com</span>) in the UTR Verification panel before granting PRO VIP.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
