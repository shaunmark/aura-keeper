import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type UserCredential 
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export const authService = {
  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(auth, provider);
  },

  async logout(): Promise<void> {
    return signOut(auth);
  }
}; 