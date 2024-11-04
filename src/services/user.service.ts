import { doc, getDoc, setDoc, collection, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { auraService } from './aura.service';

interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  createdAt: string;
  lastLogin: string;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: string;
  disabled?: boolean;
  dailyAuraLimit?: number;
  dailyAuraSpent?: number;
  lastAuraReset?: string;
}

const USERS_COLLECTION = 'users';
const DAILY_AURA_LIMIT = 1000;

export const userService = {
  async createProfile(userData: UserProfile): Promise<void> {
    try {
      const userRef = doc(collection(db, USERS_COLLECTION), userData.uid);
      
      const userProfile = {
        ...userData,
        provider: userData.provider || 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await setDoc(userRef, userProfile);
      await auraService.initializeAura(userData.uid);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null; // Return null instead of throwing error for non-existent profiles
    }
  },

  async disableUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        disabled: true
      }, { merge: true });
    } catch (error) {
      console.error('Error disabling user:', error);
      throw error;
    }
  },

  async enableUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        disabled: false
      }, { merge: true });
    } catch (error) {
      console.error('Error enabling user:', error);
      throw error;
    }
  },

  async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        lastLogin: new Date().toISOString(),
        disabled: false
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  },

  async resetDailyAuraIfNeeded(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as UserProfile;
      
      if (!userData.lastAuraReset) {
        await setDoc(userRef, {
          dailyAuraLimit: DAILY_AURA_LIMIT,
          dailyAuraSpent: 0,
          lastAuraReset: new Date().toISOString()
        }, { merge: true });
        return;
      }

      const lastReset = new Date(userData.lastAuraReset);
      const now = new Date();
      const isNewDay = lastReset.getDate() !== now.getDate() || 
                      lastReset.getMonth() !== now.getMonth() || 
                      lastReset.getFullYear() !== now.getFullYear();

      if (isNewDay) {
        await setDoc(userRef, {
          dailyAuraSpent: 0,
          lastAuraReset: now.toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error resetting daily aura:', error);
      throw error;
    }
  },

  async updateDailyAuraSpent(uid: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        dailyAuraSpent: increment(Math.abs(amount))
      }, { merge: true });
    } catch (error) {
      console.error('Error updating daily aura spent:', error);
      throw error;
    }
  },

  async canSpendAura(uid: string, amount: number): Promise<boolean> {
    try {
      await this.resetDailyAuraIfNeeded(uid);
      const profile = await this.getProfile(uid);
      
      if (!profile) return false;
      
      const spent = profile.dailyAuraSpent || 0;
      const limit = profile.dailyAuraLimit || DAILY_AURA_LIMIT;
      
      return (spent + Math.abs(amount)) <= limit;
    } catch (error) {
      console.error('Error checking aura spend capability:', error);
      return false;
    }
  }
};

export type { UserProfile };
export { DAILY_AURA_LIMIT };