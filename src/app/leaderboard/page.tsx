'use client';

import { useEffect, useState } from 'react';
import { auraService } from '@/services/aura.service';
import type { AuraWithUser } from '@/services/aura.service';
import Link from 'next/link';
import { useFirebase } from '@/context/FirebaseContext';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<AuraWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userAura, setUserAura] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await auraService.getAllAurasWithUsernames();
        setLeaderboardData(data);
        
        // Find current user's rank and aura
        if (user) {
          const userIndex = data.findIndex(entry => entry.uid === user.uid);
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
            setUserAura(data[userIndex].aura);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current User Stats */}
        {user && userRank !== null && userAura !== null && (
          <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-900">Your Position</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Rank</div>
                  <div className="text-2xl font-bold text-indigo-600">#{userRank}</div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="text-sm text-gray-500">Your Aura</div>
                  <div className="text-2xl font-bold text-indigo-600">{userAura}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">To Next Rank</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {userRank > 1 
                      ? leaderboardData[userRank - 2].aura - userAura 
                      : '–'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Aura Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Top aura holders ranked by their current score
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end space-x-4 mb-12 px-4">
          {/* Second Place */}
          {leaderboardData[1] && (
            <div className="text-center">
              <div className="w-20 h-24 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">{leaderboardData[1].aura}</span>
              </div>
              <div className="bg-gray-200 p-3 rounded-b-lg">
                <div className="text-sm font-semibold truncate max-w-[100px]">
                  {leaderboardData[1].username}
                </div>
                <div className="text-xs text-gray-600">2nd Place</div>
              </div>
            </div>
          )}

          {/* First Place */}
          {leaderboardData[0] && (
            <div className="text-center -mt-8">
              <div className="w-24 h-32 bg-yellow-100 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-yellow-600">{leaderboardData[0].aura}</span>
              </div>
              <div className="bg-yellow-200 p-4 rounded-b-lg">
                <div className="text-base font-bold truncate max-w-[120px]">
                  {leaderboardData[0].username}
                </div>
                <div className="text-sm text-yellow-600">Champion</div>
              </div>
            </div>
          )}

          {/* Third Place */}
          {leaderboardData[2] && (
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">{leaderboardData[2].aura}</span>
              </div>
              <div className="bg-orange-200 p-3 rounded-b-lg">
                <div className="text-sm font-semibold truncate max-w-[100px]">
                  {leaderboardData[2].username}
                </div>
                <div className="text-xs text-orange-600">3rd Place</div>
              </div>
            </div>
          )}
        </div>

        {/* Complete Leaderboard List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-500">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">User</div>
              <div className="col-span-4 text-right">Aura Score</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((entry, index) => {
              const isCurrentUser = entry.uid === user?.uid;
              return (
                <div 
                  key={entry.uid}
                  className={`px-4 py-3 grid grid-cols-12 items-center transition-colors ${
                    isCurrentUser 
                      ? 'bg-indigo-50 hover:bg-indigo-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-2 text-sm">
                    <span className={`font-medium ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div className="col-span-6">
                    <Link 
                      href={`/user/${entry.uid}`}
                      className="block hover:opacity-75 transition-opacity"
                    >
                      <div className={`text-sm font-medium ${
                        isCurrentUser ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {entry.username}
                        {isCurrentUser && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated {new Date(entry.lastUpdated).toLocaleDateString()}
                      </div>
                    </Link>
                  </div>
                  <div className="col-span-4 text-right">
                    <span className={`text-lg font-semibold ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {entry.aura}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 