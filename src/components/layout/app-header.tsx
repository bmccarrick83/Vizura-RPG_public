
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Shield, Menu, PanelLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { navItems } from './app-sidebar';
import { useRole } from '@/hooks/use-roles';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { canBeAdmin, currentView, setView } = useRole();
  const { isMobile, state: sidebarState } = useSidebar();
  
  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/login');
  };

  const getPageTitle = () => {
    const currentPath = pathname.split('?')[0];
    
    // Assume hasSpellcaster is true to check all possible routes
    for (const item of navItems(currentView, true)) { 
      if (item.href === currentPath) return item.label;
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.href === currentPath) return subItem.label;
        }
      }
    }
    // Handle dynamic routes
    if (currentPath.startsWith('/characters/new')) {
      return 'Character Creator';
    }
    if (currentPath.startsWith('/characters/')) {
      return 'Character Sheet';
    }
     if (currentPath.startsWith('/admin/assets/maps')) {
      return 'Maps';
    }
    if (currentPath.startsWith('/admin/assets')) {
      return 'Assets';
    }
    if (currentPath.startsWith('/admin')) {
        return 'Admin Console';
    }
    if (currentPath.startsWith('/campaign')) {
        return 'Campaigns';
    }
    return 'Home';
  };

  return (
    <header 
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6"
    >
      <SidebarTrigger className={cn(isMobile ? 'flex' : 'hidden')} >
        <Menu />
      </SidebarTrigger>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <SidebarTrigger className={cn('hidden md:flex', isMobile ? 'hidden' : 'flex')}>
                <PanelLeft />
             </SidebarTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{sidebarState === 'expanded' ? 'Collapse' : 'Expand'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <h1 className="text-2xl font-semibold text-foreground">
        {getPageTitle()}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        {canBeAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {currentView === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <UserIcon className="mr-2 h-4 w-4" />}
                {currentView === 'admin' ? 'Admin View' : 'Player View'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Switch View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView('player')} disabled={currentView === 'player'}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Player</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('admin')} disabled={currentView === 'admin'}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName ?? 'Adventurer'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
