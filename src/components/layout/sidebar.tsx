
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Cat, Ghost, TramFront, Users } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { 
    label: 'Characters',
    subItems: [
        { href: '/admin/characters', label: 'Character Gallery' },
        { href: '/characters/new', label: 'Character Creator' },
        { href: '/admin/characters/feats', label: 'Feat Manager' },
    ]
  },
  { href: '/npcs', icon: Cat, label: 'NPCs' },
  { href: '/monsters', icon: Ghost, label: 'Monsters' },
  { href: '/vehicles', icon: TramFront, label: 'Vehicles' },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn('flex flex-col p-4 space-y-1', className)}>
      <h2 className="text-xl font-bold mb-4 px-3">Admin</h2>
      <nav className="flex flex-col space-y-1">
        {links.map(link => (
          link.subItems ? (
            <div key={link.label} className="space-y-1">
               <h3 className="px-3 py-2 text-sm font-semibold text-foreground">{link.label}</h3>
               <div className="flex flex-col space-y-1 pl-4">
                {link.subItems.map(subItem => (
                    <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                        pathname === subItem.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                    >
                    {subItem.label}
                    </Link>
                ))}
               </div>
            </div>
          ) : (
            <Link
              key={link.href}
              href={link.href as string}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          )
        ))}
      </nav>
    </aside>
  );
}
