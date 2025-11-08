

import type { Item, Weapon, Armor, Consumable, Backpack, CloakOrCoat, Mount, Vehicle } from './types';

export const allItems: Item[] = [
    { id: 'gold-crown', name: 'Gold Crown', description: 'A valuable gold coin.', weight: 0.02, category: 'Currency', cost: 100, rarity: 'Common' } as Item,
    { id: 'longsword', name: 'Longsword', description: 'A versatile and reliable blade.', weight: 3, category: 'Weapon', damage: '1d8 Slashing', properties: ['Melee'], cost: 1500, rarity: 'Common' } as Weapon,
    { id: 'shortsword', name: 'Shortsword', description: 'A light, agile blade, often used as an off-hand weapon or by smaller creatures.', weight: 2, category: 'Weapon', damage: '1d6 Piercing', properties: ['Melee', 'Light', 'Finesse'], cost: 1000, rarity: 'Common' } as Weapon,
    { id: 'dagger', name: 'Dagger', description: 'A small, easily concealed blade.', weight: 1, category: 'Weapon', damage: '1d4 Piercing', properties: ['Melee', 'Light', 'Finesse', 'Thrown'], cost: 200, rarity: 'Common' } as Weapon,
    { id: 'shuriken', name: 'Shuriken', description: 'A small, concealable throwing star.', weight: 0.25, category: 'Weapon', damage: '1d4 Piercing', cost: 10, rarity: 'Common' } as Weapon,
    { id: 'dao', name: 'Dao', description: 'A common saber with a flaring tip, known for its slashing power.', weight: 4, category: 'Weapon', damage: '1d8 Slashing', properties: ['Melee'], cost: 2500, rarity: 'Common' } as Weapon,
    { id: 'sian-swords', name: 'Sian Swords', description: 'A pair of three-pronged weapons, excellent at deflecting blades.', weight: 3, category: 'Weapon', damage: '2d4 Piercing', properties: ['Melee'], cost: 100, rarity: 'Common' } as Weapon,
    { id: 'quarterstaff', name: 'Quarterstaff', description: 'A simple staff of hard wood, about 5 to 6 feet long.', weight: 4, category: 'Weapon', damage: '1d6 Bludgeoning', properties: ['Melee', 'Two-handed', 'Versatile (1d8)'], cost: 20, rarity: 'Common' } as Weapon,
    { id: 'nunchaku', name: 'Nunchaku', description: 'A martial arts weapon consisting of two sticks connected by a short chain or rope.', weight: 2, category: 'Weapon', damage: '1d6 Bludgeoning', properties: ['Melee', 'Finesse'], cost: 200, rarity: 'Uncommon' } as Weapon,
    { id: 'sling', name: 'Sling', description: 'A simple projectile weapon used to throw a blunt projectile, such as a stone.', weight: 0, category: 'Weapon', damage: '1d4 Bludgeoning', properties: ['Ranged', 'Ammunition'], cost: 10, rarity: 'Common' } as Weapon,
    { id: 'wand', name: 'Wand', description: 'A slender rod used by spellcasters to focus their magic.', weight: 1, category: 'Item', properties: ['Spellcasting Focus'], cost: 1000, rarity: 'Uncommon' } as Item,
    { id: 'crossbow', name: 'Crossbow, Light', description: 'A ranged weapon using a bow-like assembly.', weight: 5, category: 'Weapon', damage: '1d8 Piercing', properties: ['Ranged', 'Ammunition', 'Two-handed'], cost: 2500, rarity: 'Common' } as Weapon,
    { id: 'crossbow-bolt', name: 'Crossbow Bolt', description: 'A short, heavy arrow for a crossbow.', weight: 0.05, category: 'Item', cost: 10, rarity: 'Common' } as Item,
    { id: 'nageena', name: 'Nageena', description: 'A polearm with a curved blade, favored by some monastic orders for its fluid, sweeping attacks.', weight: 10, category: 'Weapon', damage: '1d10 Slashing', properties: ['Melee', 'Two-handed', 'Reach'], cost: 2000, rarity: 'Uncommon' } as Weapon,
    { id: 'halberd', name: 'Halberd', description: 'A versatile two-handed pole weapon with a chopping blade, a spike, and a hook.', weight: 12, category: 'Weapon', damage: '1d10 Slashing', properties: ['Melee', 'Two-handed', 'Reach'], cost: 2000, rarity: 'Uncommon' } as Weapon,
    { id: 'leather-armor', name: 'Leather Armor', description: 'Standard protection for any adventurer.', weight: 10, category: 'Armor', ac: 1, cost: 1000, rarity: 'Uncommon' } as Armor,
    { id: 'moon-silk-padded-armor', name: 'Moon-Silk Padded Armor', description: 'Lightweight armor woven from enchanted silk, offering surprising protection and silent movement.', weight: 8, category: 'Armor', ac: 3, properties: ['Stealth bonus'], cost: 75000, rarity: 'Very Rare' } as Armor,
    { id: 'healing-potion', name: 'Healing Potion', description: 'A vial of swirling red liquid.', weight: 0.5, category: 'Consumable', effect: 'Heals 2d4+2 HP', cost: 5000, rarity: 'Uncommon' } as Consumable,
    { id: 'healing-crystals', name: 'Healing Crystals', description: 'Crystals that hum with a gentle, restorative energy.', weight: 0.5, category: 'Consumable', effect: 'Stabilizes a dying creature.', cost: 800, rarity: 'Uncommon' } as Consumable,
    { id: 'rations', name: 'Rations (1 day)', description: 'Dry tack and salted meat.', weight: 2, category: 'Item', cost: 50, rarity: 'Common' },
    { id: 'waterskin', name: 'Waterskin', description: 'Holds a day\'s worth of water.', weight: 5, category: 'Item', cost: 20, rarity: 'Common' },
    { id: 'backpack-standard', name: 'Standard Backpack', description: 'A sturdy leather backpack.', weight: 5, category: 'Backpack', capacity: 8, cost: 200, rarity: 'Common' } as Backpack,
    { id: 'saddlebags', name: 'Saddlebags', description: 'A pair of sturdy bags for carrying extra gear on a mount or Centaur.', weight: 8, category: 'Backpack', capacity: 16, cost: 400, rarity: 'Common' } as Backpack,
    { id: 'thiefs-coat', name: 'Thief\'s Coat', description: 'A dark coat with many hidden pockets.', weight: 4, category: 'Cloak/Coat', pockets: { count: 4, capacity: 5, allowedItems: ['Consumable', 'Weapon'], description: 'Small items only' }, cost: 5000, rarity: 'Uncommon' } as CloakOrCoat,
    { id: 'horse-riding', name: 'Riding Horse', description: 'A common riding horse.', weight: 1000, category: 'Mount', speed: 60, carryingCapacity: 480, cost: 7500, rarity: 'Common' } as Mount,
    { id: 'phase-craft-luxury', name: 'Phase-Craft (Luxury)', description: 'A comfortable, top-of-the-line flying vehicle.', weight: 2200, category: 'Vehicle', speed: 'Varies', crew: '1 Pilot, 1 Co-pilot', passenger: 4, rarity: 'Legendary', cost: 500000 } as Vehicle,
    { id: 'phase-craft-military', name: 'Phase-Craft (Military)', description: 'An armored, weapon-ready flying vehicle.', weight: 3000, category: 'Vehicle', speed: 'Varies', crew: '1 Pilot, 1 Co-pilot, 2 Gunners', passenger: 6, rarity: 'Legendary', cost: 240000 } as Vehicle,
    { id: 'phase-craft-experimental', name: 'Phase-Craft (Experimental)', description: 'An unstable but powerful prototype flying vehicle.', weight: 2000, category: 'Vehicle', speed: 'Varies', crew: '1 Pilot, 1 Co-pilot, 1 Navigator', passenger: 4, rarity: 'Legendary', cost: 200000 } as Vehicle,
    { id: 'bedroll', name: 'Bedroll', description: 'A simple bedroll for sleeping.', weight: 7, category: 'Item', cost: 100, rarity: 'Common' } as Item,
    { id: 'rope', name: 'Rope, Hempen (50ft)', description: 'A coil of sturdy rope.', weight: 10, category: 'Item', cost: 100, rarity: 'Common' },
    { id: 'spellbook', name: 'Spellbook', description: 'A leather-bound tome for recording spells.', weight: 2, category: 'Item', cost: 100, rarity: 'Common' } as Item,
    { id: 'flaying-knife', name: 'Flaying Knife', description: 'A knife used for skinning hides.', weight: 1, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'butcher-knife', name: 'Butcher Knife', description: 'A heavy knife for butchering carcasses.', weight: 2, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'ball-peen-hammer', name: 'Ball Peen Hammer', description: 'A hammer used for shaping metal.', weight: 2, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'surgical-tweezers', name: 'Surgical Tweezers', description: 'Fine-tipped tweezers for delicate work.', weight: 0.2, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'pick-set', name: 'Pick Set', description: 'A set of picks for delicate work.', weight: 1, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'surgical-extractors', name: 'Surgical Extractors', description: 'Tools for removing objects.', weight: 1, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'scalpels', name: 'Scalpels', description: 'A set of sharp blades for precise cutting.', weight: 0.5, category: 'Item', cost: 10, rarity: 'Common' },
    { id: 'flint-and-steel', name: 'Flint and Steel', description: 'Used to start a fire.', weight: 1, category: 'Item', cost: 100, rarity: 'Common' } as Item,
    { id: 'torch', name: 'Torch', description: 'A wooden rod with a pitch-soaked cloth head.', weight: 1, category: 'Item', cost: 1, rarity: 'Common' } as Item,
    { id: 'notebook', name: 'Notebook', description: 'A small book for taking notes.', weight: 1, category: 'Item', cost: 5, rarity: 'Common' } as Item,
    { id: 'fountain-pen', name: 'Fountain Pen', description: 'A pen for writing with ink.', weight: 0.1, category: 'Item', cost: 5, rarity: 'Common' } as Item,
];


// Type guards
export function isWeapon(item: Item): item is Weapon {
    return item.category === 'Weapon';
}

export function isArmor(item: Item): item is Armor {
    return item.category === 'Armor';
}

export function isConsumable(item: Item): item is Consumable {
    return item.category === 'Consumable';
}

export function isBackpack(item: Item): item is Backpack {
    return item.category === 'Backpack';
}

export function isCloakOrCoat(item: Item): item is CloakOrCoat {
    return item.category === 'Cloak/Coat';
}

export function isMount(item: Item): item is Mount {
    return item.category === 'Mount';
}

export function isVehicle(item: Item): item is Vehicle {
    return item.category === 'Vehicle';
}
