
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpellbookIcon } from '@/components/icons/SpellbookIcon';

export default function SpellbookPage() {
    return (
        <div className="space-y-6">
             <h1 className="text-4xl">Spellbook</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <SpellbookIcon className="h-6 w-6" />
                        Known Spells
                    </CardTitle>
                    <CardDescription>All the spells your characters have learned.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                        <h3 className="text-2xl font-semibold">The Grimoire is Empty</h3>
                        <p className="text-muted-foreground">Spells known by your characters will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
