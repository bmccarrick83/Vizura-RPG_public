
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookText, Dices, Star, User, MessageSquare, BrainCircuit, Ghost } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockJournalEntries = [
  { 
    type: 'combat', 
    actor: 'Aelar',
    content: 'Aelar attacked the Goblin, rolling a 17 and hitting for 8 damage.', 
    timestamp: '3m ago' 
  },
  { 
    type: 'feat', 
    actor: 'Grom',
    content: 'Grom acquired the "Tough" feat, increasing their resilience.', 
    timestamp: '1h ago' 
  },
  { 
    type: 'skill', 
    actor: 'Lyra',
    content: 'Lyra successfully picked the lock on the ancient chest (Lockpicking check: 21).', 
    timestamp: '2h ago',
    skill: 'Pickpocket'
  },
  { 
    type: 'npc', 
    actor: 'Party',
    content: 'Met Elara, the mysterious tavern keeper. She seems to know more than she lets on.', 
    timestamp: '1d ago',
    npc: 'Elara'
  },
  {
    type: 'monster',
    actor: 'Party',
    content: 'The party encountered a fearsome Dire Wolf in the woods.',
    timestamp: '1d ago',
    monster: 'Dire Wolf',
    imageUrl: 'https://picsum.photos/seed/direwolf/200/200',
    imageHint: 'large wolf'
  },
  { 
    type: 'story', 
    actor: 'Party',
    content: 'The party entered the Whispering Woods, an eerie silence hanging in the air.', 
    timestamp: '1d ago' 
  },
];

function JournalEntryIcon({ type }: { type: string }) {
    switch(type) {
        case 'combat': return <Dices className="h-5 w-5 text-red-400" />;
        case 'feat': return <Star className="h-5 w-5 text-yellow-400" />;
        case 'skill': return <BrainCircuit className="h-5 w-5 text-blue-400" />;
        case 'npc': return <User className="h-5 w-5 text-green-400" />;
        case 'story': return <MessageSquare className="h-5 w-5 text-purple-400" />;
        case 'monster': return <Ghost className="h-5 w-5 text-orange-400" />;
        default: return <BookText className="h-5 w-5 text-muted-foreground" />;
    }
}


export default function JournalPage() {

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Campaign Journal</h1>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Log Entries</CardTitle>
                <CardDescription>A record of your party's adventures, actions, and notable events.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4 bg-muted/30">
                {mockJournalEntries.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Your journal is empty. Begin your adventure to start logging events.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {mockJournalEntries.map((entry, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-4 text-sm">
                                <JournalEntryIcon type={entry.type} />
                                <div className="flex-1 space-y-2">
                                    <p className="text-foreground/90">{entry.content}</p>
                                    {entry.type === 'monster' && entry.imageUrl && (
                                      <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                                        <Image src={entry.imageUrl} alt={entry.monster!} data-ai-hint={entry.imageHint!} fill className="object-cover" />
                                      </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <Badge variant="outline" className="capitalize mb-1">{entry.type}</Badge>
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-semibold">{entry.actor}</span> - {entry.timestamp}
                                    </p>
                                </div>
                            </div>
                            {index < mockJournalEntries.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                    </div>
                )}
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
