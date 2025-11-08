
'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adventurerPack, classPacks, findItem } from '@/lib/starting-packs';
import { Item } from '@/lib/types';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ItemSelectionDialog } from './item-selection-dialog';


const allPacksData = {
  "Adventurer's Pack": adventurerPack,
  ...Object.keys(classPacks).reduce((acc, key) => {
    if (key !== 'default') {
      acc[`${key} Pack`] = classPacks[key];
    }
    return acc;
  }, {} as Record<string, Item[]>),
};


function PackItem({ item, onRemove }: { item: Item, onRemove: () => void }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
            <span className="font-medium text-sm">{item.name}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function StartingPackManager({ allItems }: { allItems: Item[]}) {
  const [packs, setPacks] = useState(allPacksData);
  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRemoveItem = (packName: string, itemId: string) => {
    setPacks(prevPacks => ({
        ...prevPacks,
        [packName]: prevPacks[packName].filter(item => item.id !== itemId)
    }));
  };

  const handleAddItem = (packName: string, item: Item) => {
    setPacks(prevPacks => {
        const currentItems = prevPacks[packName];
        if (currentItems.some(i => i.id === item.id)) {
            toast({
                title: 'Item already in pack',
                variant: 'destructive'
            });
            return prevPacks;
        }
        return {
            ...prevPacks,
            [packName]: [...currentItems, item]
        }
    });
    setIsAddingItem(null);
  };
  
  const handleSavePacks = () => {
    console.log("Updated Packs Data:", packs);
    toast({
        title: "Packs Saved (in console)",
        description: "The updated pack data structure has been logged to the browser console."
    });
  }

  return (
    <>
    <ItemSelectionDialog 
        isOpen={!!isAddingItem}
        onClose={() => setIsAddingItem(null)}
        onSelectItem={(item) => {
            if (isAddingItem) {
                handleAddItem(isAddingItem, item);
            }
        }}
        allItems={allItems}
    />
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Starting Pack Editor</CardTitle>
                <CardDescription>
                View and edit the default equipment packs for new characters.
                </CardDescription>
            </div>
            <Button onClick={handleSavePacks}>
                <Save className="mr-2 h-4 w-4"/>
                Save Changes (Log to Console)
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
            {Object.entries(packs).map(([packName, items]) => (
                <AccordionItem value={packName} key={packName}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        {packName} ({items.length} items)
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                           <div className="space-y-2">
                             {items.map(item => (
                                <PackItem key={item.id} item={item} onRemove={() => handleRemoveItem(packName, item.id)} />
                             ))}
                           </div>
                           <Separator />
                           <Button variant="outline" size="sm" onClick={() => setIsAddingItem(packName)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Item to Pack
                           </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
    </>
  );
}
