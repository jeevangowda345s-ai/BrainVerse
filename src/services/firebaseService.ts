import { 
  db, 
  auth, 
  doc, 
  getDoc, 
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
import { UserProfile, GameSessionResult } from '../types';
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
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
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

// Create real-time multiplayer duel room
export async function createRealtimeRoom(
  user: UserProfile, 
  gameTitle: string, 
  stakes: number = 50
): Promise<string> {
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const docRef = await addDoc(collection(db, 'multiplayerRooms'), {
    roomCode,
    gameTitle,
    hostId: user.id,
    hostName: user.name,
    hostAvatar: user.avatar,
    hostScore: 0,
    hostReady: true,
    status: 'Waiting',
    stakes,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
