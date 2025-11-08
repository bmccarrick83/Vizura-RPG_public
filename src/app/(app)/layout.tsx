
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignProvider } from '@/components/campaign/campaign-provider';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="w-full max-w-4xl p-4">
            <div className="flex gap-4">
                <Skeleton className="hidden h-[95vh] w-64 md:block" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-[80vh] w-full" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CampaignProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </CampaignProvider>
    </SidebarProvider>
  );
}
