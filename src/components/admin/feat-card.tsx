
'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Feat } from "@/lib/feat-data";
import { Star, Trash2, Pencil, Copy, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatCardProps {
    feat?: Feat | null;
    onDelete?: () => void;
    onEdit?: () => void;
    onClone?: () => void;
}

export function FeatCard({ feat, onDelete, onEdit, onClone }: FeatCardProps) {
    if (!feat || !feat.name) {
        return null;
    }

    return (
      <Card className="relative group/featcard overflow-hidden">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpenCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    {feat.name}
                </CardTitle>
                <CardDescription className="text-xs pt-1">{feat.description || 'No description'}</CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
                {feat.prerequisite && <p className="text-xs text-blue-400 mt-1">Prerequisite: {feat.prerequisite}</p>}
            </CardFooter>
            
            {(onEdit || onDelete || onClone) && (
              <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/featcard:opacity-100 transition-opacity">
                  {onClone && (
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onClone(); }}
                        title="Clone feat"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                         title="Edit feat"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                         title="Delete feat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            )}
        </Card>
    );
}
