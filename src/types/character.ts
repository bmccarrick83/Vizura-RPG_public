

import { type Item, Armor, type Spell } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export interface CharacterStats {
  strength: number;
  constitution: number;
  leadership: number;
  knowledge: number;
  willpower: number;
  instinct: number;
  agility: number;
  resolve: number;
}

export interface CharacterFeat {
    name: string;
    description: string;
}

export interface Character {
  id: string;
  name:string;
  race: string;
  class: string;
  multiclass?: string | null;
  rank?: string;
  degree?: string;
  background: string;
  faction?: string;
  level: number;
  initiative: number;
  portrait: {
    imageUrl: string;
    description: string;
    imageHint: string;
  };
  hp: {
    current: number;
    max: number;
  };
  xp: {
    current: number;
    nextLevel: number;
  };
  innateMagic: {
    current: number;
    max: number;
  };
  spellDl: number;
  stats: CharacterStats;
  skills: Record<string, number>;
  feats: CharacterFeat[];
  spells: Spell[];
  inventory: Item[];
  equipped: {
    armor?: Armor;
    cloak?: Item;
    backpack?: Item;
  };
  encumbrance: {
    current: number;
    max: number;
  };
  backpackSlots: {
    current: number;
    max: number;
  };
  appearance: string;
  backstory: string;
  createdAt: Timestamp;
  soulPercentage?: number;
}

export const BackstoryInputSchema = z.object({
  name: z.string().describe("The character's name."),
  race: z.string().describe("The character's race."),
  class: z.string().describe("The character's class."),
  background: z.string().describe("The character's background."),
  stats: z.record(z.number()).describe("A record of the character's stats, like strength and agility."),
});

export const BackstoryOutputSchema = z.object({
  backstory: z.string().describe("A rich, detailed backstory for the character."),
  appearance: z.string().describe("A vivid description of the character's appearance."),
});

export type BackstoryInput = z.infer<typeof BackstoryInputSchema>;
export type BackstoryOutput = z.infer<typeof BackstoryOutputSchema>;
    