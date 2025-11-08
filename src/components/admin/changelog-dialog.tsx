
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ChangelogEntry = {
  version: string;
  date: string;
  tasks: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: 'v1.0.0-a.7',
    date: '2025-11-03',
    tasks: [
      'Fixed the Solo Campaign Procedural Map UI issues.',
      'Added a Quick Start button and pre-gen character feature.',
      'Revamped Admin page.',
    ],
  },
  {
    version: 'v1.0.0-a.6',
    date: '2025-11-02',
    tasks: [
        'Corrected calculation for "To Do" items on the Admin Dashboard Cumulative Flow Diagram (CFD).',
        'Acknowledged and reverted failed installation of a non-existent NPM package.',
    ],
  },
  {
    version: 'v1.0.0-a.5',
    date: '2025-11-01',
    tasks: [
      'Implemented Thief class rank progression system.',
      'Created and refined a contextual preamble for the NPC AI chatbot.',
      'Established a separate file for the NPC chatbot prompt (`NPC-chatbot-prompt.ts`).',
      'Set a default `maxOutputTokens` value for AI generation to ensure consistent response length.',
    ],
  },
  {
    version: 'v1.0.0-a.4',
    date: '2025-10-31',
    tasks: [
      'Fixed sorting and data calculation on the Admin Dashboard.',
      'Implemented Pilot rank progression system.',
      'Added new Engineer backgrounds and descriptions.',
      'Established degree system for Demon and Monster Hunters.',
      'Implemented consequences for multiclassing into Thief, including Leadership penalties.',
      'Added "Rite of Jinn-a" feat and "Sand Shift" spell for Warlocks.',
      'Moved Player Handbook to an editable "Bookshelf" in the Admin Console.',
      'Added image upload for Player Handbook cover.',
      'Corrected and updated the Horseshoe icon.',
    ],
  },
  {
    version: 'v1.0.0-a.3',
    date: '2025-10-30',
    tasks: [
      'Added "Feat Library" to Admin Console for creating, editing, and managing feats.',
      'Implemented updated "Battle Rage" mechanics with scaling rage points and UI tracker.',
      'Updated "Sniper" feat description with detailed rules for cover and location reveal.',
      'Added the "Hide expert" feat to utilize cover mechanics.',
      'Updated the "Tough" feat description to increase hit points by 2.',
      'Added new noble and royalty backgrounds (e.g., Duke, Sultan, Sudaran, Mizarian).',
      'Extended the military ranking system to the Engineer class.',
      'Added a "melee" property to appropriate weapons like swords and daggers.',
      'Added "Moon-Silk Padded Armor" to the item library.',
    ],
  },
  {
    version: 'v1.0.0-a.2',
    date: '2025-10-29',
    tasks: [
      'Added "Draw Boundary" feature to world map generator.',
      'Implemented tie-breaker roll logic for combat attacks.',
      'Refined map generation to create smoother coastlines and more distinct biomes.',
      'Adjusted mountain generation for better visual balance.',
      'Fixed various map rendering artifacts, including grid lines and overlapping tiles.',
      'Added buttons to clear labels and reset generated features (rivers, roads) on the map.',
      'Improved visibility of roads and borders on the map.',
    ],
  },
  {
    version: 'v1.0.0-a.1',
    date: '2025-10-28',
    tasks: [
      'Implemented "GM Mode" on the Campaign page.',
      'Added UI for managing homebrew rules, maps, and artwork in GM Mode.',
      'Centralized RoleProvider in the root layout to fix state loss on navigation.',
      'Corrected admin sidebar links to point to /admin sub-routes.',
      'Removed separate admin layout in favor of a unified player/admin view.',
      'Created dedicated pages for NPC and Monster management.',
      'Implemented Admin/Player view switching.',
      'Overhauled Admin page with tabbed layout for Dashboard and Project Board.',
      'Added color-coded task cards and manual task creation to Kanban board.',
      'Updated Campaign page with tabs for NPCs, Monsters, and GM Settings.',
      'Implemented Solo Mode functionality on the Campaign page.',
      'Added a dedicated Vehicles page and integrated it into the Character Sheet.',
      'Enabled portrait customization via URL or file upload in the Character Editor.',
      'Renamed "Dashboard" to "Home" and updated its icon.',
      'Updated colors on CFD chart and Kanban board for better status visibility.',
    ],
  },
  {
    version: 'v1.0.0-a.0',
    date: '2025-10-27',
    tasks: [
      'Initial project setup with Next.js and Firebase.',
      'Implemented user authentication (Email/Password & Google).',
      'Created basic layout with sidebar and header.',
      'Added pages for Dashboard, Characters, Inventory, and Admin.',
      'Set up Kanban board for project management.',
      'Implemented new Admin Dashboard UI.',
      'Added Cumulative Flow Diagram for task tracking.',
      'Created a changelog dialog to view recent updates.',
      'Standardized font styles across the application.',
    ],
  },
];

export function ChangelogDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Application Changelog</DialogTitle>
          <DialogDescription>
            A record of all the magic and hard work poured into Vizura RPG
            Companion.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-6">
            {changelog.map((entry, index) => (
              <div key={entry.version + '-' + index}>
                <div className="flex items-center gap-4">
                  <h3 className="font-headline text-xl">{entry.version}</h3>
                  <Badge variant="outline">{entry.date}</Badge>
                </div>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  {entry.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
                {index < changelog.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
