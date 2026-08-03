import { 
  db, 
  auth, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  increment,
  where
} from '../lib/firebase';
import { UserProfile, GameSessionResult, ProUpgradeRequest, QRMerchantConfig } from '../types';
import { DEFAULT_USER } from '../utils/storage';

export interface PublicActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface RealtimeRoomData {
  id: string;
  roomCode: string;
  gameTitle: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostScore: number;
  hostReady: boolean;
  guestId?: string;
  guestName?: string;
  guestAvatar?: string;
  guestScore?: number;
  guestReady?: boolean;
  status: 'Waiting' | 'In Progress' | 'Finished';
  winnerId?: string;
  winnerName?: string;
  stakes: number;
  createdAt: any;
}

// Ensure User Document exists in Firestore & listen real-time
export function subscribeToUserProfile(userId: string, onUpdate: (profile: UserProfile) => void) {
  if (!userId) return () => {};
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate({
        ...DEFAULT_USER,
        ...data,
        id: userId,
      } as UserProfile);
    }
  }, (err) => {
    console.warn('Firestore user profile snapshot notice (offline mode fallback active):', err.message);
  });
}

// Save or Update entire profile to Firestore
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!user.id) return;
  try {
    const userRef = doc(db, 'users', user.id);
    const nowIso = new Date().toISOString();
    await setDoc(userRef, {
      ...user,
      createdAt: user.createdAt || nowIso,
      lastActiveAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
  }
}

// Subscribe to ALL Registered Users for Admin (Master Admin jeevangowda345s@gmail.com)
export function subscribeToAllUsers(onUpdate: (users: UserProfile[]) => void) {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const userList: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      userList.push({
        ...DEFAULT_USER,
        ...data,
        id: docSnap.id,
      } as UserProfile);
    });
    // Sort by latest active / updated / created date
    userList.sort((a, b) => {
      const timeA = new Date(a.lastActiveAt || a.updatedAt || a.createdAt || a.lastActiveDate || 0).getTime();
      const timeB = new Date(b.lastActiveAt || b.updatedAt || b.createdAt || b.lastActiveDate || 0).getTime();
      return timeB - timeA;
    });
    onUpdate(userList);
  }, (err) => {
    console.warn('Error subscribing to all users for admin:', err);
  });
}

// Admin Update target user profile and balances in Firestore
export async function adminUpdateUserProfileInFirestore(targetUserId: string, updates: Partial<UserProfile>): Promise<void> {
  if (!targetUserId) return;
  try {
    const userRef = doc(db, 'users', targetUserId);
    const nowIso = new Date().toISOString();
    await setDoc(userRef, {
      ...updates,
      updatedAt: nowIso,
      lastActiveAt: nowIso
    }, { merge: true });
  } catch (err) {
    console.error('Failed to admin update user in Firestore:', err);
    throw err;
  }
}

// Revoke unauthorized Admin status from accounts except master admin jeevangowda345s@gmail.com
export async function revokeAllNonAdminProUsersFromFirestore(): Promise<number> {
  const MASTER_ADMIN = 'jeevangowda345s@gmail.com';
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    let revokedCount = 0;
    const promises: Promise<void>[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userEmail = (data.email || '').toLowerCase().trim();
      const isMasterAdmin = userEmail === MASTER_ADMIN;

      // Only revoke unauthorized admin rights; do NOT revoke paid PRO memberships
      if (!isMasterAdmin && data.isAdmin) {
        revokedCount++;
        const userRef = doc(db, 'users', docSnap.id);
        promises.push(
          setDoc(userRef, {
            isAdmin: false,
            updatedAt: new Date().toISOString()
          }, { merge: true })
        );
      }
    });

    await Promise.all(promises);
    return revokedCount;
  } catch (err) {
    console.error('Failed to revoke unauthorized admin rights in Firestore:', err);
    return 0;
  }
}

// Atomic update for User Coins (FIXES coin addition issue & prevents overwriting)
export async function addCoinsInFirestore(userId: string, amount: number): Promise<number | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      coins: increment(amount),
      updatedAt: new Date().toISOString()
    });
    return amount;
  } catch (err) {
    console.error('Failed to update coins in Firestore:', err);
    return null;
  }
}

// Fetch single User Profile document from Firestore
export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return {
        ...DEFAULT_USER,
        ...snap.data(),
        id: userId,
      } as UserProfile;
    }
  } catch (err) {
    console.error('Failed to fetch user profile from Firestore:', err);
  }
  return null;
}

// Atomic update for Wheel & Daily Rewards (Coins, Brain Score, Diamonds, XP)
export async function addWheelRewardsInFirestore(
  userId: string,
  rewards: { coins?: number; brainScore?: number; diamonds?: number; xp?: number; lastWheelSpinDate?: string }
): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (rewards.coins !== undefined && rewards.coins !== 0) updates.coins = increment(rewards.coins);
    if (rewards.brainScore) updates.brainScore = increment(rewards.brainScore);
    if (rewards.diamonds) updates.diamonds = increment(rewards.diamonds);
    if (rewards.xp) updates.xp = increment(rewards.xp);
    if (rewards.lastWheelSpinDate) updates.lastWheelSpinDate = rewards.lastWheelSpinDate;

    await updateDoc(userRef, updates);
  } catch (err) {
    console.error('Failed to update wheel rewards in Firestore:', err);
  }
}

// Log a game session & award rewards real-time
export async function logGameSessionToFirestore(
  userId: string, 
  userName: string, 
  session: GameSessionResult
): Promise<void> {
  try {
    // Add session record
    await addDoc(collection(db, 'gameSessions'), {
      ...session,
      userId,
      userName,
      createdAt: serverTimestamp()
    });

    // Update user stats in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      coins: increment(session.coinsEarned),
      xp: increment(session.xpEarned),
      brainScore: increment(Math.round(session.score / 20)),
      updatedAt: new Date().toISOString()
    });

    // Log Activity Feed item
    await addDoc(collection(db, 'activityFeed'), {
      userId,
      userName,
      action: `Scored ${session.score} pts in ${session.gameName}`,
      detail: `+${session.coinsEarned} Coins, +${session.xpEarned} XP`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error logging game session to Firestore:', err);
  }
}

// Real-time Global Leaderboard Listener
export function subscribeToLeaderboard(onUpdate: (players: UserProfile[]) => void) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('brainScore', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const players: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      players.push({
        ...DEFAULT_USER,
        ...data,
        id: docSnap.id,
      } as UserProfile);
    });
    onUpdate(players);
  }, (err) => {
    console.warn('Leaderboard query error:', err);
  });
}

// Real-time Public Activity Feed Listener
export function subscribeToActivityFeed(onUpdate: (items: PublicActivityItem[]) => void) {
  const feedRef = collection(db, 'activityFeed');
  const q = query(feedRef, orderBy('createdAt', 'desc'), limit(20));

  return onSnapshot(q, (snapshot) => {
    const items: PublicActivityItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        userId: data.userId || 'anon',
        userName: data.userName || 'Cognitive Challenger',
        userAvatar: data.userAvatar || '🧠',
        action: data.action || 'Completed training',
        detail: data.detail || '',
        timestamp: data.timestamp || 'Just now',
      });
    });
    onUpdate(items);
  }, (err) => {
    console.warn('Activity feed error:', err);
  });
}

// Real-time Multiplayer Rooms
export function subscribeToMultiplayerRooms(onUpdate: (rooms: RealtimeRoomData[]) => void) {
  const roomsRef = collection(db, 'multiplayerRooms');
  const q = query(roomsRef, orderBy('createdAt', 'desc'), limit(20));

  return onSnapshot(q, (snapshot) => {
    const rooms: RealtimeRoomData[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rooms.push({
        id: docSnap.id,
        ...data,
      } as RealtimeRoomData);
    });
    onUpdate(rooms);
  }, (err) => {
    console.warn('Multiplayer rooms error:', err);
  });
}

// Subscribe to a single Multiplayer Room real-time
export function subscribeToRoom(roomId: string, onUpdate: (room: RealtimeRoomData | null) => void) {
  if (!roomId) return () => {};
  const roomRef = doc(db, 'multiplayerRooms', roomId);

  return onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({
        id: docSnap.id,
        ...docSnap.data(),
      } as RealtimeRoomData);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.warn('Single room subscription error:', err);
  });
}

// Create real-time multiplayer duel room
export async function createRealtimeRoom(
  user: UserProfile, 
  gameTitle: string, 
  stakes: number = 50,
  targetUserId?: string
): Promise<{ roomId: string; roomCode: string }> {
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const docRef = await addDoc(collection(db, 'multiplayerRooms'), {
    roomCode,
    gameTitle,
    hostId: user.id,
    hostName: user.name,
    hostAvatar: user.avatar,
    hostScore: 0,
    hostReady: true,
    targetUserId: targetUserId || null,
    status: 'Waiting',
    stakes,
    createdAt: serverTimestamp(),
  });
  return { roomId: docRef.id, roomCode };
}

// Join real-time room
export async function joinRealtimeRoom(roomId: string, user: UserProfile): Promise<void> {
  const roomRef = doc(db, 'multiplayerRooms', roomId);
  await updateDoc(roomRef, {
    guestId: user.id,
    guestName: user.name,
    guestAvatar: user.avatar,
    guestScore: 0,
    guestReady: true,
    status: 'In Progress',
  });
}

// Join room by 6-digit code
export async function joinRoomByCode(roomCode: string, user: UserProfile): Promise<RealtimeRoomData | null> {
  if (!roomCode || roomCode.trim().length < 4) return null;
  try {
    const roomsRef = collection(db, 'multiplayerRooms');
    const q = query(roomsRef, where('roomCode', '==', roomCode.trim()), limit(1));
    const querySnap = await getDocs(q);
    
    if (!querySnap.empty) {
      const roomDoc = querySnap.docs[0];
      const roomId = roomDoc.id;
      await joinRealtimeRoom(roomId, user);
      return {
        id: roomId,
        ...roomDoc.data(),
        status: 'In Progress',
        guestId: user.id,
        guestName: user.name,
        guestAvatar: user.avatar
      } as RealtimeRoomData;
    }
  } catch (err) {
    console.error('Error joining room by code:', err);
  }
  return null;
}

// Update live score during multiplayer game
export async function updateMultiplayerScore(
  roomId: string, 
  isHost: boolean, 
  score: number
): Promise<void> {
  const roomRef = doc(db, 'multiplayerRooms', roomId);
  if (isHost) {
    await updateDoc(roomRef, { hostScore: score });
  } else {
    await updateDoc(roomRef, { guestScore: score });
  }
}

// Mark match finished
export async function finishMultiplayerMatch(
  roomId: string,
  winnerId: string,
  winnerName?: string
): Promise<void> {
  const roomRef = doc(db, 'multiplayerRooms', roomId);
  await updateDoc(roomRef, {
    status: 'Finished',
    winnerId,
    winnerName: winnerName || null,
  });
}

// Submit PRO Upgrade Request with UTR in Firestore
export async function submitProUpgradeRequestToFirestore(request: ProUpgradeRequest): Promise<void> {
  try {
    const reqRef = doc(db, 'pro_upgrade_requests', request.id);
    await setDoc(reqRef, {
      ...request,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error submitting PRO upgrade request to Firestore:', err);
  }
}

// Fetch all PRO Upgrade Requests for Admin Review
export async function fetchProUpgradeRequestsFromFirestore(): Promise<ProUpgradeRequest[]> {
  try {
    let snap;
    try {
      const q = query(collection(db, 'pro_upgrade_requests'), orderBy('timestamp', 'desc'), limit(50));
      snap = await getDocs(q);
    } catch (e) {
      // Fallback if index or orderBy constraints fail
      snap = await getDocs(collection(db, 'pro_upgrade_requests'));
    }
    const results: ProUpgradeRequest[] = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as ProUpgradeRequest);
    });
    // Sort in memory descending by timestamp
    results.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return results;
  } catch (err) {
    console.warn('Error fetching PRO upgrade requests from Firestore:', err);
    return [];
  }
}

// Update PRO Request status & grant Premium to User if approved
export async function updateProUpgradeRequestInFirestore(
  requestId: string,
  userId: string,
  status: 'approved' | 'declined',
  declineReason?: string
): Promise<void> {
  try {
    const reqRef = doc(db, 'pro_upgrade_requests', requestId);
    await updateDoc(reqRef, {
      status,
      declineReason: declineReason || null,
      updatedAt: new Date().toISOString()
    });

    if (status === 'approved' && userId) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isPremium: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Error updating PRO request status in Firestore:', err);
  }
}

// Save or Update Merchant QR & Payment Config in Firestore
export async function saveQRMerchantConfigToFirestore(config: QRMerchantConfig): Promise<void> {
  try {
    const docRef = doc(db, 'system_config', 'merchant_qr');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving merchant QR config to Firestore:', err);
  }
}

// Fetch Official Merchant QR & Payment Config from Firestore
export async function fetchQRMerchantConfigFromFirestore(): Promise<QRMerchantConfig | null> {
  try {
    const docRef = doc(db, 'system_config', 'merchant_qr');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as QRMerchantConfig;
    }
  } catch (err) {
    console.warn('Error fetching merchant QR config from Firestore:', err);
  }
  return null;
}
