'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { userService } from '@/services/user.service';
import { auraService } from '@/services/aura.service';
import type { UserProfile } from '@/services/user.service';
import type { AuraWithUser } from '@/services/aura.service';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Autocomplete from '@/components/Autocomplete';

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleAuraUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || auraChange === 0 || !reason.trim() || !user) return;
    
    if (selectedUser === user.uid) {
      alert("You cannot modify your own aura!");
      return;
    }

    setUpdating(true);
    try {
      await auraService.updateAura(
        selectedUser,
        auraChange,
        reason,
        user.uid
      );
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900">Aura Management</h2>
            <p className="mt-1 text-sm text-gray-600">Modify user aura points and track changes</p>
          </div>

          <form onSubmit={handleAuraUpdate} className="p-6 space-y-8">
            {/* Updated User Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Select User
                </label>
                <span className="text-xs text-gray-500">
                  {filteredUsers.length} users found
                </span>
              </div>
              
              <Autocomplete
                items={filteredUsers}
                selectedItem={selectedUser}
                onSelect={(user) => setSelectedUser(user.uid)}
                onSearch={(query) => setSearchQuery(query)}
              />
            </div>

            {/* Aura Controls */}
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
                    onClick={() => setAuraChange(prev => prev - 100)}
                    className="w-full py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    -100
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuraChange(prev => prev - 10)}
                    className="w-full py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    -10
                  </button>
                </div>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setAuraChange(prev => prev + 100)}
                    className="w-full py-3 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuraChange(prev => prev + 10)}
                    className="w-full py-3 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuraChange(0)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Reason Input - Updated padding and spacing */}
            <div className="space-y-4 pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Change
              </label>
              <div className="relative rounded-md shadow-sm">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-3 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Why are you changing this user's aura?"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Please provide a clear reason for modifying the user's aura.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || !selectedUser || auraChange === 0 || !reason.trim()}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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