
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  Users,
  ScrollText,
  Swords,
  Shield,
  UserSquare,
  Ghost,
  BookText,
  ImageIcon,
  TramFront,
  BookOpen,
  Star,
  Trophy,
  BookMarked,
  ChevronDown,
  User,
  Library,
  PanelLeft,
} from 'lucide-react';
import { useRole } from '@/hooks/use-roles';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Character } from '@/types/character';
import { cn } from '@/lib/utils';
import { HorseshoeIcon } from '../icons/HorseshoeIcon';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarFooter, useSidebar, SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';

const SPELLCASTING_CLASSES = ["Magus Acolyte", "Healer", "Pilot", "Druid", "Warlock", "Magus Neophyte", "Magus Adeptus", "Magus Theotechnus", "Magus Minor", "Magus Prestijus", "Magus major", "Magus Chief"];

export const navItems = (view: 'player' | 'admin', hasSpellcaster: boolean) => {
  if (view === 'admin') {
    return [
      { href: '/admin', icon: Shield, label: 'Admin Console' },
      {
        href: '/admin/campaign',
        icon: ScrollText,
        label: 'Campaign',
      },
      {
        href: '/admin/assets',
        icon: ImageIcon,
        label: 'Asset Manager',
      },
      {
        href: '/admin/content',
        icon: Library,
        label: 'Content',
        subItems: [
          { href: '/admin/feats', label: 'Feat Library' },
          { href: '/admin/items', label: 'Item Library' },
          { href: '/admin/bookshelf', label: 'Bookshelf' },
        ]
      },
      { href: '/npcs', icon: UserSquare, label: 'NPCs' },
      { href: '/monsters', icon: Ghost, label: 'Monsters' },
    ];
  }

  // Player view
  const playerNav = [
    { href: '/home', icon: House, label: 'Home' },
    {
      href: '/characters',
      icon: Users,
      label: 'Characters',
      subItems: [
        { href: '/characters', label: 'Character Gallery' },
        { href: '/characters/new', label: 'Character Creator' },
      ],
    },
    {
        href: '/solo-campaign',
        icon: User,
        label: 'Solo Campaign'
    },
    { 
        href: '/bookshelf',
        icon: BookMarked,
        label: 'Bookshelf',
    },
    { href: '/vehicles', icon: TramFront, label: 'Vehicles' },
    { href: '/mounts', icon: HorseshoeIcon, label: 'Mounts' },
    { href: '/combat', icon: Swords, label: 'Combat' },
    { href: '/journal', icon: BookText, label: 'Journal' },
    { href: '/achievements', icon: Trophy, label: 'Achievements' },
  ];

  if (hasSpellcaster) {
      const charactersItem = playerNav.find(item => item.label === 'Characters');
      if (charactersItem && charactersItem.subItems) {
          charactersItem.subItems.push({ href: '/characters/spellbook', label: 'Spellbook' });
      }
  }

  return playerNav;
};


function NavMenu() {
    const pathname = usePathname();
    const { user } = useUser();
    const firestore = useFirestore();
    const { currentView } = useRole();
    const router = useRouter();
    const { state: sidebarState } = useSidebar();
    const isCollapsed = sidebarState === 'collapsed';
    
    const charactersRef = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return collection(firestore, 'users', user.uid, 'characters');
    }, [firestore, user?.uid]);

    const { data: characters } = useCollection<Character>(charactersRef);

    const hasSpellcaster = useMemo(() => {
        if (!characters) return false;
        return characters.some(char => SPELLCASTING_CLASSES.includes(char.class));
    }, [characters]);

    const currentNavItems = useMemo(() => navItems(currentView, hasSpellcaster), [currentView, hasSpellcaster]);
    
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        currentNavItems.forEach((item) => {
          if (item.subItems && pathname.startsWith(item.href)) {
            initialState[item.label] = true;
          }
        });
        return initialState;
    });

    useEffect(() => {
        if (isCollapsed) {
            setOpenSubMenus({});
        }
    }, [isCollapsed]);

    const toggleSubMenu = (label: string) => {
        if (isCollapsed) return;
        setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleItemClick = (href: string, hasSubItems: boolean, label: string) => {
        if (hasSubItems) {
            toggleSubMenu(label);
        } else {
            router.push(href);
        }
    };
    
    return (
        <SidebarMenu>
            {currentNavItems.map(item => (
                <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                        onClick={() => handleItemClick(item.href, !!item.subItems, item.label)} 
                        isActive={pathname.startsWith(item.href) && (!item.subItems || pathname === item.href)}
                        tooltip={{children: item.label}}
                        data-state={openSubMenus[item.label] ? 'open' : 'closed'}
                    >
                        <item.icon />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        {item.subItems && <ChevronDown className="ml-auto transition-transform data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden"/>}
                    </SidebarMenuButton>
                    {!isCollapsed && item.subItems && openSubMenus[item.label] && (
                        <SidebarMenuSub>
                            {item.subItems.map(subItem => (
                                <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                        <Link href={subItem.href}>{subItem.label}</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <Link href="/home" className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                        <div className="block group-data-[collapsible=icon]:hidden">
                             <Button variant="outline" size="sm" className="font-headline text-lg bg-transparent text-primary hover:bg-primary/10 hover:text-primary border-primary/30">VRPG</Button>
                        </div>
                        <div className="hidden group-data-[collapsible=icon]:block">
                             <span className="font-headline text-4xl text-primary font-bold">V</span>
                        </div>
                    </div>
                     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <h2 className="text-xl font-semibold text-primary">VIZURA</h2>
                        <p className="text-xs text-foreground/80">RPG Companion</p>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMenu />
            </SidebarContent>
             <SidebarFooter>
                
            </SidebarFooter>
        </Sidebar>
    );
}
