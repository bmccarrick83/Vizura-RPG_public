

import type { Item } from './types';
import { allItems } from './item-data';
import packData from './starting-packs.json';

export const findItem = (id: string): Item => {
    const item = allItems.find(i => i.id === id);
    if (!item) {
        throw new Error(`Could not find item with id: ${id}`);
    }
    return item;
};

// Function to resolve item IDs from the JSON file to full item objects
const resolvePackItems = (itemIds: string[]): Item[] => {
    return itemIds.map(id => findItem(id)).filter(Boolean); // filter(Boolean) removes any nulls if an item isn't found
};


// Default pack for all adventurers
export const adventurerPack: Item[] = resolvePackItems(packData.adventurerPack);

// Specific items granted by class
export const classPacks: Record<string, Item[]> = Object.entries(packData.classPacks).reduce((acc, [className, itemIds]) => {
    acc[className] = resolvePackItems(itemIds);
    return acc;
}, {} as Record<string, Item[]>);
