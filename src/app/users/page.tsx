import { Suspense } from 'react';
import UserHistory from '@/components/UserHistory';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UserPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UserHistory />
    </Suspense>
  );
} 