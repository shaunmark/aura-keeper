import { auth } from '@/config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Session timeout in milliseconds (e.g., 1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000; 

export const setupAuthTimeout = () => {
  let timeoutId: NodeJS.Timeout;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await signOut(auth);
    }, SESSION_TIMEOUT);
  };

  // Reset timeout on user activity
  const handleUserActivity = () => {
    resetTimeout();
  };

  // Add event listeners for user activity
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('keypress', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('scroll', handleUserActivity);

  // Initial timeout setup
  resetTimeout();

  // Cleanup function
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('keypress', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    window.removeEventListener('scroll', handleUserActivity);
  };
}; 