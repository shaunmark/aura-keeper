import { 
  doc, 
  getDoc, 
  setDoc, 
  increment, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { userService } from './user.service';

interface AuraHistoryEntry {
  timestamp: string;
  change: number;
  reason?: string;
  changedByUid: string;
}

interface AuraRecord {
  uid: string;
  aura: number;
  lastUpdated: string;
  history: AuraHistoryEntry[];
}

interface AuraWithUser extends AuraRecord {
  username: string;
}

const AURA_COLLECTION = 'auras';

export const auraService = {
  async initializeAura(uid: string): Promise<void> {
    const auraRef = doc(db, AURA_COLLECTION, uid);
    const auraDoc = await getDoc(auraRef);

    if (!auraDoc.exists()) {
      const initialAura: AuraRecord = {
        uid,
        aura: 0,
        lastUpdated: new Date().toISOString(),
        history: [{
          timestamp: new Date().toISOString(),
          change: 0,
          reason: 'Account Creation',
          changedByUid: ''
        }]
      };
      await setDoc(auraRef, initialAura);
    }
  },

  async getAura(uid: string): Promise<AuraRecord | null> {
    try {
      const auraRef = doc(db, AURA_COLLECTION, uid);
      const auraDoc = await getDoc(auraRef);

      if (!auraDoc.exists()) {
        await this.initializeAura(uid);
        return this.getAura(uid);
      }

      return auraDoc.data() as AuraRecord;
    } catch (error) {
      console.error('Error getting aura:', error);
      return null;
    }
  },

  async updateAura(uid: string, change: number, reason: string, changedByUid: string): Promise<void> {
    try {
      const canSpend = await userService.canSpendAura(changedByUid, Math.abs(change));
      if (!canSpend) {
        throw new Error('Daily aura limit exceeded');
      }

      const auraRef = doc(db, AURA_COLLECTION, uid);
      const now = new Date().toISOString();

      const historyEntry: AuraHistoryEntry = {
        timestamp: now,
        change,
        reason,
        changedByUid
      };

      await updateDoc(auraRef, {
        aura: increment(change),
        lastUpdated: now,
        history: arrayUnion(historyEntry)
      });

      await userService.updateDailyAuraSpent(changedByUid, Math.abs(change));
    } catch (error) {
      console.error('Error updating aura:', error);
      throw error;
    }
  },

  async getAllAurasWithUsernames(): Promise<AuraWithUser[]> {
    try {
      const auraRef = collection(db, AURA_COLLECTION);
      const q = query(auraRef, orderBy('aura', 'desc'));
      const auraSnapshot = await getDocs(q);
      
      // Get all user profiles in parallel
      const auraData = auraSnapshot.docs.map(doc => doc.data() as AuraRecord);
      const userProfiles = await Promise.all(
        auraData.map(aura => userService.getProfile(aura.uid))
      );
      
      // Combine aura data with usernames and filter out disabled users
      const combinedData: AuraWithUser[] = auraData
        .map((aura, index) => ({
          ...aura,
          username: userProfiles[index]?.username || 'Unknown User'
        }))
        .filter((_, index) => !userProfiles[index]?.disabled); // Filter out disabled users
      
      return combinedData;
    } catch (error) {
      console.error('Error getting auras with usernames:', error);
      return [];
    }
  }
};

export type { AuraRecord, AuraWithUser };