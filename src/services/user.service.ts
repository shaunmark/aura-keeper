import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
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
}

const USERS_COLLECTION = 'users';

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

  async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};

export type { UserProfile };