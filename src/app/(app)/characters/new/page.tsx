
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CharacterCreator = dynamic(
  () => import('@/components/characters/character-creator').then((mod) => mod.CharacterCreator),
  {
    loading: () => (
        <div className="space-y-4">
            <Skeleton className="h-[70px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[50px] w-full" />
        </div>
    ),
    ssr: false,
  }
);


export default function NewCharacterPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl">Character Creator</h1>
            <p className="text-muted-foreground text-lg">
              Forge your hero. Define their past, abilities, and destiny.
            </p>
          </div>
        </div>
        
        <CharacterCreator />

      </div>
    </div>
  );
}
