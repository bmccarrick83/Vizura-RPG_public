
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, AlertTriangle } from 'lucide-react';
import CharacterCard from '@/components/characters/character-card';
import { type Character } from '@/types/character';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useMemo } from 'react';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'dashboard-hero');
  const { user } = useUser();
  const firestore = useFirestore();

  const recentCharactersRef = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'characters'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore, user?.uid]);

  const { data: recentCharacters, isLoading, error } = useCollection<Character>(recentCharactersRef);

  return (
    <div className="flex-1 space-y-8">
      <section>
        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-lg">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-5xl font-bold text-primary shadow-black [text-shadow:2px_2px_4px_var(--tw-shadow-color)]">
              Welcome, Adventurer
            </h1>
            <p className="mt-2 max-w-xl text-lg text-white/90 shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">
              Your journey begins here. Manage your heroes, track your quests, and conquer your world.
            </p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl">Recent Characters</CardTitle>
          <Button asChild variant="ghost">
            <Link href="/characters">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Characters</AlertTitle>
                <AlertDescription>
                   There was a problem fetching your recent characters. This might be a temporary issue. Please try refreshing the page. If the problem persists, it could be due to a missing Firestore index.
                   <pre className="mt-2 text-xs bg-destructive/20 p-2 rounded-md overflow-x-auto">{error.message}</pre>
                </AlertDescription>
            </Alert>
          ) : recentCharacters && recentCharacters.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentCharacters.map((char) => (
                <CharacterCard key={char.id} character={char} onDelete={() => {}} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <h3 className="text-xl font-semibold">No Characters Yet</h3>
              <p className="text-muted-foreground">It&apos;s time to create your first hero!</p>
              <Button asChild>
                <Link href="/characters/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Character
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
     </div>
  );
}
