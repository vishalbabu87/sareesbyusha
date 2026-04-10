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
    console.error('CRITICAL: Dashboard Failure', error);
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/50 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <div className="p-2 bg-red-400/10 rounded-lg">⚠️</div>
            <h1 className="text-xl font-bold">System Status: Error</h1>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed">
            The application encountered a runtime error. This is usually due to missing environment variables or database connectivity issues.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-500 uppercase font-bold">Error Message</span>
              <p className="text-red-300 font-mono text-sm break-words">{error?.message || 'Unknown Error'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-500 uppercase font-bold">Runtime</span>
                <p className="text-slate-300 font-mono text-sm uppercase">Cloudflare Edge</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-500 uppercase font-bold">DB Status</span>
                <p className="text-slate-300 font-mono text-sm uppercase">
                  {process.env.DATABASE_URL ? 'Variable Set' : 'Missing'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full mt-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
}
