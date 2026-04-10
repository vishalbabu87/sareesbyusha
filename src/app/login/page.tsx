export const runtime = 'edge';
import { AuthShell } from '@/components/auth-shell';
import { getHasUsers, getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const [user, hasUsers] = await Promise.all([getSessionUser(), getHasUsers()]);

  if (user) {
    redirect('/');
  }

  return <AuthShell hasUsers={hasUsers} />;
}
