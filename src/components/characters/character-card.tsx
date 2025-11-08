
import Link from 'next/link';
import Image from 'next/image';
import { type Character } from '@/types/character';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Trash2, Copy } from 'lucide-react';

interface CharacterCardProps {
  character: Pick<Character, 'id' | 'name' | 'race' | 'class' | 'level' | 'portrait'>;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

export default function CharacterCard({ character, onDelete, onCopy }: CharacterCardProps) {
  // Definitive guard clause to prevent rendering if character or its name is invalid.
  if (!character || !character.name) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(character.id);
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(character.id);
  }

  const hasPortrait = character.portrait && character.portrait.imageUrl;

  return (
    <Card className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/characters/${character.id}`} className="block">
        <div className="relative aspect-square w-full">
          {hasPortrait ? (
            <Image
              src={character.portrait!.imageUrl}
              alt={`Portrait of ${character.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={character.portrait?.imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <h3 className="font-headline text-2xl font-bold text-white">{character.name ?? 'Unnamed Character'}</h3>
          </div>
          <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={handleCopy}
              aria-label="Copy character"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
              aria-label="Delete character"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
      <CardFooter className="p-3 bg-card-foreground/5">
        <div className="flex w-full flex-wrap justify-between items-center text-xs text-muted-foreground gap-y-1">
          <Badge variant="outline" className="border-primary/50 text-primary">{`Lvl ${character.level ?? 1}`}</Badge>
          <span className="text-right w-full sm:w-auto basis-full sm:basis-auto">{`${character.race ?? 'N/A'} ${character.class ?? 'N/A'}`}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
