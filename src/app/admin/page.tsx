'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { userService } from '@/services/user.service';
import { auraService } from '@/services/aura.service';
import type { UserProfile } from '@/services/user.service';
import type { AuraWithUser } from '@/services/aura.service';
import { useRouter } from 'next/navigation';

export default function AdminConsole() {
  const { user } = useFirebase();
  const router = useRouter();
  const [users, setUsers] = useState<(UserProfile & { aura: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [auraChange, setAuraChange] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auras = await auraService.getAllAurasWithUsernames();
        setUsers(auras.map(aura => ({
          uid: aura.uid,
          username: aura.username,
          aura: aura.aura,
          email: '',
          createdAt: '',
          lastLogin: ''
        })));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleAuraUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || auraChange === 0 || !reason.trim()) return;
    
    if (selectedUser === user?.uid) {
      alert("You cannot modify your own aura!");
      return;
    }

    setUpdating(true);
    try {
      await auraService.updateAura(selectedUser, auraChange, reason);
      router.back();
    } catch (error) {
      console.error('Error updating aura:', error);
      alert('Failed to update aura');
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAuraIncrement = (value: number) => {
    setAuraChange(prev => prev + value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Aura Management Console</h2>
          </div>

          <form onSubmit={handleAuraUpdate} className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Search and Select User
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  placeholder="Search users..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="mt-1 max-h-60 overflow-auto border border-gray-200 rounded-md">
                {filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                      selectedUser === user.uid ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedUser(user.uid)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-gray-500">{user.aura}</span>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-4 py-2 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Aura Change
              </label>
              
              <div className="flex justify-center items-center h-16 text-3xl font-bold text-indigo-600 bg-indigo-50 rounded-lg">
                {auraChange > 0 ? '+' : ''}{auraChange}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleAuraIncrement(-100)}
                    className="w-full py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    -100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuraIncrement(-10)}
                    className="w-full py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    -10
                  </button>
                </div>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleAuraIncrement(100)}
                    className="w-full py-3 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuraIncrement(10)}
                    className="w-full py-3 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    +10
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuraChange(0)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <div className="mt-1">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Why are you changing this user's aura?"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || !selectedUser || auraChange === 0 || !reason.trim()}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 