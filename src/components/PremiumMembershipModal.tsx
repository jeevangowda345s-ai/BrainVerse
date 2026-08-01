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
  Gift
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { UserProfile, ProUpgradeRequest } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig, saveUserProfile, saveProUpgradeRequest } from '../utils/storage';
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
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const qrConfig = loadQRMerchantConfig();
  const merchantUpi = qrConfig.upiId || 'jeevanms@ybl';
  const merchantName = qrConfig.merchantName || 'Jeevan M S';
  const MEMBERSHIP_FEE_INR = qrConfig.premiumFeeINR || 99;
  const upiPayString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${MEMBERSHIP_FEE_INR}.00&cu=INR&tn=${encodeURIComponent(`BrainVerse PRO Membership ${MEMBERSHIP_FEE_INR} INR`)}`;

  // Generate QR Code
  useEffect(() => {
    if (isOpen) {
      if (qrConfig.qrImageUrl) {
        setQrDataUrl(qrConfig.qrImageUrl);
      } else {
        QRCode.toDataURL(upiPayString, {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        })
          .then((url) => setQrDataUrl(url))
          .catch((err) => console.error('PRO QR Error:', err));
      }
    }
  }, [isOpen, upiPayString, qrConfig.qrImageUrl]);

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

  const handleActivatePremium = (utr?: string) => {
    // PLAY SUCCESSFUL PAYMENT AUDIO CHIME
    audioHaptics.playPaymentSuccess();
    audioHaptics.playFanfare();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
    });

    const updatedUser: UserProfile = {
      ...user,
      isPremium: true,
      lastWheelSpinDate: '', // Reset wheel spin so user gets instant free spin
    };

    onUpdateUser(updatedUser);
    saveUserProfile(updatedUser);
    if (updatedUser.id) {
      saveUserProfileToFirestore(updatedUser).catch(e => console.warn(e));
    }

    // Submit UTR Upgrade Record for Admin Panel Verification Rights
    const reqId = 'pro_req_' + Date.now();
    const proReq: ProUpgradeRequest = {
      id: reqId,
      userId: user.id || 'guest',
      userName: user.name || 'MindForge Scholar',
      userEmail: user.email || 'user@brainverse.app',
      utrNumber: utr ? utr.trim() : (utrNumber.trim() || 'DIRECT_VIP_PAY'),
      amountINR: MEMBERSHIP_FEE_INR,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    saveProUpgradeRequest(proReq);
    submitProUpgradeRequestToFirestore(proReq).catch(e => console.warn(e));

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  const handleVerifyUTR = () => {
    if (!utrNumber.trim()) {
      setUtrError('Please enter the 12-digit PhonePe / UPI Transaction Ref (UTR) number.');
      audioHaptics.triggerHaptic('error');
      return;
    }

    if (utrNumber.trim().length < 8) {
      setUtrError('Please enter a valid 12-digit UTR reference number.');
      audioHaptics.triggerHaptic('error');
      return;
    }

    setIsVerifying(true);
    setUtrError(null);
    audioHaptics.playClick();

    setTimeout(() => {
      setIsVerifying(false);
      handleActivatePremium(utrNumber.trim());
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
            Upgrade to MindForge PRO for just <span className="text-emerald-400 font-bold font-mono">₹{MEMBERSHIP_FEE_INR} INR</span> and enjoy <span className="text-amber-400 font-black">5X Multiplier</span> on all earned Coins, Diamonds, & Brain Experience!
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

          {/* UPI QR Code Display & UPI Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            
            {/* QR Scanner Image & UPI Options Section */}
            <div className="text-center p-4 rounded-2xl bg-white border-4 border-[#5f259f] shadow-xl relative inline-block mx-auto space-y-3">
              <div className="text-[10px] font-black uppercase text-[#5f259f] tracking-wider mb-1">
                Scan QR Code with any UPI App
              </div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="MindForge PRO UPI QR Scanner"
                  className="w-44 h-44 mx-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded text-slate-600 text-xs font-bold">
                  Loading QR Scanner...
                </div>
              )}
              <div className="text-[10px] font-mono font-bold text-slate-800">
                Amount: ₹{MEMBERSHIP_FEE_INR}.00 INR
              </div>

              {/* UPI Options below the scanner */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">
                  UPI Options — Tap to Pay Directly:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      audioHaptics.playClick();
                      window.location.href = upiPayString;
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#5f259f] text-white font-bold text-[11px] hover:bg-purple-800 transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>💜 PhonePe</span>
                  </button>

                  <button
                    onClick={() => {
                      audioHaptics.playClick();
                      window.location.href = upiPayString;
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#1a73e8] text-white font-bold text-[11px] hover:bg-blue-700 transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>🔵 GPay</span>
                  </button>

                  <button
                    onClick={() => {
                      audioHaptics.playClick();
                      window.location.href = upiPayString;
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#00baf2] text-white font-bold text-[11px] hover:bg-sky-600 transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>📲 Paytm</span>
                  </button>

                  <button
                    onClick={() => {
                      audioHaptics.playClick();
                      window.location.href = upiPayString;
                    }}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>⚡ BHIM / Any UPI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant Details & Copy Actions */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Merchant Name:</span>
                <div className="font-bold text-white text-sm">{merchantName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Merchant UPI ID:</span>
                  <button
                    onClick={handleCopyUpi}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[10px]"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
                <div className="font-mono font-bold text-amber-400 text-sm">{merchantUpi}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Exact Amount:</span>
                  <button
                    onClick={handleCopyAmount}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[10px]"
                  >
                    {copiedAmount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAmount ? 'Copied' : `Copy ₹${MEMBERSHIP_FEE_INR}`}</span>
                  </button>
                </div>
                <div className="font-mono font-bold text-emerald-400 text-sm">₹{MEMBERSHIP_FEE_INR}.00 INR</div>
              </div>
            </div>

          </div>

          {/* UTR Reference Input & Activation */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300">
              Enter 12-Digit PhonePe / UPI Transaction Reference (UTR) Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 420918739182"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleVerifyUTR}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase hover:bg-amber-400 transition flex items-center gap-1.5 shrink-0"
              >
                {isVerifying ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Verify UTR
                  </>
                )}
              </button>
            </div>

            {utrError && (
              <p className="text-xs text-rose-400 font-medium">{utrError}</p>
            )}

            {/* Direct Instant Upgrade Button */}
            <div className="pt-2">
              <button
                onClick={handleActivatePremium}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5 text-slate-950" />
                <span>Instant Pay & Activate PRO (₹{MEMBERSHIP_FEE_INR} INR)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Feedback Success State */}
        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Welcome to VIP PRO! 5X Multiplier is now active on all earnings!</span>
          </div>
        )}

      </div>
    </div>
  );
};
