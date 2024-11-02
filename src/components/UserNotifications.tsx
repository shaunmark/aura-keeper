'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { auraService } from '@/services/aura.service';
import { userService } from '@/services/user.service';

interface AuraNotification {
  timestamp: string;
  change: number;
  reason?: string;
  changedByUsername: string;
}

export default function UserNotifications() {
  const { user } = useFirebase();
  const [notifications, setNotifications] = useState<AuraNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const auraData = await auraService.getAura(user.uid);
        if (!auraData) return;

        // Get all unique user IDs who made changes
        const changedByUsers = Array.from(new Set(auraData.history.map(h => h.changedByUid)));
        
        // Fetch all usernames at once
        const userProfiles = await Promise.all(
          changedByUsers.map(uid => userService.getProfile(uid))
        );
        const userMap = Object.fromEntries(
          userProfiles.map(profile => [profile?.uid || '', profile?.username || 'Unknown User'])
        );

        // Create notifications from history
        const notificationData = auraData.history
          .map(item => ({
            timestamp: item.timestamp,
            change: item.change,
            reason: item.reason,
            changedByUsername: userMap[item.changedByUid] || 'Unknown User'
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Your Aura Updates</h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.changedByUsername} {notification.change > 0 ? 'increased' : 'decreased'} your aura by {Math.abs(notification.change)}
                  </p>
                  {notification.reason && (
                    <p className="mt-1 text-sm text-gray-500">
                      Reason: {notification.reason}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  notification.change > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {notification.change > 0 ? '+' : ''}{notification.change}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No aura updates yet
          </div>
        )}
      </div>
    </div>
  );
} 