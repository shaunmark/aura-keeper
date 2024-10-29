'use client'

import { useFirebase } from '@/context/FirebaseContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { userService } from '@/services/user.service'
import type { UserProfile } from '@/services/user.service'
import Image from 'next/image'

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
    return <div>Loading...</div>
  }

  if (!user || !userProfile) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24">
              {userProfile.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt="Profile"
                  height={100}
                  width={100}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userProfile.displayName || userProfile.username}
              </h2>
              <p className="text-sm text-gray-500">@{userProfile.username}</p>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{userProfile.provider}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(userProfile.lastLogin).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => auth.signOut()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Session will expire after 1 hour of inactivity
        </p>
      </div>
    </div>
  )
} 