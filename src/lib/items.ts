

import { type Item } from '@/lib/types';
import { classPacks as classPackData, adventurerPack as adventurerPackData } from './starting-packs';

function getRandomMonkWeapon(): Item {
    const monkWeapons = ['sling', 'nunchaku', 'shortsword', 'quarterstaff'];
    const randomWeaponId = monkWeapons[Math.floor(Math.random() * monkWeapons.length)];
    return adventurerPackData.find(item => item.id === randomWeaponId) || classPackData['default'].find(item => item.id === 'dagger')!;
}


export function getStartingEquipment(className: string): Item[] {
    const basePack = [...adventurerPackData];
    let classItems = [...(classPackData[className] || classPackData['default'])];
    
    if (className === 'Monk') {
        classItems.push(getRandomMonkWeapon());
    }

    if (className === 'Soldier' || className === 'Engineer') {
        const boltsInPack = Array(10).fill(classPackData[className].find(i => i.id === 'crossbow-bolt')!);
        classItems.push(...boltsInPack);
    }

    // Combine and ensure no duplicates if an item exists in both packs.
    const allItems = [...basePack, ...classItems];
    const uniqueItemIds = new Set(allItems.map(item => item.id));
    
    // This logic is a bit complex for a simple unique filter, it should handle quantities.
    // For now, we are returning a list where each item appears once if it's unique by ID.
    // A better implementation would handle quantities properly.
    return Array.from(uniqueItemIds).map(id => allItems.find(item => item.id === id)!);
}
