
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Item } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { ItemCard } from './item-card';
import { Search } from 'lucide-react';

interface ItemSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: Item) => void;
  allItems: Item[];
}

export function ItemSelectionDialog({ isOpen, onClose, onSelectItem, allItems }: ItemSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return item.name.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);
    });
  }, [searchTerm, allItems]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Item to Pack</DialogTitle>
          <DialogDescription>
            Select an item from the library to add to the starting pack.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search items..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                    {filteredItems.map(item => (
                        <ItemCard 
                            key={item.id}
                            item={item}
                            onClick={() => onSelectItem(item)}
                            isSelectable
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
