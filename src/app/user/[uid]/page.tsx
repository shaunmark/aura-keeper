import { auraService } from '@/services/aura.service';
import UserHistory from '@/components/UserHistory';

export async function generateStaticParams() {
  try {
    const auras = await auraService.getAllAurasWithUsernames();
    return auras.map((aura) => ({
      uid: aura.uid,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default function UserPage() {
  return <UserHistory />;
} 