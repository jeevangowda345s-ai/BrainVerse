import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Bot, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  GitCommit, 
  Gamepad2, 
  Save, 
  Zap, 
  ShieldCheck, 
  QrCode,
  Upload,
  Coins,
  Users,
  Crown,
  Gift,
  RotateCw,
  Check,
  AlertCircle,
  IndianRupee,
  Key,
  Unlock,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { UserProfile, QRMerchantConfig, RedemptionRecord, ProUpgradeRequest } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { loadQRMerchantConfig, saveQRMerchantConfig, saveUserProfile, loadProUpgradeRequests, saveProUpgradeRequest, DEFAULT_QR_CONFIG } from '../utils/storage';
import { saveUserProfileToFirestore, fetchProUpgradeRequestsFromFirestore, updateProUpgradeRequestInFirestore } from '../services/firebaseService';

interface AdminPanelProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateCoins?: (amount: number) => void;
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  user, 
  onUpdateUser,
  onUpdateCoins,
  onClose 
}) => {
  const MASTER_ADMIN_EMAIL = 'jeevangowda345s@gmail.com';
  
  // Check if current logged in user has Admin privileges (STRICTLY jeevangowda345s@gmail.com)
  const isMasterAdminEmail = Boolean(user.email && user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(isMasterAdminEmail);
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [keyError, setKeyError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'qr_upload' | 'users' | 'redemptions' | 'utr_approvals' | 'version'>('utr_approvals');

  // UTR & PRO Verification Management State
  const [proRequests, setProRequests] = useState<ProUpgradeRequest[]>([]);
  const [proReqFilter, setProReqFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [proActionMsg, setProActionMsg] = useState<string | null>(null);

  // Load all PRO upgrade requests from LocalStorage & Firestore
  const loadAllProRequests = async () => {
    const local = loadProUpgradeRequests();
    let remote: ProUpgradeRequest[] = [];
    try {
      remote = await fetchProUpgradeRequestsFromFirestore();
    } catch (e) {}

    const map = new Map<string, ProUpgradeRequest>();
    remote.forEach(r => map.set(r.id, r));
    local.forEach(r => {
      if (!map.has(r.id)) map.set(r.id, r);
    });

    setProRequests(Array.from(map.values()));
  };

  useEffect(() => {
    loadAllProRequests();
  }, []);

  // Accept / Approve User PRO Membership
  const handleApproveProRequest = async (req: ProUpgradeRequest) => {
    // Play Payment Successful Sound Effect Chime!
    audioHaptics.playPaymentSuccess();
    audioHaptics.playFanfare();

    const updatedReq: ProUpgradeRequest = { ...req, status: 'approved' };
    saveProUpgradeRequest(updatedReq);

    await updateProUpgradeRequestInFirestore(req.id, req.userId, 'approved');

    // If current user is target user, upgrade active session as well
    if (req.userId === user.id || user.email === req.userEmail) {
      const updatedUser = { ...user, isPremium: true };
      if (onUpdateUser) onUpdateUser(updatedUser);
      saveUserProfile(updatedUser);
      setEditingIsPremium(true);
    }

    setProActionMsg(`APPROVED! User "${req.userName}" is now a VIP PRO Member.`);
    setTimeout(() => setProActionMsg(null), 3500);
    loadAllProRequests();
  };

  // Decline / Reject User PRO Request
  const handleDeclineProRequest = async (req: ProUpgradeRequest) => {
    audioHaptics.triggerHaptic('error');
    const reason = prompt('Enter decline reason for user:', 'Transaction UTR reference not verified in merchant bank statement.') || 'UTR Ref not found';

    const updatedReq: ProUpgradeRequest = { ...req, status: 'declined', declineReason: reason };
    saveProUpgradeRequest(updatedReq);

    await updateProUpgradeRequestInFirestore(req.id, req.userId, 'declined', reason);

    setProActionMsg(`DECLINED request for ${req.userName}. Reason: ${reason}`);
    setTimeout(() => setProActionMsg(null), 3500);
    loadAllProRequests();
  };

  // QR Merchant Config State
  const [qrConfig, setQrConfig] = useState<QRMerchantConfig>(loadQRMerchantConfig());
  const [qrSaveMsg, setQrSaveMsg] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // User Account Maintenance State
  const [editingCoins, setEditingCoins] = useState<number>(user.coins || 0);
  const [editingBrainScore, setEditingBrainScore] = useState<number>(user.brainScore || 0);
  const [editingDiamonds, setEditingDiamonds] = useState<number>(user.diamonds || 0);
  const [editingLevel, setEditingLevel] = useState<number>(user.level || 1);
  const [editingIsPremium, setEditingIsPremium] = useState<boolean>(user.isPremium || false);
  const [userSaveMsg, setUserSaveMsg] = useState<boolean>(false);

  // Redemption History Management
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(user.redemptionHistory || []);

  // Version Control State
  const [appVersion, setAppVersion] = useState<string>('v3.6.0-PRO');
  const [releaseNotes, setReleaseNotes] = useState<string>('Added 2-Player Race Mode, PhonePe QR Scanner Upload, & Admin Maintenance Console.');
  const [versionSaved, setVersionSaved] = useState<boolean>(false);
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [aiTemp, setAiTemp] = useState<number>(0.7);

  // Sync state if user changes
  useEffect(() => {
    setEditingCoins(user.coins || 0);
    setEditingBrainScore(user.brainScore || 0);
    setEditingDiamonds(user.diamonds || 0);
    setEditingLevel(user.level || 1);
    setEditingIsPremium(user.isPremium || false);
    setRedemptions(user.redemptionHistory || []);
    if (user.isAdmin || isMasterAdminEmail) {
      setIsAdminUnlocked(true);
    }
  }, [user, isMasterAdminEmail]);

  // Unlock Admin Access strictly via master email authentication
  const handleUnlockAdmin = () => {
    if (isMasterAdminEmail) {
      audioHaptics.playFanfare();
      audioHaptics.triggerHaptic('success');
      setIsAdminUnlocked(true);
      setKeyError(null);
    } else {
      audioHaptics.triggerHaptic('error');
      setKeyError(`Access Denied. Admin Console rights are strictly restricted to master developer account: ${MASTER_ADMIN_EMAIL}.`);
    }
  };

  // Upload Custom QR Code Image (File to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setQrConfig(prev => ({ ...prev, qrImageUrl: dataUrl }));
      setUploadError(null);
      audioHaptics.playClick();
      audioHaptics.triggerHaptic('success');
    };
    reader.readAsDataURL(file);
  };

  // Save QR Merchant Config
  const handleSaveQRConfig = () => {
    saveQRMerchantConfig(qrConfig);
    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('heavy');
    setQrSaveMsg(true);
    setTimeout(() => setQrSaveMsg(false), 3000);
  };

  // Reset QR Config to default
  const handleResetQRConfig = () => {
    audioHaptics.playClick();
    setQrConfig(DEFAULT_QR_CONFIG);
    saveQRMerchantConfig(DEFAULT_QR_CONFIG);
  };

  // Save User Balance & Account Updates
  const handleSaveUserAccount = () => {
    const updatedUser: UserProfile = {
      ...user,
      coins: editingCoins,
      brainScore: editingBrainScore,
      diamonds: editingDiamonds,
      level: editingLevel,
      isPremium: editingIsPremium,
      isAdmin: true,
    };

    if (onUpdateUser) onUpdateUser(updatedUser);
    saveUserProfile(updatedUser);
    saveUserProfileToFirestore(updatedUser).catch(e => console.warn(e));

    audioHaptics.playFanfare();
    audioHaptics.triggerHaptic('levelUp');
    setUserSaveMsg(true);
    setTimeout(() => setUserSaveMsg(false), 3000);
  };

  const handleResetWheelSpinLock = () => {
    const updatedUser: UserProfile = {
      ...user,
      lastWheelSpinDate: '',
    };
    if (onUpdateUser) onUpdateUser(updatedUser);
    saveUserProfile(updatedUser);
    saveUserProfileToFirestore(updatedUser).catch(e => console.warn(e));

    audioHaptics.playFanfare();
    alert('Daily Wheel Spin lock cleared! Daily spin re-enabled.');
  };

  // Redemption Status Update
  const handleUpdateRedemptionStatus = (recordId: string, newStatus: RedemptionRecord['status']) => {
    audioHaptics.playClick();
    const updatedHistory = redemptions.map(rec => 
      rec.id === recordId ? { ...rec, status: newStatus } : rec
    );
    setRedemptions(updatedHistory);

    const updatedUser = { ...user, redemptionHistory: updatedHistory };
    if (onUpdateUser) onUpdateUser(updatedUser);
    saveUserProfile(updatedUser);
    saveUserProfileToFirestore(updatedUser).catch(e => console.warn(e));
  };

  // Version Save & Broadcast
  const handleSaveVersion = () => {
    audioHaptics.playFanfare();
    setVersionSaved(true);
    setTimeout(() => setVersionSaved(false), 3000);
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    audioHaptics.playClick();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 2500);
  };

  // LOCKED VIEW IF NOT ADMIN
  if (!isAdminUnlocked) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-6 max-w-xl mx-auto my-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Admin Portal Access
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Full authority over user accounts, PhonePe QR scanner upload, coin distribution, and premium perks management.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
          <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" /> Admin Rights Restricted
          </div>

          <p className="text-xs text-slate-300">
            Admin console access is strictly restricted to master developer account:
          </p>
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 font-mono text-xs font-bold text-amber-300 inline-block">
            {MASTER_ADMIN_EMAIL}
          </div>

          {user.email ? (
            <p className="text-[11px] text-slate-400 pt-1">
              Currently signed in as: <span className="text-slate-200 font-semibold">{user.email}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 pt-1">
              Please sign in with <span className="text-amber-300 font-semibold">{MASTER_ADMIN_EMAIL}</span> to access admin rights.
            </p>
          )}

          {keyError && (
            <p className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1 pt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {keyError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // UNLOCKED MASTER ADMIN CONSOLE
  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-amber-400">
                BrainVerse Admin Control Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                Active Admin
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Account Maintenance • QR Scanner Upload • Free Coins & Spins • Cash Redemptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-bold text-white">{user.name}</div>
            <div className="text-[10px] text-amber-400 font-mono">{user.email || MASTER_ADMIN_EMAIL}</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 scrollbar-none">
        <button
          onClick={() => { setActiveAdminTab('utr_approvals'); loadAllProRequests(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'utr_approvals'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>UTR Checks & PRO Approvals</span>
          {proRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {proRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('qr_upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'qr_upload'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-300" />
          <span>Upload PhonePe QR Scanner</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-300" />
          <span>User Accounts Status</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('redemptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'redemptions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-emerald-400" />
          <span>Cash Redemption Requests</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('version')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'version'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-4 h-4 text-purple-400" />
          <span>System & Broadcast</span>
        </button>
      </div>

      {/* TAB 0: UTR CHECKS & PRO MEMBERSHIP APPROVALS */}
      {activeAdminTab === 'utr_approvals' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                UTR Verification Rights & PRO User Approvals
              </h2>
              <p className="text-xs text-slate-400">
                Check submitted 12-digit UTR numbers against your UPI statement and click Accept to activate 5X PRO Membership or Decline to reject.
              </p>
            </div>

            <button
              onClick={loadAllProRequests}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-200 font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh UTR List</span>
            </button>
          </div>

          {proActionMsg && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{proActionMsg}</span>
            </div>
          )}

          {/* Request Status Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'approved', 'declined'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setProReqFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  proReqFilter === filter
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {filter} {filter === 'pending' && `(${proRequests.filter(r => r.status === 'pending').length})`}
              </button>
            ))}
          </div>

          {/* List of UTR Requests */}
          <div className="space-y-3">
            {(() => {
              const filtered = proRequests.filter(r => proReqFilter === 'all' || r.status === proReqFilter);
              if (filtered.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 text-amber-500/40 mx-auto" />
                    <p className="text-xs font-bold">No UTR Requests found matching filter "{proReqFilter}".</p>
                    <p className="text-[11px] text-slate-500">When users pay ₹{qrConfig.premiumFeeINR || 99} and submit their UTR number in PRO Membership modal, their transaction will appear here for verification.</p>
                  </div>
                );
              }

              return filtered.map(req => (
                <div 
                  key={req.id} 
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition space-y-3 ${
                    req.status === 'pending'
                      ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : req.status === 'approved'
                      ? 'border-emerald-500/40'
                      : 'border-rose-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{req.userName}</span>
                        <span className="text-xs text-slate-400 font-mono">({req.userEmail})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Submitted: {new Date(req.timestamp).toLocaleString()} • Amount: <span className="text-emerald-400 font-bold font-mono">₹{req.amountINR} INR</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ACCEPTED & PRO ACTIVE
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> DECLINED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* UTR Reference Box & Admin Action Controls */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">UPI / PhonePe UTR Ref Number</div>
                      <div className="text-sm font-mono font-black text-amber-400 tracking-widest flex items-center gap-2">
                        <span>{req.utrNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.utrNumber);
                            audioHaptics.playClick();
                            alert(`Copied UTR: ${req.utrNumber}`);
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                          title="Copy UTR to Clipboard"
                        >
                          Copy UTR
                        </button>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApproveProRequest(req)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept & Activate PRO
                        </button>
                        <button
                          onClick={() => handleDeclineProRequest(req)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase hover:bg-rose-500/30 transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}
                  </div>

                  {req.declineReason && (
                    <div className="text-xs text-rose-300/90 italic">
                      Decline reason: "{req.declineReason}"
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB 1: UPLOAD PHONEPE QR SCANNER */}
      {activeAdminTab === 'qr_upload' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                PhonePe & UPI Merchant QR Code Manager
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your custom PhonePe QR scanner image and update merchant details for Wheel Spin & Cash Redemptions.
              </p>
            </div>
            <button
              onClick={handleResetQRConfig}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Reset Default
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Upload Controls & Inputs */}
            <div className="space-y-4">
              
              {/* Image Upload Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Upload Custom PhonePe QR Code Image <span className="text-purple-400">(PNG / JPG / DataURL)</span>
                </label>
                <div className="relative border-2 border-dashed border-purple-500/40 rounded-2xl p-4 bg-slate-950/60 hover:border-purple-400 transition text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-purple-300">
                      Click or Drag & Drop QR Image File
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Supports high-resolution PNG, JPG, or WEBP up to 5MB
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}
              </div>

              {/* Direct Image URL fallback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Or Paste Custom Image URL</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://example.com/my-phonepe-qr.png"
                    value={qrConfig.qrImageUrl || ''}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, qrImageUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
              </div>

              {/* Merchant Details Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Merchant UPI ID</label>
                  <input
                    type="text"
                    value={qrConfig.upiId}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Merchant Name</label>
                  <input
                    type="text"
                    value={qrConfig.merchantName}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, merchantName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Fee Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Wheel Spin Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={qrConfig.wheelSpinFeeINR}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, wheelSpinFeeINR: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Redemption Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={qrConfig.redemptionFeeINR}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, redemptionFeeINR: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">PRO Join Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={qrConfig.premiumFeeINR || 99}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, premiumFeeINR: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Live Scanner Preview */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-center">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" /> Active Scanner Preview (User View)
              </div>

              <div className="inline-block p-4 rounded-3xl bg-white border-4 border-[#5f259f] shadow-2xl relative">
                {qrConfig.qrImageUrl ? (
                  <img
                    src={qrConfig.qrImageUrl}
                    alt="Custom Uploaded PhonePe QR"
                    className="w-52 h-52 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-52 h-52 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-700 text-xs font-mono gap-2 p-2">
                    <QrCode className="w-16 h-16 text-[#5f259f]" />
                    <span className="font-bold">Auto Generated UPI QR</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-full">{qrConfig.upiId}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-white font-bold">{qrConfig.merchantName}</div>
                <div className="text-amber-400 font-mono text-[11px]">{qrConfig.upiId}</div>
              </div>

              {qrSaveMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom QR Code Saved & Deployed to App!
                </div>
              )}

              <button
                onClick={handleSaveQRConfig}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save & Deploy QR Scanner Config
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & BALANCE MANAGER */}
      {activeAdminTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                User Account Maintenance & Balance Editor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintain user balances, grant coins, brain score, diamonds, levels, and toggle admin/premium status.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">
              Editing: {user.name} ({user.email || 'Guest User'})
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Balance Editor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Coins Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" /> Brain Coins Balance
                </label>
                <input
                  type="number"
                  value={editingCoins}
                  onChange={(e) => setEditingCoins(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-amber-400 focus:outline-none"
                />
              </div>

              {/* Brain Score Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> Brain Score
                </label>
                <input
                  type="number"
                  value={editingBrainScore}
                  onChange={(e) => setEditingBrainScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-cyan-300 focus:outline-none"
                />
              </div>

              {/* Diamonds Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" /> Diamonds
                </label>
                <input
                  type="number"
                  value={editingDiamonds}
                  onChange={(e) => setEditingDiamonds(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-pink-400 focus:outline-none"
                />
              </div>

              {/* Level Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-purple-400" /> User Level
                </label>
                <input
                  type="number"
                  value={editingLevel}
                  onChange={(e) => setEditingLevel(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-purple-300 focus:outline-none"
                />
              </div>

            </div>

            {/* Status Switches & Daily Spin Reset */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Premium Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" /> Premium Status
                  </div>
                  <div className="text-[10px] text-slate-400">Enable PRO benefits</div>
                </div>
                <button
                  onClick={() => setEditingIsPremium(!editingIsPremium)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    editingIsPremium ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {editingIsPremium ? 'PRO ACTIVE' : 'STANDARD'}
                </button>
              </div>

              {/* Reset Daily Wheel Spin */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-cyan-400" /> Daily Wheel Spin Lock
                  </div>
                  <div className="text-[10px] text-slate-400">Unlock unlimited spins</div>
                </div>
                <button
                  onClick={handleResetWheelSpinLock}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition"
                >
                  Clear Lock
                </button>
              </div>

              {/* Save Button */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <button
                  onClick={handleSaveUserAccount}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase shadow-lg hover:brightness-110 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save User Account
                </button>
              </div>

            </div>

            {userSaveMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> User Profile & Balances Updated Successfully!
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 4: CASH REDEMPTION REQUESTS */}
      {activeAdminTab === 'redemptions' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                User Cash Redemption Payout Requests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review user redemption submissions, verify 12-digit UTR numbers, and approve UPI cash payouts.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold">
              Total Requests: {redemptions.length}
            </div>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <IndianRupee className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Payout Requests Yet</div>
              <p className="text-xs text-slate-500">When users redeem coins for INR cash, their UTR numbers & UPI details will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map(rec => (
                <div key={rec.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{rec.userName}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {rec.coinsRedeemed.toLocaleString()} Coins
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ₹{rec.inrAmount.toFixed(2)} INR
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        rec.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        rec.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px]">UPI Destination:</span>
                      <div className="font-mono text-cyan-300 font-bold">{rec.payoutDestination}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px]">PhonePe UTR / Ref No:</span>
                      <div className="font-mono text-amber-400 font-bold">{rec.utrNumber}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px]">Submitted Date:</span>
                      <div className="text-slate-300 text-[11px]">{new Date(rec.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateRedemptionStatus(rec.id, 'SUCCESS')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Payout
                    </button>

                    <button
                      onClick={() => handleUpdateRedemptionStatus(rec.id, 'PROCESSING_PAYOUT')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" /> Processing
                    </button>

                    <button
                      onClick={() => handleUpdateRedemptionStatus(rec.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VERSION CONTROL & BROADCAST */}
      {activeAdminTab === 'version' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-cyan-400" />
              App Version & Push Broadcast Management
            </h2>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
              Current Target: {appVersion}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">App Build Version Tag</label>
              <input
                type="text"
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Version Changelog / Notes</label>
              <input
                type="text"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {versionSaved ? (
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Build Version Updated & Applied!
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">
                Master Authority Granted to Jeevan Gowda ({MASTER_ADMIN_EMAIL})
              </span>
            )}

            <button
              onClick={handleSaveVersion}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase shadow-lg hover:brightness-110 transition"
            >
              <Save className="w-4 h-4" /> Update App Version
            </button>
          </div>

          {/* Global Push Broadcast */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Global Push Broadcast
            </h3>

            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Type global alert message..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 focus:outline-none"
            />

            {broadcastSent && (
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Global push broadcast sent!
              </div>
            )}

            <button
              onClick={handleBroadcast}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition"
            >
              Send Broadcast Alert
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
