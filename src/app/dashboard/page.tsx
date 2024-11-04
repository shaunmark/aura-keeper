'use client'

import { useFirebase } from '@/context/FirebaseContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DAILY_AURA_LIMIT, userService } from '@/services/user.service'
import type { UserProfile } from '@/services/user.service'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import UserNotifications from '@/components/UserNotifications'
import Popup from '@/components/Popup'

export default function Dashboard() {
  const { user, loading, auth } = useFirebase()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [remainingAura, setRemainingAura] = useState<number>(DAILY_AURA_LIMIT);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    showConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await userService.getProfile(user.uid)
          if (profile?.disabled) {
            await userService.enableUser(user.uid)
            const updatedProfile = await userService.getProfile(user.uid)
            setUserProfile(updatedProfile)
          } else {
            setUserProfile(profile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setLoadingProfile(false)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  useEffect(() => {
    const fetchRemainingAura = async () => {
      if (!user) return;
      
      try {
        const profile = await userService.getProfile(user.uid);
        if (profile) {
          const spent = profile.dailyAuraSpent || 0;
          const limit = profile.dailyAuraLimit || DAILY_AURA_LIMIT;
          setRemainingAura(limit - spent);
        }
      } catch (error) {
        console.error('Error fetching remaining aura:', error);
      }
    };

    fetchRemainingAura();
  }, [user]);

  const handleDeactivateAccount = () => {
    if (!user) return;
    
    setPopup({
      isOpen: true,
      title: 'Deactivate Account',
      message: 'Are you sure you want to deactivate your account? You can reactivate it by logging in again.',
      type: 'warning',
      showConfirm: true,
      onConfirm: async () => {
        try {
          await userService.disableUser(user.uid);
          await auth.signOut();
          router.push('/login');
        } catch (error) {
          console.error('Error deactivating account:', error);
          setPopup({
            isOpen: true,
            title: 'Error',
            message: 'Failed to deactivate account. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  if (loading || loadingProfile) {
    return <LoadingSpinner />;
  }

  if (!user || !userProfile) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24">
              {userProfile.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {userProfile?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userProfile.displayName || userProfile.username}
              </h2>
              <p className="text-sm text-gray-500">@{userProfile.username}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{userProfile.provider || 'Email'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{userProfile.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Link 
            href="/leaderboard"
            className="bg-indigo-600 shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white group-hover:text-gray-100 transition-colors">
                  View Leaderboard
                </h3>
                <p className="text-sm text-indigo-200">
                  Check your ranking and see top performers
                </p>
              </div>
              <div className="text-white group-hover:translate-x-1 transition-transform">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            </div>
          </Link>

          <button
            onClick={() => auth.signOut()}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                  Sign Out
                </h3>
                <p className="text-sm text-gray-500">
                  Securely log out of your account
                </p>
              </div>
              <div className="text-red-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={handleDeactivateAccount}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                  Deactivate Account
                </h3>
                <p className="text-sm text-gray-500">
                  Temporarily disable your account
                </p>
              </div>
              <div className="text-orange-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                  />
                </svg>
              </div>
            </div>
          </button>

          <div className="bg-white shadow rounded-lg p-6 md:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Daily Aura Balance
                </h3>
                <span className="text-2xl font-bold text-indigo-600">
                  {remainingAura}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Available to Allocate</span>
                  <span>{Math.round((remainingAura / DAILY_AURA_LIMIT) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(remainingAura / DAILY_AURA_LIMIT) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can allocate up to {DAILY_AURA_LIMIT} aura points per day to other users.
                  Your balance resets daily.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      Need More Aura?
                    </h4>
                    <p className="text-sm text-gray-500">
                      Upgrade your daily limit with our premium plans
                    </p>
                  </div>
                  <Link
                    href="/plans"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Upgrade
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="ml-2 -mr-1 h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <UserNotifications />
          </div>
        </div>
      </div>

      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        onConfirm={popup.onConfirm}
        showConfirm={popup.showConfirm}
      />
    </div>
  )
} 