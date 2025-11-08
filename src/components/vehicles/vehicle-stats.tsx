'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicleData } from '@/lib/vehicles';
import { TramFront } from 'lucide-react';

export function VehicleStats() {
  return (
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <TramFront className="h-6 w-6"/>
                <CardTitle className="text-2xl">Vehicle Stats</CardTitle>
            </div>
            <CardDescription>Details and rules for various vehicles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Damage Die</TableHead>
                <TableHead>Qualities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleData.map((vehicle) => (
                <TableRow key={vehicle.type}>
                  <TableCell className="font-medium">{vehicle.type}</TableCell>
                  <TableCell>{vehicle.size}</TableCell>
                  <TableCell>{vehicle.description}</TableCell>
                  <TableCell>{vehicle.damageDie}</TableCell>
                  <TableCell>{vehicle.qualities}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
