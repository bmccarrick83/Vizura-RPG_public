
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';

interface Creature {
    id: string;
    name: string;
    type: string;
    difficulty: string;
    imageUrl: string;
    imageHint: string;
}

export function CreatureCard({ creature }: { creature: Creature }) {
    if (!creature) {
        return null;
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{creature.name ?? 'Unknown Creature'}</CardTitle>
                    <CardDescription>{creature.type ?? 'Unknown Type'}</CardDescription>
                </div>
                <Badge variant="outline">DL {creature.difficulty ?? '?'}</Badge>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                    <Image src={creature.imageUrl} alt={creature.name ?? 'creature image'} data-ai-hint={creature.imageHint ?? ''} fill className="object-cover" />
                </div>
            </CardContent>
        </Card>
    );
}
