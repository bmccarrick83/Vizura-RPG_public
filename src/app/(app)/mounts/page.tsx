
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HorseshoeIcon } from '@/components/icons/HorseshoeIcon';

export default function MountsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <HorseshoeIcon className="h-6 w-6" />
                    Mounts
                </CardTitle>
                <CardDescription>Your trusted steeds and other means of overland transport.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                    <h3 className="text-2xl font-semibold">Your Stables are Empty</h3>
                    <p className="text-muted-foreground">Mounts your characters own will be listed here.</p>
                </div>
            </CardContent>
        </Card>
    );
}
