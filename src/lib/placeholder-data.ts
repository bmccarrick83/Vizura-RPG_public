
import type { Character } from '@/lib/types';
import { allFeats } from './feat-data';
import { allSpells } from './spell-data';

const partialCharacters: Omit<Character, 'createdAt' | 'backstory' | 'appearance' | 'initiative' | 'portrait' | 'xp' | 'innateMagic' | 'spellDl' | 'inventory' | 'encumbrance' | 'backpackSlots' | 'equipped' | 'skills' | 'feats' | 'spells' >[] = [
    {
        id: 'char-1',
        name: 'Aelar',
        race: 'Human',
        class: 'Soldier',
        level: 1,
        stats: { strength: 15, constitution: 14, leadership: 12, knowledge: 10, willpower: 10, instinct: 13, agility: 12, resolve: 11 }
    },
    {
        id: 'char-2',
        name: 'Lyra',
        race: 'Gnome',
        class: 'Thief',
        level: 1,
        stats: { strength: 10, constitution: 12, leadership: 10, knowledge: 14, willpower: 11, instinct: 15, agility: 15, resolve: 10 }
    },
    {
        id: 'char-3',
        name: 'Faelan',
        race: 'Astral-touched',
        class: 'Druid',
        level: 1,
        stats: { strength: 12, constitution: 13, leadership: 11, knowledge: 14, willpower: 15, instinct: 14, agility: 12, resolve: 10 }
    }
];


export const characters: Partial<Character>[] = partialCharacters.map(c => {
    const conModifier = Math.floor((c.stats.constitution - 10) / 2);
    const maxHp = 10 + conModifier;

    const raceFeats = allFeats.filter(f => 
        (c.race === 'Faun' && f.id === 'headbutt') ||
        (c.race === 'Astral-touched' && ['teleport', 'minor-telepathy'].includes(f.id))
    );

    const classSpells = allSpells.filter(s => {
        if (c.level !== 1) return false;
        switch (c.class) {
            case 'Magus Acolyte': return ['Light Rune', 'Detect Runes'].includes(s.name);
            case 'Healer': return ['Minor Healing', 'Close wounds, minor'].includes(s.name);
            case 'Druid': return ['Thorn Burst, minor', 'Dryad skin'].includes(s.name);
            case 'Warlock': return ['Mirage', 'Shrink Spell'].includes(s.name);
            default: return false;
        }
    });

    return {
        ...c,
        skills: {},
        feats: raceFeats,
        spells: classSpells,
        equipped: {
            armor: undefined,
            cloak: undefined,
            backpack: undefined
        },
        hp: {
            current: maxHp,
            max: maxHp,
        }
    }
});
