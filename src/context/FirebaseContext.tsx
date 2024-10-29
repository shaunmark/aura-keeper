'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { setupAuthTimeout } from '@/utils/auth';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const token = await user.getIdToken();
        document.cookie = `session=${token}; path=/; max-age=${60 * 60}`;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists() && pathname !== '/setup-username') {
            router.push('/setup-username');
          } else if (pathname === '/login') {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      } else {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        if (pathname === '/dashboard' || pathname === '/setup-username') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router, db]);

  useEffect(() => {
    if (user) {
      const cleanup = setupAuthTimeout();
      return cleanup;
    }
  }, [user]);

  return (
    <FirebaseContext.Provider value={{ auth, db, storage, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 