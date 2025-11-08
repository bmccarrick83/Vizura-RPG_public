
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PartyMember {
    id: string;
    name: string;
    class: string;
    level: number;
    imageUrl: string;
    imageHint: string;
}

export function PartyCard({ member }: { member: PartyMember }) {
    if (!member) {
        return null;
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image src={member.imageUrl} alt={member.name ?? 'Party member'} data-ai-hint={member.imageHint ?? ''} fill className="object-cover" />
                </div>
                <div>
                    <CardTitle>{member.name ?? 'Unknown Member'}</CardTitle>
                    <CardDescription>Lvl {member.level ?? 1} {member.class ?? 'Adventurer'}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}
