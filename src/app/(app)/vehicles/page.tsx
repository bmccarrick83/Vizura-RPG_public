
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { allItems, isVehicle } from '@/lib/item-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Vehicle } from '@/lib/types';

export default function VehiclesPage() {
    const vehicles = allItems.filter(isVehicle);
    
    if (vehicles.length === 0) return (
      <div>
        <h1 className="text-5xl font-headline">Vehicles</h1>
        <p className="text-muted-foreground text-lg mt-2">
          You do not own any vehicles.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-5xl font-headline">Vehicles</h1>
        <p className="text-muted-foreground text-lg">
          Your owned and operated vehicles.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       {vehicles.map(vehicle => (
         <Card key={vehicle.id} className="flex flex-col">
            <CardHeader>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                            <Rocket className="text-primary" />
                            {vehicle.name}
                        </CardTitle>
                        {vehicle.rarity && <Badge variant="outline" className="border-amber-500 text-amber-500 whitespace-nowrap">{vehicle.rarity}</Badge>}
                    </div>
                    <CardDescription>{vehicle.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
            <div className="space-y-4">
                    <div>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/20 flex items-center justify-center">
                            <Rocket className="h-24 w-24 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-headline text-2xl">Specifications</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            {vehicle.cost && <li>Cost: <span className="font-semibold text-foreground">{vehicle.cost.toLocaleString()} Gold Crowns</span></li>}
                            <li>Weight: <span className="font-semibold text-foreground">{vehicle.weight.toLocaleString()} lbs</span></li>
                            <li>Type: <span className="font-semibold text-foreground">Interdimensional craft (multi-legged)</span></li>
                            <li>Crew: <span className="font-semibold text-foreground">{vehicle.crew}</span></li>
                            <li>Capacity: <span className="font-semibold text-foreground">{vehicle.name === 'Phase-Craft (Military)' ? '6 soldiers / passengers' : `${vehicle.passenger} Passengers`}</span></li>
                            <li>Primary Power: <span className="font-semibold text-foreground">Phase crystal arrays</span></li>
                        </ul>
                    </div>
            </div>
            </CardContent>
        </Card>
       ))}
      </div>
    </div>
  );
}
