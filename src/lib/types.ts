


export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Extremely Rare' | 'Legendary';
export type ItemCategory = 'Weapon' | 'Armor' | 'Consumable' | 'Backpack' | 'Cloak/Coat' | 'Mount' | 'Vehicle' | 'Currency' | 'Item';

export interface Item {
    id: string;
    name: string;
    description?: string;
    weight: number;
    category?: ItemCategory;
    cost: number; // Cost in the smallest currency unit (e.g., coppers)
    rarity: Rarity;
    properties?: string[];
}

export interface Weapon extends Item {
    category: 'Weapon';
    damage: string;
}

export interface Armor extends Item {
    category: 'Armor';
    ac: number;
}

export interface Consumable extends Item {
    category: 'Consumable';
    effect: string;
}

export interface Backpack extends Item {
    category: 'Backpack';
    capacity: number;
}

export interface CloakOrCoat extends Item {
    category: 'Cloak/Coat';
    pockets: {
        count: number;
        capacity: number;
        allowedItems: ItemCategory[];
        description: string;
    };
}

export interface Mount extends Item {
    category: 'Mount';
    speed: number;
    carryingCapacity: number;
}

export interface Vehicle extends Item {
    category: 'Vehicle';
    speed: string;
    crew: string;
    passenger: number;
}

export interface Spell {
    id: string;
    name: string;
    description: string;
    degree: number;
    category: 'Rune' | 'Healing' | 'Nature' | 'Illusion' | 'Utility';
}
