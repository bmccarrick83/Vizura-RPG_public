
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Copy } from 'lucide-react';
import { allItems as initialItems, type Item } from "@/lib/item-data";
import { ItemCard } from "@/components/inventory/item-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EditItemDialog } from './edit-item-dialog';
import { StartingPackManager } from './starting-pack-manager';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

const categories = ['All', 'Starting Pack', 'Weapon', 'Armor', 'Consumable', 'Vehicle', 'Mount', 'Currency', 'Backpack', 'Cloak/Coat', 'Item'];

export function ItemLibrary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [items, setItems] = useState<Item[]>(initialItems);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const { toast } = useToast();

    const filteredItems = useMemo(() => {
        if (activeTab === 'Starting Pack') return [];

        return items.filter(item => {
            const matchesCategory = activeTab === 'All' || item.category === activeTab;
            if (!matchesCategory) return false;

            const term = searchTerm.toLowerCase();
            if (!term) return true;

            const nameMatch = item.name.toLowerCase().includes(term);
            const descriptionMatch = item.description?.toLowerCase().includes(term) || false;
            
            return nameMatch || descriptionMatch;
        });
    }, [searchTerm, activeTab, items]);

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
    };

    const handleSaveItem = (updatedItem: Item) => {
        const newItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
        setItems(newItems);
        setEditingItem(null);
    };
    
    const handleDeleteItem = (itemId: string) => {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
    };
    
    const handleCloneItem = (itemToClone: Item) => {
        const newId = `${itemToClone.id}-clone-${Date.now()}`;
        const clonedItem: Item = {
            ...itemToClone,
            id: newId,
            name: `${itemToClone.name} (Copy)`,
        };
        setItems(prev => [clonedItem, ...prev]);
        toast({
            title: "Item Cloned",
            description: `A copy of "${itemToClone.name}" has been created.`,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search all items..."
                        className="pl-10 text-lg h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-auto flex-wrap justify-start">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => (
                    <TabsContent key={category} value={category} className="mt-4">
                        {category === 'Starting Pack' ? (
                            <StartingPackManager allItems={items} />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredItems.map(item => (
                                        <ItemCard 
                                            key={item.id} 
                                            item={item} 
                                            onEdit={() => handleEditItem(item)}
                                            onDelete={() => handleDeleteItem(item.id)}
                                            onClone={() => handleCloneItem(item)}
                                         />
                                    ))}
                                </div>
                                 {filteredItems.length === 0 && activeTab !== 'Starting Pack' && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <p>No items found matching your criteria.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
            {editingItem && (
                <EditItemDialog
                    item={editingItem}
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSaveItem}
                />
            )}
        </div>
    );
}
