import React from 'react';
import { XCircle, X, RefreshCw } from 'lucide-react';
import { ProUpgradeRequest } from '../types';
import { audioHaptics } from '../utils/audioHaptics';

interface DeclinedPaymentModalProps {
  request: ProUpgradeRequest | null;
  onClose: () => void;
}

export const DeclinedPaymentModal: React.FC<DeclinedPaymentModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  const handleDismiss = () => {
    audioHaptics.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0C0A09] border-2 border-rose-500/60 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <XCircle className="w-9 h-9 animate-pulse" />
        </div>

        {/* Main Title & Subtitle requested by user */}
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-rose-500 uppercase tracking-tight">
            Invalid UTR
          </h3>
          <p className="text-base font-extrabold text-slate-200">
            Payment Declined
          </p>
          <p className="text-[11px] text-rose-300/80 font-medium pt-0.5">
            Verification by Admin (<span className="text-amber-300 font-mono font-bold">jeevangowda345s@gmail.com</span>)
          </p>
        </div>

        {/* Request Details */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300 border-b border-rose-500/20 pb-2">
            <span className="font-semibold text-slate-400">Payment Type:</span>
            <span className="font-bold text-amber-300">
              {request.paymentType === 'PRO_MEMBERSHIP' ? '👑 PRO VIP Membership (₹99)' : '🎡 Lucky Wheel Spin Fee (₹9)'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300 border-b border-rose-500/20 pb-2">
            <span className="font-semibold text-slate-400">Submitted UTR:</span>
            <span className="font-mono font-bold text-rose-300">{request.utrNumber}</span>
          </div>
          <div className="space-y-1 pt-1">
            <span className="font-semibold text-slate-400 block">Decline Note:</span>
            <p className="text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-rose-500/20 font-mono text-[11px] leading-relaxed">
              {request.declineReason || 'Invalid UTR reference number. Transaction not verified in merchant bank statement.'}
            </p>
          </div>
        </div>

        {/* Guidance */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center">
          💡 Please ensure you pay <strong className="text-white">₹{request.amountINR}</strong> via PhonePe, enter the correct 12-digit UTR from your payment details, and resubmit for Admin verification.
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Acknowledge & Re-Submit UTR</span>
        </button>
      </div>
    </div>
  );
};
