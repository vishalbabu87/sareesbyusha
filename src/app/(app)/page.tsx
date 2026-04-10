export const runtime = 'edge';
import { getSessionUser } from '@/lib/auth';
import { getBusinessData } from '@/lib/server-data';
import { DashboardView } from '@/components/dashboard-view';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const user = await getSessionUser();
    if (!user) {
      console.error('No session user found');
      return <div>Unauthorized. Please log in.</div>;
    }

    const data = await getBusinessData(user.id);
    return <DashboardView data={data} />;
  } catch (error: any) {
    console.error('Dashboard Error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Data Loading Error</h1>
        <p>{error?.message || 'Unknown error occurred'}</p>
        <pre style={{ fontSize: '10px' }}>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
