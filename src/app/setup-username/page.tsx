'use client';

import UsernameSetup from '@/components/UsernameSetup';
import { useFirebase } from '@/context/FirebaseContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';

export default function SetupUsernamePage() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!loading && user) {
        try {
          const profile = await userService.getProfile(user.uid);
          if (profile) {
            // User already has a profile, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        } finally {
          setCheckingUser(false);
        }
      } else if (!loading && !user) {
        // No user logged in, redirect to login
        router.push('/login');
      }
    };

    checkUserProfile();
  }, [user, loading, router]);

  if (loading || checkingUser) {
    return <div>Loading...</div>;
  }

  return <UsernameSetup />;
} 