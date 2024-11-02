'use client'

import { useFirebase } from '@/context/FirebaseContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { userService } from '@/services/user.service'
import type { UserProfile } from '@/services/user.service'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import UserNotifications from '@/components/UserNotifications'

export default function Dashboard() {
  const { user, loading, auth } = useFirebase()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await userService.getProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setLoadingProfile(false)
        }
      }
    }

    fetchUserProfile()
  }, [user])

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link 
            href="/leaderboard"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                  View Leaderboard
                </h3>
                <p className="text-sm text-gray-500">
                  Check your ranking and see top performers
                </p>
              </div>
              <div className="text-indigo-600 group-hover:translate-x-1 transition-transform">
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

          <div className="md:col-span-2">
            <UserNotifications />
          </div>
        </div>
      </div>
    </div>
  )
} 