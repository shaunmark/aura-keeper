'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auraService } from '@/services/aura.service';
import { userService } from '@/services/user.service';
import Link from 'next/link';
import type { AuraRecord } from '@/services/aura.service';
import type { UserProfile } from '@/services/user.service';

export default function UserHistory() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [auraData, setAuraData] = useState<AuraRecord | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params?.uid) return;
      
      try {
        const [userProfile, auraHistory] = await Promise.all([
          userService.getProfile(params?.uid as string),
          auraService.getAura(params?.uid as string)
        ]);

        setUser(userProfile);
        setAuraData(auraHistory);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading user history...</div>
      </div>
    );
  }

  if (!user || !auraData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {auraData.aura}
                <span className="text-sm text-gray-500 ml-2">Current Aura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aura History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aura History</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {auraData.history.slice().reverse().map((record, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.reason || 'Aura Change'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-lg font-semibold ${
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
        <div className="mt-6 text-center space-x-4">
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