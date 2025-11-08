
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Npc {
    id: string;
    name: string;
    occupation: string;
    imageUrl: string;
    imageHint: string;
    description: string;
}

export function NpcCard({ npc }: { npc: Npc }) {
    if (!npc) {
        return null;
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image src={npc.imageUrl} alt={npc.name ?? 'NPC'} data-ai-hint={npc.imageHint ?? ''} fill className="object-cover" />
                </div>
                <div>
                    <CardTitle>{npc.name ?? 'Unknown NPC'}</CardTitle>
                    <CardDescription>{npc.occupation ?? 'Wanderer'}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{npc.description ?? 'No description provided.'}</p>
            </CardContent>
        </Card>
    );
}
