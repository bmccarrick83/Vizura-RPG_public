
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function MonsterManagerPage() {
    return (
        <div className="space-y-6">
             <h1 className="text-4xl">Monster Manager</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Manage Monsters</CardTitle>
                    <CardDescription>Manage the monstrous foes for your adventurers to face.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                        <h3 className="text-2xl font-semibold">No Monsters Defined Yet</h3>
                        <p className="text-muted-foreground">Create monsters to challenge your players.</p>
                        <Button size="lg">
                        <UserPlus className="mr-2 h-5 w-5" /> Create New Monster
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
