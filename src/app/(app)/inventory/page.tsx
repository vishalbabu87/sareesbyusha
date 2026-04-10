import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { InventoryDesk } from '@/components/inventory-desk';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const data = await getBusinessData(user.id);

  return <InventoryDesk data={data} />;
}
