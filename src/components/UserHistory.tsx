'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auraService } from '@/services/aura.service';
import { userService } from '@/services/user.service';
import Link from 'next/link';
import type { AuraRecord } from '@/services/aura.service';
import type { UserProfile } from '@/services/user.service';
import LoadingSpinner from './LoadingSpinner';

export default function UserHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [auraData, setAuraData] = useState<AuraRecord | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = searchParams.get('uid');
      if (!uid) {
        router.push('/leaderboard');
        return;
      }
      
      try {
        const [userProfile, auraHistory] = await Promise.all([
          userService.getProfile(uid),
          auraService.getAura(uid)
        ]);

        setUser(userProfile);
        setAuraData(auraHistory);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [searchParams, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !auraData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* User Info Card - Updated layout */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-500">Current Aura</span>
                <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                  {auraData.aura}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aura History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aura History</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {auraData.history.slice().reverse().map((record, index) => (
              <div key={index} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.reason || 'Aura Change'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-base sm:text-lg font-semibold ${
                    record.change > 0 ? 'text-green-600' : 
                    record.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {record.change > 0 ? '+' : ''}{record.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <Link 
            href="/leaderboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
} 