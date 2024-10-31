import { doc, getDoc, setDoc, increment, collection, getDocs, query, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { userService } from './user.service';

interface AuraRecord {
  uid: string;
  aura: number;
  lastUpdated: string;
  history: {
    timestamp: string;
    change: number;
    reason?: string;
  }[];
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
          reason: 'Account Creation'
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

  async updateAura(uid: string, change: number, reason?: string): Promise<void> {
    try {
      const auraRef = doc(db, AURA_COLLECTION, uid);
      const now = new Date().toISOString();

      await setDoc(auraRef, {
        aura: increment(change),
        lastUpdated: now,
        history: [{
          timestamp: now,
          change,
          reason
        }]
      }, { merge: true });
    } catch (error) {
      console.error('Error updating aura:', error);
      throw error;
    }
  },

  async getAuraHistory(uid: string): Promise<AuraRecord['history'] | null> {
    try {
      const auraDoc = await this.getAura(uid);
      return auraDoc?.history || null;
    } catch (error) {
      console.error('Error getting aura history:', error);
      return null;
    }
  },

  async getAllAuras(): Promise<AuraRecord[]> {
    try {
      const auraRef = collection(db, AURA_COLLECTION);
      const q = query(auraRef, orderBy('aura', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const auras: AuraRecord[] = querySnapshot.docs.map(doc => {
        return doc.data() as AuraRecord;
      });
      
      return auras;
    } catch (error) {
      console.error('Error getting all auras:', error);
      return [];
    }
  },

  async getAllAurasWithUsernames(): Promise<AuraWithUser[]> {
    try {
      // Get all auras
      const auraRef = collection(db, AURA_COLLECTION);
      const q = query(auraRef, orderBy('aura', 'desc'));
      const auraSnapshot = await getDocs(q);
      
      // Get all user profiles in parallel
      const auraData = auraSnapshot.docs.map(doc => doc.data() as AuraRecord);
      const userProfiles = await Promise.all(
        auraData.map(aura => userService.getProfile(aura.uid))
      );
      
      // Combine aura data with usernames
      const combinedData: AuraWithUser[] = auraData.map((aura, index) => ({
        ...aura,
        username: userProfiles[index]?.username || 'Unknown User'
      }));
      
      return combinedData;
    } catch (error) {
      console.error('Error getting auras with usernames:', error);
      return [];
    }
  }
};

export type { AuraRecord, AuraWithUser }; 