import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { BillsDesk } from '@/components/bills-desk';

export const dynamic = 'force-dynamic';

export default async function BillsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const data = await getBusinessData(user.id);
  return <BillsDesk data={data} />;
}
