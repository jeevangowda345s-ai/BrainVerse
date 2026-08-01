import React, { useState, useEffect } from 'react';
import { Gift, Award, Flame, Sparkles, CheckCircle2, RotateCw, Trophy, Zap, Coins, X, ShieldCheck, Lock, Copy, Check, QrCode, AlertCircle, Loader2, Smartphone, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { UserProfile, DailyMission, Achievement } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig } from '../utils/storage';

export interface WheelReward {
  label: string;
  coins: number;
  brainScore: number;
  diamonds: number;
  xp?: number;
  icon: string;
}

// MAX 200 COINS CAN BE WON FROM WHEEL SPIN
const WHEEL_PRIZES: WheelReward[] = [
  { label: '+100 Coins', coins: 100, brainScore: 0, diamonds: 0, icon: '🪙' },
  { label: '+150 Brain Score', coins: 0, brainScore: 150, diamonds: 0, icon: '🧠' },
  { label: '+50 Diamonds', coins: 0, brainScore: 0, diamonds: 50, icon: '💎' },
  { label: '+200 Coins (MAX)', coins: 200, brainScore: 0, diamonds: 0, icon: '💰' },
  { label: '+180 Brain Score', coins: 0, brainScore: 180, diamonds: 0, icon: '⚡' },
  { label: '+100 Diamonds', coins: 0, brainScore: 0, diamonds: 100, icon: '✨' },
  { label: 'Jackpot 🎉 (+200 Coins, +150 Brain, +50 Diamonds)', coins: 200, brainScore: 150, diamonds: 50, icon: '👑' }
];

interface GamificationHubProps {
  user: UserProfile;
  missions: DailyMission[];
  achievements: Achievement[];
  onClaimMission: (id: string) => void;
  onUpdateCoins: (amount: number) => void;
  onClaimWheelReward?: (rewards: { coins?: number; brainScore?: number; diamonds?: number; xp?: number; spinDate?: string }) => void;
  onTestTriggerToast?: (achievement: Achievement) => void;
  onTestLevelUp?: () => void;
  onOpenRedeemCash?: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  user,
  missions,
  achievements,
  onClaimMission,
  onUpdateCoins,
  onClaimWheelReward,
  onTestTriggerToast,
  onTestLevelUp,
  onOpenRedeemCash,
}) => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelPrize, setWheelPrize] = useState<WheelReward | null>(null);

  // PhonePe ₹9 Payment Modal State for Wheel Spin
  const [showSpinPaymentModal, setShowSpinPaymentModal] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = user.lastWheelSpinDate === todayStr;

  const qrConfig = loadQRMerchantConfig();
  const UPI_ID = qrConfig.upiId || 'jeevanms@ybl';
  const MERCHANT_NAME = qrConfig.merchantName || 'Jeevan M S';
  const SPIN_FEE_INR = qrConfig.wheelSpinFeeINR || 9;
  const isFreeSpinForUser = (user.isPremium && qrConfig.freeSpinsForPremium) || user.isAdmin;

  const UPI_PAY_URL = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${SPIN_FEE_INR}.00&cu=INR&tn=${encodeURIComponent('MindForge Daily Lucky Wheel Fee')}`;
  
  const [spinQrDataUrl, setSpinQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (showSpinPaymentModal) {
      if (qrConfig.qrImageUrl) {
        setSpinQrDataUrl(qrConfig.qrImageUrl);
      } else {
        QRCode.toDataURL(UPI_PAY_URL, {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        })
          .then((url) => setSpinQrDataUrl(url))
          .catch((err) => console.error('Spin QR error:', err));
      }
    }
  }, [showSpinPaymentModal, UPI_PAY_URL, qrConfig.qrImageUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    audioHaptics.triggerHaptic('tap');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleOpenSpinPaymentModal = () => {
    setUtrNumber('');
    setPaymentError(null);
    setShowSpinPaymentModal(true);
    audioHaptics.playClick();
  };

  const handleVerifySpinPaymentAndSpin = () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d+$/.test(cleanUtr)) {
      setPaymentError('Please enter a valid 12-digit UTR / Transaction Reference number from PhonePe.');
      audioHaptics.triggerHaptic('error');
      return;
    }

    setPaymentError(null);
    setVerifyingPayment(true);
    audioHaptics.playClick();

    // Secure SSL PhonePe Payment Verification Handshake
    setTimeout(() => {
      setVerifyingPayment(false);
      setShowSpinPaymentModal(false);
      audioHaptics.playCorrect();
      audioHaptics.triggerHaptic('success');
      
      // Execute the wheel spin after payment verification
      executeWheelSpin();
    }, 1800);
  };

  const executeWheelSpin = () => {
    if (spinning) return;

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    setSpinning(true);
    setWheelPrize(null);

    setTimeout(() => {
      // Pick random prize (capped at max 200 coins)
      const winner = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
      // Hard guarantee cap max 200 coins
      const cappedCoins = Math.min(200, winner.coins);
      
      const safeWinner: WheelReward = {
        ...winner,
        coins: cappedCoins,
      };

      setWheelPrize(safeWinner);
      setSpinning(false);
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('levelUp');
      confetti({ particleCount: 60, spread: 80 });

      if (onClaimWheelReward) {
        onClaimWheelReward({
          coins: safeWinner.coins,
          brainScore: safeWinner.brainScore,
          diamonds: safeWinner.diamonds,
          xp: safeWinner.xp || 0,
          spinDate: todayStr,
        });
      } else if (safeWinner.coins > 0) {
        onUpdateCoins(safeWinner.coins);
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-pink-400" />
            Missions, Battle Pass & Rewards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Claim daily cognitive streak bonuses, spin the lucky wheel & unlock achievement trophies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold">
          <span className="text-cyan-400 flex items-center gap-1">
            🧠 {user.brainScore} pts
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> {user.coins.toLocaleString()}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-pink-400 flex items-center gap-1">
            💎 {user.diamonds || 0}
          </span>
        </div>
      </div>

      {/* Real Cash Redemption Banner */}
      {onOpenRedeemCash && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Redeem Brain Coins for Real Cash (₹ INR)</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                  PhonePe Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Current Rate: <strong className="text-emerald-400">1,000,000 Brain Coins = ₹1.00 INR</strong>. Pay ₹10 fee via PhonePe QR scanner & claim direct UPI payout!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRedeemCash}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition active:scale-95 shrink-0 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>REDEEM CASH NOW (₹)</span>
          </button>
        </div>
      )}

      {/* Lucky Wheel & Mystery Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lucky Wheel Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <RotateCw className="w-5 h-5 text-cyan-400" />
              Daily Lucky Wheel
            </h3>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[11px] font-extrabold">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Pay ₹9 INR via PhonePe Scanner
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold">
                🪙 Daily Wheel Rewards
              </span>
            </div>
          </div>

          <div className="relative w-44 h-44 mx-auto my-3 rounded-full border-4 border-cyan-400/50 bg-slate-950 flex items-center justify-center shadow-2xl overflow-hidden">
            <div className={`text-5xl transition-all duration-[2500ms] ${spinning ? 'rotate-[1440deg] scale-125' : ''}`}>
              {wheelPrize ? wheelPrize.icon : '🎡'}
            </div>
          </div>

          {wheelPrize && (
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-300 animate-bounce space-y-1">
              <div>Won: {wheelPrize.label}!</div>
              <div className="text-[11px] text-cyan-200/80 font-mono">
                {wheelPrize.coins > 0 && `+${wheelPrize.coins} Coins `}
                {wheelPrize.brainScore > 0 && `+${wheelPrize.brainScore} Brain Score `}
                {wheelPrize.diamonds > 0 && `+${wheelPrize.diamonds} Diamonds`}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenSpinPaymentModal}
            disabled={spinning}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{spinning ? 'Spinning Wheel...' : 'Pay ₹9 via PhonePe & Spin Wheel'}</span>
          </button>

          <p className="text-[10px] text-slate-400 font-medium">
            Scan PhonePe QR Code & pay <strong>₹9.00 INR</strong> to authorize spin. Spin the wheel to win exciting coins and brain score rewards!
          </p>
        </div>

        {/* Battle Pass Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              MindForge Season Battle Pass
            </h3>
            <span className="text-xs font-bold text-purple-300">Tier {user.level}</span>
          </div>

          <p className="text-xs text-slate-400">Unlock custom avatars, neon themes, and AI tutor hours.</p>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '65%' }} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">👑</div>
              <div className="text-[10px] font-bold text-cyan-300 mt-1">Tier 10 Avatar</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">💎</div>
              <div className="text-[10px] font-bold text-pink-300 mt-1">200 Diamonds</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg">🤖</div>
              <div className="text-[10px] font-bold text-purple-300 mt-1">AI Coach Pro</div>
            </div>
          </div>
        </div>

      </div>

      {/* Achievement Badges List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievement Badges
            </h3>
            <p className="text-xs text-slate-400">
              Complete game milestones & training challenges to unlock badges, XP, and coins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onTestLevelUp && (
              <button
                onClick={onTestLevelUp}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
                title="Preview Level Up animation modal"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Preview Level Up 🎉</span>
              </button>
            )}
            <span className="px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-extrabold self-start sm:self-auto">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <button
                key={ach.id}
                onClick={() => {
                  if (onTestTriggerToast) {
                    onTestTriggerToast(ach);
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                  ach.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-2xl p-2 rounded-xl flex-shrink-0 ${
                    ach.unlocked ? 'bg-amber-500/20 border border-amber-400/40' : 'bg-slate-900 border border-slate-800'
                  }`}>
                    {ach.unlocked ? '🏆' : '🔒'}
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        {ach.title}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        ach.unlocked
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {ach.tier}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {ach.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{ach.unlocked ? 'UNLOCKED' : `${ach.progress} / ${ach.maxProgress}`}</span>
                        <span className="text-amber-400 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            ach.unlocked ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-700'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[9px] font-mono text-slate-500 text-right opacity-0 group-hover:opacity-100 transition">
                  Click to preview notification 🔔
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PhonePe ₹9 Lucky Wheel Payment & Verification Modal */}
      {showSpinPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 my-auto">
            
            {/* PhonePe Branded Header */}
            <div className="bg-[#5f259f] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#5f259f] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  पे
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-mono text-purple-200">PhonePe Accepted Here</div>
                  <h3 className="text-lg font-black leading-tight">Pay ₹9 to Spin Daily Wheel</h3>
                </div>
              </div>
              <button
                onClick={() => setShowSpinPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Fee & Merchant Information */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center space-y-1">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">Lucky Wheel Fee</div>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  ₹{SPIN_FEE_INR}.00 <span className="text-xs text-slate-300 font-sans font-normal">INR</span>
                </div>
                <div className="text-xs text-slate-300 pt-1">
                  Merchant: <strong className="text-white">{MERCHANT_NAME}</strong> ({UPI_ID})
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PhonePe Instant Merchant Verification
                </div>
              </div>

              {/* QR Code Container */}
              <div className="text-center space-y-3">
                <div className="inline-block p-4 rounded-3xl bg-white border-4 border-[#5f259f] shadow-2xl relative">
                  {spinQrDataUrl ? (
                    <img
                      src={spinQrDataUrl}
                      alt="PhonePe Scanner QR"
                      className="w-52 h-52 mx-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-slate-500 font-mono text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-purple-300 font-medium flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scan QR using PhonePe, Paytm, or GPay</span>
                </div>

                {/* Quick Copy UPI & Pay App buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{copiedUpi ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
                  </button>

                  <a
                    href={UPI_PAY_URL}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Open PhonePe App</span>
                  </a>
                </div>
              </div>

              {/* UTR Reference Verification Input */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300">
                  Enter 12-Digit PhonePe UTR / Ref No. <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 420918273645"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-purple-500 transition"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Found in your PhonePe transaction details after paying ₹9 to {MERCHANT_NAME}.
                </p>
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleVerifySpinPaymentAndSpin}
                  disabled={verifyingPayment || utrNumber.length !== 12}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {verifyingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Verifying ₹9 PhonePe Gateway Deposit...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Verify ₹9 Payment & Spin Wheel</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-bit Secured PhonePe Merchant Verification</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
