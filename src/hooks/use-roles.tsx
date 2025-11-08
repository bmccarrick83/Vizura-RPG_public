
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';

// --- Hardcoded list of admin emails ---
const DUAL_ROLE_EMAILS = ['bmccarrrick83@gmail.com', 'gmhelperviz@gmail.com'];

type View = 'player' | 'admin';

interface RoleContextType {
  isAdmin: boolean;
  canBeAdmin: boolean;
  currentView: View;
  setView: (view: View) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const canBeAdmin = !isUserLoading && user?.email ? DUAL_ROLE_EMAILS.includes(user.email) : false;
  const currentView = canBeAdmin && pathname.startsWith('/admin') ? 'admin' : 'player';
  const isAdmin = currentView === 'admin';

  useEffect(() => {
    // Do not run logic until authentication state is fully resolved.
    if (isUserLoading) {
      return;
    }

    // If a user is not authorized for admin access but tries to navigate to an admin path,
    // redirect them to the player home page.
    if (!canBeAdmin && pathname.startsWith('/admin')) {
      router.replace('/home');
    }
  }, [isUserLoading, user, canBeAdmin, pathname, router]);
  
  const setView = useCallback((view: View) => {
    if (view === currentView) return;

    if (view === 'admin' && canBeAdmin) {
      router.push('/admin');
    } else { // Default to player view
      // If currently in an admin path, redirect to home, otherwise stay on the current player page.
      const newPath = pathname.startsWith('/admin') ? '/home' : pathname;
      router.push(newPath);
    }
  }, [canBeAdmin, router, currentView, pathname]);

  // To prevent layout shifts or premature rendering, we can return a loading state
  // or null until the user's status is confirmed.
  if (isUserLoading) {
    return null; // Or a full-page skeleton loader
  }

  return (
    <RoleContext.Provider value={{ isAdmin, canBeAdmin, currentView, setView }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
