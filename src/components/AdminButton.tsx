'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminButton() {
  const pathname = usePathname();
  
  // Don't show on admin page, login page, or plans page
  if (pathname === '/admin' || pathname === '/login' || pathname === '/plans') {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
    >
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
          d="M12 4v16m8-8H4"
        />
      </svg>
    </Link>
  );
} 