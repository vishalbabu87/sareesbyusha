import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { ExpenseDesk } from '@/components/expense-desk';

export const dynamic = 'force-dynamic';

export default async function ExpensePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const data = await getBusinessData(user.id);
  return <ExpenseDesk data={data} />;
}
