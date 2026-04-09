import { AuthShell } from '@/components/auth-shell';
import { SareeStudioApp } from '@/components/saree-studio-app';
import { getHasUsers, getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [user, hasUsers] = await Promise.all([getSessionUser(), getHasUsers()]);

  if (!user) {
    return <AuthShell hasUsers={hasUsers} />;
  }

  const initialData = await getBusinessData(user.id);

  return <SareeStudioApp initialData={initialData} userName={user.name} userEmail={user.email} />;
}
