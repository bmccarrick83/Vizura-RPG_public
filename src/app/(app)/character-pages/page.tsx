
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CharacterCard from '@/components/characters/character-card';
import { type Character } from '@/types/character';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


export default function CharactersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const charactersRef = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'characters');
  }, [firestore, user?.uid]);

  const { data: characters, isLoading } = useCollection<Character>(charactersRef);

  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);

  const handleDeleteRequest = (characterId: string) => {
    setCharacterToDelete(characterId);
  };

  const confirmDelete = async () => {
    if (characterToDelete && user && firestore) {
      const docRef = doc(firestore, 'users', user.uid, 'characters', characterToDelete);
      await deleteDoc(docRef);
      setCharacterToDelete(null);
    }
  };

  const handleCopyCharacter = async (characterId: string) => {
    if (!charactersRef || !characters) return;

    const characterToCopy = characters.find(c => c.id === characterId);
    if (!characterToCopy) {
      toast({ title: "Error", description: "Character to copy not found.", variant: "destructive" });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...copyData } = characterToCopy;

    const newCharacterData = {
      ...copyData,
      name: `${characterToCopy.name} (Copy)`,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(charactersRef, newCharacterData);
      toast({
        title: "Character Copied",
        description: `A copy of ${characterToCopy.name} has been created.`,
      });
    } catch (error) {
      console.error("Error copying character:", error);
      toast({ title: "Error", description: "Failed to copy character.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-11 w-48" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-4xl">Character Gallery</h1>
          <Button asChild size="lg">
            <Link href="/characters/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Character
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {characters && characters.map((char) => (
            <CharacterCard key={char.id} character={char} onDelete={handleDeleteRequest} onCopy={handleCopyCharacter} />
          ))}
        </div>
        {characters && characters.length === 0 && (
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
      </div>

      <AlertDialog open={!!characterToDelete} onOpenChange={(isOpen) => !isOpen && setCharacterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this character.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCharacterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
