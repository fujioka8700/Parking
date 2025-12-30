import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
  try {
    await requireAuth();
  } catch {
    redirect('/');
  }

  return <DashboardContent />;
}
