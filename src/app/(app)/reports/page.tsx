export const runtime = 'edge';
import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { ReportsView } from '@/components/reports-view';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const data = await getBusinessData(user.id);
  return <ReportsView data={data} />;
}
