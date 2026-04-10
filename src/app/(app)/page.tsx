export const runtime = 'edge';
import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { DashboardView } from '@/components/dashboard-view';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const data = await getBusinessData(user.id);

  return <DashboardView data={data} />;
}
