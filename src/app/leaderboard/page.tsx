'use client';

import { useEffect, useState, useMemo } from 'react';
import { auraService } from '@/services/aura.service';
import type { AuraWithUser } from '@/services/aura.service';
import Link from 'next/link';
import { useFirebase } from '@/context/FirebaseContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<AuraWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userAura, setUserAura] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

  // Get sorted indices for consistent ranking
  const rankMap = useMemo(() => {
    return new Map(
      [...leaderboardData]
        .sort((a, b) => b.aura - a.aura)
        .map((user, index) => [user.uid, index + 1])
    );
  }, [leaderboardData]);

  // Sort function
  const sortedLeaderboardData = useMemo(() => {
    return [...leaderboardData].sort((a, b) => {
      return sortOrder === 'desc' ? b.aura - a.aura : a.aura - b.aura;
    });
  }, [leaderboardData, sortOrder]);

  // Get the top 3 UIDs regardless of sort order
  const topThreeUids = useMemo(() => {
    return [...leaderboardData]
      .sort((a, b) => b.aura - a.aura)
      .slice(0, 3)
      .map(user => user.uid);
  }, [leaderboardData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Bar - Updated for better responsiveness */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-12">
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors self-start sm:self-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            Dashboard
          </Link>
          
          <div className="text-center flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              Aura Leaderboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Top aura holders ranked by their power
            </p>
          </div>
          
          <div className="hidden sm:block w-24"></div> {/* Spacer only visible on larger screens */}
        </div>

        {/* Current User Stats */}
        {user && userRank !== null && userAura !== null && (
          <div className="mb-12 bg-white shadow-lg rounded-2xl overflow-hidden border border-indigo-50">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
              <h2 className="text-lg font-semibold text-white">Your Position</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Rank</div>
                  <div className="text-2xl font-bold text-indigo-600">#{userRank}</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Your Aura</div>
                  <div className="text-2xl font-bold text-indigo-600">{userAura}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">To Next Rank</div>
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

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end space-x-6 mb-16 px-4">
          {/* Second Place */}
          {leaderboardData[1] && (
            <div className="text-center w-28 transform hover:scale-105 transition-transform">
              <div className="h-24 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-gray-700">{leaderboardData[1].aura}</span>
              </div>
              <div className="bg-gray-100 p-3 rounded-b-lg shadow-lg border-t border-gray-200">
                <div className="text-sm font-semibold truncate max-w-[112px]">
                  {leaderboardData[1].username}
                </div>
                <div className="text-xs text-gray-600">2nd Place</div>
              </div>
            </div>
          )}

          {/* First Place */}
          {leaderboardData[0] && (
            <div className="text-center w-32 -mt-8 transform hover:scale-105 transition-transform">
              <div className="h-32 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-yellow-800">{leaderboardData[0].aura}</span>
              </div>
              <div className="bg-yellow-50 p-4 rounded-b-lg shadow-lg border-t border-yellow-200">
                <div className="text-base font-bold truncate max-w-[128px]">
                  {leaderboardData[0].username}
                </div>
                <div className="text-sm text-yellow-700">Champion</div>
              </div>
            </div>
          )}

          {/* Third Place */}
          {leaderboardData[2] && (
            <div className="text-center w-28 transform hover:scale-105 transition-transform">
              <div className="h-20 bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-orange-700">{leaderboardData[2].aura}</span>
              </div>
              <div className="bg-orange-50 p-3 rounded-b-lg shadow-lg border-t border-orange-200">
                <div className="text-sm font-semibold truncate max-w-[112px]">
                  {leaderboardData[2].username}
                </div>
                <div className="text-xs text-orange-700">3rd Place</div>
              </div>
            </div>
          )}
        </div>

        {/* Rest of Leaderboard - Simplified sorting controls */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* List Header */}
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-500">
              <div className="col-span-3 sm:col-span-2">Rank</div>
              <div className="col-span-6">User</div>
              <div className="col-span-3 sm:col-span-4 text-right flex items-center justify-end space-x-2">
                <span className="hidden xs:inline">Aura Score</span>
                <span className="xs:hidden">Aura</span>
                <button 
                  onClick={() => setSortOrder(current => current === 'desc' ? 'asc' : 'desc')}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  {sortOrder === 'desc' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-100">
            {sortedLeaderboardData.map((entry) => {
              const isCurrentUser = entry.uid === user?.uid;
              const rank = rankMap.get(entry.uid) || 0;
              const isTopThree = rank <= 3;

              return (
                <Link 
                  href={`/users?uid=${entry.uid}`}
                  key={entry.uid}
                  className={`px-4 sm:px-6 py-4 grid grid-cols-12 items-center transition-colors cursor-pointer ${
                    isCurrentUser 
                      ? 'bg-indigo-50 hover:bg-indigo-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-3 sm:col-span-2 flex items-center space-x-1 sm:space-x-2">
                    <span className={`text-sm font-medium ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      #{rank}
                    </span>
                    {isTopThree && (
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        rank === 2 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {rank === 1 ? '1st' : 
                         rank === 2 ? '2nd' : 
                         '3rd'}
                      </span>
                    )}
                  </div>
                  <div className="col-span-6">
                    <div className={`text-sm font-medium truncate ${
                      isCurrentUser ? 'text-indigo-900' : 'text-gray-900'
                    } group-hover:text-indigo-600`}>
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Updated {new Date(entry.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-4 text-right">
                    <span className={`text-base sm:text-lg font-semibold ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {entry.aura}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 