
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function NpcManagerPage() {
    return (
        <div className="space-y-6">
             <h1 className="text-4xl">NPC Manager</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Manage NPCs</CardTitle>
                    <CardDescription>Create and manage Non-Player Characters for your campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                        <h3 className="text-2xl font-semibold">No NPCs Created Yet</h3>
                        <p className="text-muted-foreground">Add NPCs to bring your world to life.</p>
                        <Button size="lg">
                        <UserPlus className="mr-2 h-5 w-5" /> Create New NPC
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
