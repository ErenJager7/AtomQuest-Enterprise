import { Suspense } from 'react';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading admin intelligence...</p>
      </div>
    }>
      <AdminDashboardClient />
    </Suspense>
  );
}
