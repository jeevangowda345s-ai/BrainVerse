import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Check, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { audioHaptics } from '../utils/audioHaptics';
import { saveUserProfile } from '../utils/storage';
import { saveUserProfileToFirestore } from '../services/firebaseService';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const PRESET_EMOJIS = [
  '🧠', '⚡', '👑', '🎯', '👾', '🤖', '🚀', '🔮',
  '🦁', '🦊', '🐉', '🦸', '🐱', '🐼', '🐯', '🦅',
  '🧙‍♂️', '🦉', '💎', '🔥', '🏆', '🌌', '🧬', '💥'
];

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar || '🧠');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(user.avatar || '🧠');
      setCameraError(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, user.avatar]);

  // Start Camera Stream
  const startCamera = async () => {
    audioHaptics.playClick();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Could not access live camera. You can select a photo from files or camera roll below.');
      audioHaptics.triggerHaptic('error');
    }
  };

  if (!isOpen) return null;

  // Capture Photo from Camera Stream
  const captureCameraPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const size = Math.min(video.videoWidth || 300, video.videoHeight || 300);
    canvas.width = 250;
    canvas.height = 250;

    if (context) {
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      context.drawImage(video, startX, startY, size, size, 0, 0, 250, 250);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedAvatar(dataUrl);
      stopCamera();
    }
  };

  // Process Uploaded Image File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    audioHaptics.playClick();

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          ctx.drawImage(img, startX, startY, size, size, 0, 0, 250, 250);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedAvatar(dataUrl);
          audioHaptics.playCorrect();
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save Avatar Selection
  const handleSaveAvatar = () => {
    audioHaptics.playPaymentSuccess();
    audioHaptics.triggerHaptic('levelUp');

    const updatedUser: UserProfile = {
      ...user,
      avatar: selectedAvatar,
    };

    saveUserProfile(updatedUser);
    saveUserProfileToFirestore(updatedUser).catch((e) => console.warn(e));
    onUpdateUser(updatedUser);
    onClose();
  };

  const isImageAvatar = selectedAvatar.startsWith('data:') || selectedAvatar.startsWith('http') || selectedAvatar.includes('/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Select or Capture Avatar</h2>
              <p className="text-xs text-slate-400">Personalize your MindForge neural profile photo</p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Preview */}
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <div className="relative w-28 h-28 rounded-3xl bg-slate-950 border-2 border-[#00F5FF] p-1 shadow-[0_0_25px_rgba(0,245,255,0.25)] overflow-hidden flex items-center justify-center">
            {isImageAvatar ? (
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-5xl">{selectedAvatar}</span>
            )}
            <div className="absolute bottom-1 right-1 p-1 rounded-full bg-[#00F5FF] text-slate-950 font-black shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-300">Avatar Preview</div>
        </div>

        {/* Camera Live Feed Section */}
        {isCameraActive ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 text-center">
            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-black border-2 border-cyan-400">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={captureCameraPhoto}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs uppercase hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Take Snapshot
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Avatar Capture & Upload Option Buttons */
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition group"
            >
              <Camera className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              <span>Capture via Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition group"
            >
              <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
              <span>{isUploading ? 'Loading...' : 'Upload Image File'}</span>
            </button>

            {/* Hidden Input File Elements */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {cameraError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Preset Emojis & Avatars Grid */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Preset MindForge Avatar</div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  audioHaptics.playClick();
                  setSelectedAvatar(emoji);
                }}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                  selectedAvatar === emoji
                    ? 'bg-[#00F5FF]/20 border-2 border-[#00F5FF] scale-110 shadow-lg shadow-[#00F5FF]/20'
                    : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAvatar}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F5FF] to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#00F5FF]/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Avatar
          </button>
        </div>

      </div>
    </div>
  );
};
