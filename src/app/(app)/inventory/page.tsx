

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Backpack } from "lucide-react";

export default function InventoryPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Backpack />
                    Player Inventory
                </CardTitle>
                <CardDescription>
                    This is a placeholder page. Inventory is managed on the Character Sheet.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                    <h3 className="text-2xl font-semibold">Inventory Coming Soon</h3>
                    <p className="text-muted-foreground">Character-specific inventory will be managed here.</p>
                </div>
            </CardContent>
        </Card>
    );
}
