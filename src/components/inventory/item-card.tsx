
'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, Rarity } from "@/lib/types";
import { isArmor, isConsumable, isMount, isVehicle, isWeapon } from "@/lib/item-data";
import { Swords, Shield, Heart, Weight, Rocket, Trash2, Coins, Pencil, Star, Copy } from "lucide-react";
import { HorseIcon } from "../icons/HorseIcon";
import { cn } from "@/lib/utils";
import { allStartingPackItemIds } from "@/lib/starting-packs-data";

interface ItemCardProps {
    item: Item;
    onDelete?: () => void;
    onEdit?: () => void;
    onClone?: () => void;
    onClick?: () => void;
    isSelectable?: boolean;
}

const rarityStyles: Record<Rarity, string> = {
    'Common': 'bg-rarity-common-bg text-rarity-common-fg',
    'Uncommon': 'bg-rarity-uncommon-bg text-rarity-uncommon-fg',
    'Rare': 'bg-rarity-rare-bg text-rarity-rare-fg',
    'Very Rare': 'bg-rarity-veryRare-bg text-rarity-veryRare-fg',
    'Extremely Rare': 'bg-rarity-extremelyRare-bg text-rarity-extremelyRare-fg',
    'Legendary': 'bg-rarity-legendary-bg text-rarity-legendary-fg',
};

export function ItemCard({ item, onDelete, onEdit, onClone, onClick, isSelectable = false }: ItemCardProps) {

    if (!item) {
        return null;
    }

    const formatCost = (cost?: number): string => {
        if (cost === undefined || cost === null || isNaN(cost)) {
            return 'N/A';
        }
        if (cost === 0) {
            return '0 CP';
        }

        let remainingCost = cost;
        const parts: string[] = [];

        const gold = Math.floor(remainingCost / 100);
        if (gold > 0) {
            parts.push(`${gold.toLocaleString()} GC`);
            remainingCost %= 100;
        }

        const silver = Math.floor(remainingCost / 10);
        if (silver > 0) {
            parts.push(`${silver.toLocaleString()} SC`);
            remainingCost %= 10;
        }

        if (remainingCost > 0) {
            parts.push(`${remainingCost.toLocaleString()} CP`);
        }

        return parts.join(', ');
    }

    const renderItemProperties = () => {
        if (isWeapon(item) && item.damage) {
            return (
                <div className="flex items-center gap-1">
                    <Swords className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{item.damage}</span>
                </div>
            )
        }
        if (isArmor(item) && item.ac) {
            return (
                 <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">AC +{item.ac}</span>
                </div>
            )
        }
         if (isConsumable(item) && item.effect) {
            return (
                 <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{item.effect}</span>
                </div>
            )
        }
        if (isVehicle(item) && item.speed) {
            return (
                 <div className="flex items-center gap-1">
                    <Rocket className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{item.speed}</span>
                </div>
            )
        }
        if (isMount(item) && item.speed) {
            return (
                 <div className="flex items-center gap-1">
                    <HorseIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">Speed: {item.speed}</span>
                </div>
            )
        }
        return null;
    }

    const isStartingItem = allStartingPackItemIds.has(item.id);

    const cardContent = (
      <Card className={cn("relative group/itemcard overflow-hidden", isSelectable && "cursor-pointer hover:border-primary")}>
            <CardHeader className="p-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{item.name ?? 'Unnamed Item'}</CardTitle>
                        {isStartingItem && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                                <Star className="h-3 w-3 mr-1" />
                                Starter
                            </Badge>
                        )}
                    </div>
                  {item.rarity && <Badge className={cn("whitespace-nowrap", rarityStyles[item.rarity])}>{item.rarity}</Badge>}
                </div>
                <CardDescription className="text-xs">{item.description ?? 'No description.'}</CardDescription>
            </CardHeader>
            <CardFooter className="p-3 bg-muted/50 flex justify-between items-center text-xs">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3 text-muted-foreground" />
                        <span>{item.weight ?? 0} lbs</span>
                    </div>
                    {renderItemProperties()}
                     <div className="flex items-center gap-1 text-amber-400">
                        <Coins className="h-3 w-3" />
                        <span>{formatCost(item.cost)}</span>
                    </div>
                </div>
                {item.category && <Badge variant="outline">{item.category}</Badge>}
            </CardFooter>
            {(onEdit || onDelete || onClone) && (
              <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover/itemcard:opacity-100 transition-opacity">
                  {onClone && (
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onClone?.(); }}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            )}
        </Card>
    )

    if (isSelectable) {
        return <div onClick={onClick}>{cardContent}</div>;
    }

    return cardContent;
}

    