
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dices, Minus, Plus, Save, ArrowLeft, ArrowRight, Info, Upload, ShieldAlert, BookCopy, Shield } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AiBackstoryGenerator } from './ai-backstory-generator';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStartingEquipment } from '@/lib/items';
import { SkillSelector } from './skill-selector';
import { Switch } from '../ui/switch';
import { findItem } from '@/lib/starting-packs';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { allSpells } from '@/lib/spell-data';
import type { Spell } from '@/lib/types';
import { multiclassAchievements } from '@/lib/achievements-data';
import { allFeats } from '@/lib/feat-data';
import { allSkillsData } from '@/lib/skill-data';
import { levelXP, epicLevelXP } from '@/lib/xp-data';


export const ALL_SKILLS = allSkillsData.map(skill => skill.name).sort();

const CLASS_SKILLS: Record<string, string[]> = allSkillsData.reduce((acc, skill) => {
    skill.classes.forEach(className => {
        if (className === 'ALL') {
            // This skill applies to all, handled separately or add to all defined classes
        } else {
            const normalizedClassName = className.toLowerCase().replace(/\s+/g, ' ');
            if (!acc[normalizedClassName]) {
                acc[normalizedClassName] = [];
            }
            if (!acc[normalizedClassName].includes(skill.name)) {
                acc[normalizedClassName].push(skill.name);
            }
        }
    });
    return acc;
}, {} as Record<string, string[]>);


const SPECIAL_SKILL_SWAPS = {
    "Engineer": { from: "Rune Knowledge", to: "Improved Instinct" }
}

const characterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  gender: z.string().min(1, 'Gender is required.'),
  level: z.coerce.number().min(1).max(25),
  class: z.string().min(1, 'Class is required.'),
  race: z.string().min(1, 'Race is required.'),
  multiclass: z.string().optional(),
  primaryClassLevel: z.coerce.number().optional(),
  multiclassLevel: z.coerce.number().optional(),
  background: z.string().min(1, 'Background is required.'),
  faction: z.string().optional(),
  stats: z.array(z.object({
      name: z.string(),
      value: z.number().min(1).max(20),
  })),
  feats: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  backstory: z.string().optional(),
  appearance: z.string().optional(),
}).refine(data => {
    if (data.level > 1 && data.multiclass && data.multiclass !== 'none') {
        return (data.primaryClassLevel || 0) + (data.multiclassLevel || 0) === data.level;
    }
    return true;
}, {
    message: "The sum of class levels must equal the character's total level.",
    path: ["primaryClassLevel"], // You can point this error to a specific field
});

type CharacterFormData = z.infer<typeof characterSchema>;

const initialStats = [
    { name: 'Strength', value: 8 },
    { name: 'Constitution', value: 8 },
    { name: 'Leadership', value: 8 },
    { name: 'Knowledge', value: 8 },
    { name: 'Willpower', value: 8 },
    { name: 'Instinct', value: 8 },
    { name: 'Agility', value: 8 },
    { name: 'Resolve', value: 8 },
];

const races = [
  "Human", "Gnome", "Spore Gnome", "Markul", "Half-Markul", "Dwarf", "Faun", "Centaur", "Astral-touched"
];

const raceModifiers: Record<string, Record<string, number>> = {
  "Human": { "Resolve": 1, "Leadership": 1 },
  "Gnome": { "Perception": 2 }, // This is a special case, handled on character sheet
  "Spore Gnome": { "Constitution": 1, "Perception": 2 }, // Perception handled on sheet
  "Markul": { "Strength": 2 },
  "Half-Markul": { "Strength": 1 },
  "Dwarf": { "Strength": 2 },
  "Faun": { "Agility": 1 },
  "Centaur": { "Agility": 2 }, // Encumbrance is a separate rule
  "Astral-touched": { "Innate Magic": 1 }, // This is not a stat, special rule
};

export const classes = [
  "Pilot", "Soldier", "Magus Acolyte", "Thief", "Healer", "Phase Craft Technician", "Engineer", "Monk", "Spy", "Druid", "Monster Hunter", "Warlock"
];

export const allBackgrounds = ["Acolyte", "Criminal", "Demon hunter", "Disgraced noble", "Explorer", "Forge Apprentice", "Hermit", "Military", "Noble", "Orphan", "Sage", "Soldier", "Street urchin", "Thrill seeker", "Tinkerer", "Earthborn", "Exiled"];
const nobleBackgrounds = ["noble", "disgraced noble"];

const pilotBackgrounds = ["Orphan", "Noble", "Military", "Explorer"];
const thiefBackgrounds = ["Disgraced noble", "Criminal", "Street urchin", "Orphan"];
const soldierBackgrounds = ["Military", "Orphan", "Thrill seeker", "Noble"];
const engineerBackgrounds = ["Tinkerer", "Military", "Demon hunter", "Forge Apprentice"];
const spyBackgrounds = ["Thrill seeker", "Military", "Soldier", "Disgraced noble", "Orphan", "Criminal"];

const backgroundDescriptions: Record<string, string> = {
    "acolyte": "You have spent your life in the service of a temple, learning its rites, studying its histories, and serving its deities. Your faith is your shield, and your knowledge of the divine is your guide.",
    "criminal": "You are an experienced criminal with a history of breaking the law. You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals.",
    "demon hunter": "You have dedicated your life to hunting down demonic entities from the chaotic plane of Limbo. You understand their nature and are prepared to face them in the mortal realm.",
    "disgraced noble": "You were once a person of importance, but you lost your title and lands. You might be on a quest to reclaim your birthright or simply trying to survive in a world that no longer respects you.",
    "exiled": "You were cast out from your community for a transgression, real or perceived. Now you wander the lands, a solitary figure carrying the weight of your past and the freedom of an uncertain future.",
    "explorer": "You are a born wanderer, driven by a thirst for the unknown. You've charted new lands, discovered forgotten ruins, and survived the perils of the wild.",
    "forge apprentice": "Your life has been spent at the heart of the forge, learning the ancient craft of metalworking. You are on the first step of a long journey to becoming a master of your craft.",
    "hermit": "You have lived in seclusion—either in a sheltered community such as a monastery, or entirely alone—for a formative part of your life. In your time apart from the clamor of society, you found quiet, solitude, and perhaps some of the answers you were looking for.",
    "military": "Your relatives have climbed the ranks in the military and you wish to join the ranks as well. You have an understanding of tactics, survival, and being prepared for any situation.",
    "noble": "You are a person of high birth, accustomed to a life of privilege and power. You carry a signet ring, a scroll of pedigree, and the weight of your family's name.",
    "orphan": "You grew up without parents, fending for yourself on the streets or in a crowded orphanage. This has made you resourceful, independent, and perhaps a bit cynical.",
    "sage": "You are a master of lore, having spent your life in pursuit of knowledge. You might be a scholar, a librarian, or a researcher, and your mind is your greatest weapon.",
    "soldier": "War has been your life. You are a trained fighter, comfortable in the chaos of battle, and you bear the scars—physical or emotional—of your service.",
    "street urchin": "You grew up on the streets of a city, living on your wits and your speed. You know how to navigate the underbelly of urban life and find opportunities where others see only squalor.",
    "thrill seeker": "You live for the rush of adrenaline and the challenge of danger. You climb the highest peaks, delve into the darkest dungeons, and face down the most fearsome beasts for the sheer excitement of it all.",
    "tinkerer": "You have a natural talent for understanding and repairing mechanical devices. Your hands are rarely clean, and your pockets are filled with gears, screws, and other useful bits.",
    "earthborn": "You were summoned to Vizura from Earth by the 'Ritual of Summoning' feat. You may have been a soldier, an engineer, or something else entirely, but here you are known for innate leadership and a strange resistance to certain types of magic.",
};

const availableFeats = allFeats.map(feat => ({
  id: feat.id,
  label: feat.name,
  description: feat.description,
}));


const POINT_BUY_LIMIT = 27;
const TOTAL_STEPS = 7;

export function CharacterCreator() {
  const [step, setStep] = useState(1);
  const [points, setPoints] = useState(POINT_BUY_LIMIT);
  const [statMethod, setStatMethod] = useState<'point-buy' | 'roll'>('roll');
  const [isGmOverride, setIsGmOverride] = useState(false);
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [factionChoice, setFactionChoice] = useState<'sudaran' | 'mizarian' | 'homebrew'>('sudaran');
  const [homebrewFaction, setHomebrewFaction] = useState('');
  const [isEpicLevel, setIsEpicLevel] = useState(false);

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: '',
      gender: 'female',
      level: 1,
      class: '',
      race: '',
      multiclass: 'none',
      primaryClassLevel: 1,
      multiclassLevel: 0,
      background: '',
      stats: initialStats,
      feats: [],
      skills: [],
      backstory: '',
      appearance: '',
    },
  });

  const { fields, update, replace } = useFieldArray({
      control: form.control,
      name: "stats",
  });
  
  const selectedLevel = form.watch('level');
  const selectedClass = form.watch('class');
  const selectedRace = form.watch('race');
  const selectedGender = form.watch('gender');
  const selectedBackground = form.watch('background');
  const selectedMulticlass = form.watch('multiclass');

  useEffect(() => {
    if (!selectedRace) {
        form.setValue('appearance', '');
        return;
    }
    let desc = '';
    const race = selectedRace.toLowerCase();
    const isFemale = selectedGender === 'female';

    switch (race) {
        case 'centaur':
            desc = "Standing at an imposing 7'4\" and weighing 1,100 lbs, this Centaur is a towering figure. Their powerful equine body is a deep chestnut brown, while their human torso is broad and muscular, bearing the scars of past battles.";
            break;
        case 'gnome':
            if (isFemale) {
                desc = "A petite figure, standing just 3 feet tall and weighing 40 pounds. Her features are delicate and sharp, with a mischievous glint in her eyes.";
            } else {
                desc = "A compact and sturdy individual, about 4 feet tall and weighing 45 pounds. His hands are nimble and his eyes are always scanning his surroundings.";
            }
            break;
        case 'human':
            if (isFemale) {
                desc = "Height: 5'5\", Weight: 150 lbs. ";
            } else {
                desc = "Height: 6'0\", Weight: 190 lbs. ";
            }
            break;
        case 'astral-touched':
            if (isFemale) {
                desc = "Height: 5'5\", Weight: 150 lbs. ";
            } else {
                desc = "Height: 6'0\", Weight: 190 lbs. ";
            }
            desc += "Skin has a faint silvery sheen, with a noticeable star-shaped silver birthmark on the left cheek. Eyes are a striking shade of violet, blue-green, or a normal color.";
            break;
        case 'faun':
            if (isFemale) {
                desc = "Height: 6'0\", Weight: 145 lbs. A graceful figure with slender limbs, brown or reddish-brown furry haunches, and cloven hooves. Small, elegantly curling horns emerge from the crown of her head.";
            } else {
                desc = "Height: 6'0\", Weight: 155 lbs. A lean, muscular build with powerful goat-like legs ending in cloven hooves. Their haunches are covered in brown or reddish-brown fur. A pair of impressive curling horns crowns his head.";
            }
            break;
        case 'markul':
            if (isFemale) {
                desc = "An imposing presence at 7 feet tall and 485 lbs. Her muscular frame is covered in thick, dark fur, and her tusks are sharp and well-kept.";
            } else {
                desc = "A colossal figure, standing 7'5\" and weighing 525 lbs. His body is a mass of muscle and grey fur, with formidable tusks jutting from his lower jaw.";
            }
            break;
        case 'half-markul':
            if (isFemale) {
                desc = "Tall and strong, she stands at 6'0\" and 155 lbs. She has a lighter build than a full Markul, but her heritage is clear in her sharp canines and slightly feral features.";
            } else {
                desc = "A formidable man, 7 feet tall and 250 lbs. He possesses a powerful build that hints at his Markul ancestry, with intense eyes and a rugged demeanor.";
            }
            break;
        case 'dwarf':
            if (isFemale) {
                desc = "A stout and strong figure at 4'3\" and 145 lbs. Her hair is intricately braided, and her hands are calloused from work at the forge.";
            } else {
                desc = "A solid, unyielding presence, standing 4'10\" and weighing 155 lbs. His magnificent beard is a source of pride, woven with metal rings.";
            }
            break;
        default:
            desc = "";
    }
    form.setValue('appearance', desc);
  }, [selectedRace, selectedGender, form]);


  useEffect(() => {
    if (selectedLevel <= 20 && isEpicLevel) {
        setIsEpicLevel(false);
    }

    if (selectedLevel === 1) {
        form.setValue('primaryClassLevel', 1);
        form.setValue('multiclassLevel', 0);
        form.setValue('multiclass', 'none');
    } else if (selectedMulticlass === 'none' || !selectedMulticlass) {
        form.setValue('primaryClassLevel', selectedLevel);
        form.setValue('multiclassLevel', 0);
    } else {
        const primaryLevel = form.getValues('primaryClassLevel') || 1;
        const remainingLevels = selectedLevel - primaryLevel;
        form.setValue('multiclassLevel', remainingLevels > 0 ? remainingLevels : 0);
    }
}, [selectedLevel, selectedMulticlass, form, isEpicLevel]);
  
  const backgroundOptions = useMemo(() => {
    let options = [...allBackgrounds];
    if (selectedClass === 'Thief') {
        return thiefBackgrounds;
    }
    if (selectedClass === 'Pilot') {
        return pilotBackgrounds;
    }
    if (selectedClass === 'Soldier') {
        return soldierBackgrounds;
    }
    if (selectedClass === 'Engineer') {
      return engineerBackgrounds;
    }
    if (selectedClass === 'Spy' && !isGmOverride) {
      return spyBackgrounds;
    }

    return options;
  }, [selectedClass, isGmOverride]);


  const multiclassOptions = useMemo(() => {
    let options = classes.filter(c => c !== selectedClass);
    if (selectedClass === 'Thief') {
      const thiefMulticlass = ['Spy'];
      if (selectedBackground === 'Disgraced noble') {
        thiefMulticlass.push('Noble');
      }
      return thiefMulticlass;
    }
    return options;
  }, [selectedClass, selectedBackground]);

  useEffect(() => {
    const currentBackground = form.getValues('background');
    if (currentBackground && !backgroundOptions.includes(currentBackground)) {
      form.setValue('background', '');
    }
  }, [backgroundOptions, form]);

    useEffect(() => {
    const currentMulticlass = form.getValues('multiclass');
    if (!currentMulticlass || currentMulticlass === 'none' || currentMulticlass !== 'Thief') return;

    if (selectedClass === 'Monk') {
        const { id } = toast({
            duration: Infinity,
            title: 'An Exile\'s Path',
            description: `This path will mark you as an exile, change your background to "Hermit", and incur a -1 Strength penalty. Do you wish to proceed?`,
            action: (
                <div className="flex flex-col gap-2 w-full">
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            form.setValue('background', 'hermit');
                            const stats = form.getValues('stats');
                            const strIndex = stats.findIndex(s => s.name === 'Strength');
                            if (strIndex !== -1) {
                                const newStats = [...stats];
                                newStats[strIndex].value -= 1;
                                replace(newStats);
                            }
                            toast({
                                title: 'Path Chosen',
                                description: 'Your background is now "Hermit" and you have a -1 penalty to Strength. An achievement has been noted.',
                            });
                            dismiss(id);
                        }}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            form.setValue('multiclass', 'none');
                            dismiss(id);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )
        });
        return; 
    }

    const forbiddenPaths: string[] = ['Soldier', 'Engineer', 'Pilot', 'Phase Craft Technician'];
    if (forbiddenPaths.includes(selectedClass)) {
        const { id } = toast({
            duration: Infinity,
            title: 'A Fall From Grace',
            description: `This action is permanent and will change your background to "Disgraced noble", strip you of rank, privileges, and pay. Do you wish to proceed?`,
            action: (
                <div className="flex flex-col gap-2 w-full">
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            form.setValue('background', 'disgraced noble');
                            toast({
                                title: 'Path Chosen: Busted Down',
                                description: 'You are now a Disgraced Noble, stripped of all former privileges.',
                            });
                            dismiss(id);
                        }}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            form.setValue('multiclass', 'none');
                            dismiss(id);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )
        });
    } else if (currentMulticlass && !multiclassOptions.includes(currentMulticlass)) {
        form.setValue('multiclass', 'none');
    }
  }, [selectedClass, selectedMulticlass, multiclassOptions, form, toast, dismiss, replace]);


  useEffect(() => {
    const currentFeats = form.getValues('feats') || [];
    let newFeats = [...currentFeats];
    
    const raceFeats: Record<string, string[]> = {
        "Faun": ["headbutt"],
        "Astral-touched": ["teleport", "minor-telepathy"],
    };

    const classFeats: Record<string, string[]> = {
        "Soldier": ["battle-rage"],
        "Engineer": ["battle-rage"],
        "Monster Hunter": ["novice-skinner"],
    };
    
    // Consolidate all possible automatic feats
    const allAutoFeats = [...new Set([...Object.values(raceFeats).flat(), ...Object.values(classFeats).flat()])];

    // Remove all automatic feats to start fresh, except for special ones like Rite of Jinn-a
    newFeats = newFeats.filter(f => !allAutoFeats.includes(f) || f === 'rite-of-jinn-a');

    // Add back feats based on current race and class
    const race = form.getValues('race');
    const charClass = form.getValues('class');

    if (race && raceFeats[race]) {
        newFeats.push(...raceFeats[race]);
    }
    if (charClass && classFeats[charClass]) {
        newFeats.push(...classFeats[charClass]);
    }
    
    form.setValue('feats', [...new Set(newFeats)]);

  }, [selectedClass, selectedRace, form]);


  const calculatePoints = (stats: {name: string, value: number}[]) => {
      const costMap: { [key: number]: number } = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 };
      const totalCost = stats.reduce((acc, stat) => acc + (costMap[stat.value] || 0), 0);
      setPoints(POINT_BUY_LIMIT - totalCost);
  }

  const updateStat = (index: number, newValue: number) => {
    const currentStats = form.getValues('stats');
    const baseValue = getBaseStatsForRace(selectedRace)[index].value;
    const newStats = [...currentStats];
    newStats[index].value = Math.max(baseValue, Math.min(15, newValue));
    calculatePoints(newStats);
    update(index, newStats[index]);
  }
  
  const getBaseStatsForRace = (race: string): { name: string; value: number }[] => {
    const modifiers = raceModifiers[race] || {};
    return initialStats.map(stat => {
        let value = 8; // All stats start at 8 before racial modifiers
        if (modifiers[stat.name]) {
            value += modifiers[stat.name];
        }
        if (stat.name === 'Strength' && (race === 'Markul' || race === 'Dwarf')) {
            value = Math.min(value, 13);
        }
        if (stat.name === 'Constitution' && race === 'Spore Gnome') {
            value += 1;
        }
        return { ...stat, value };
    });
  };

  const getRacialModifier = (race: string, statName: string) => {
    const modifiers = raceModifiers[race] || {};
    if (statName === 'Constitution' && race === 'Spore Gnome') return 1;
    return modifiers[statName] || 0;
  }

  useEffect(() => {
    if (step === 4) { // When on the Traits step
      const baseStats = getBaseStatsForRace(selectedRace);
      replace(baseStats);
      if(statMethod === 'point-buy') {
        calculatePoints(baseStats);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedRace, statMethod, replace]);


  const rollStat = () => {
      // Roll 4d6 and drop the lowest
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a,b) => a - b);
      rolls.shift();
      return rolls.reduce((sum, roll) => sum + roll, 0);
  }

  const handleRollAllStats = () => {
      const baseStats = getBaseStatsForRace(selectedRace);
      const newStats = baseStats.map((stat, index) => {
          const rolledValue = rollStat();
          const finalValue = Math.max(stat.value, rolledValue); 
          const newStat = { ...stat, value: finalValue };
          update(index, newStat);
          return newStat;
      });
  }

  const masteryBonus = useMemo(() => {
    const level = form.getValues('level');
    if (level >= 11) return 4;
    if (level >= 8) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }, [form]);

  const onSubmit = async (data: CharacterFormData) => {
    if (!user || !firestore) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a character.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const statsObject = data.stats.reduce((acc, stat) => {
        acc[stat.name.toLowerCase()] = stat.value;
        return acc;
      }, {} as Record<string, number>);

      const conModifier = Math.floor((statsObject.constitution - 10) / 2);
      const initialHp = 10 + conModifier;
      
      const instinct = statsObject.instinct || 8;
      const knowledge = statsObject.knowledge || 8;

      let startingEquipment = (data.level === 1) ? getStartingEquipment(data.class) : [];
      let baseEncumbrance = 120;
      
      if (data.race === 'Centaur') {
        startingEquipment.push(findItem('saddlebags'));
        baseEncumbrance += 120; // Centaurs can carry more
      }

      const classSkills = CLASS_SKILLS[data.class.toLowerCase() as keyof typeof CLASS_SKILLS] || [];
      const combinedSkills = [...new Set([...classSkills, ...(data.skills || [])])];
      
      const inventoryWeight = startingEquipment.reduce((sum, item) => sum + item.weight, 0);

      const finalFaction = nobleBackgrounds.includes(data.background.toLowerCase())
        ? (factionChoice === 'homebrew' ? homebrewFaction : factionChoice)
        : undefined;
      
      const xpData = data.level <= 20 ? levelXP[data.level] : epicLevelXP[data.level];

      const characterPayload: any = {
        name: data.name,
        race: data.race,
        class: data.class,
        multiclass: data.multiclass && data.multiclass !== 'none' ? data.multiclass : null,
        background: data.background,
        faction: finalFaction,
        level: data.level,
        initiative: Math.floor((statsObject.agility - 10) / 2),
        portrait: {
          imageUrl: `https://picsum.photos/seed/${Math.random()}/600/600`,
          description: `A portrait of ${data.name}`,
          imageHint: `${data.race} ${data.class}`,
        },
        hp: {
          current: initialHp,
          max: initialHp,
        },
        xp: {
          current: xpData.total,
          nextLevel: xpData.next,
        },
        innateMagic: {
            current: Math.max(6, Math.floor((instinct + knowledge) / 2)),
            max: Math.max(6, Math.floor((instinct + knowledge) / 2)),
        },
        spellDl: 10 + Math.floor((statsObject.knowledge - 10) / 2) + masteryBonus,
        stats: statsObject,
        skills: combinedSkills.reduce((acc, skill) => ({...acc, [skill]: 0}), {}), // Save as object for now
        feats: data.feats?.map(featId => allFeats.find(f => f.id === featId)).filter(Boolean).map(f => ({ name: f!.name, description: f!.description })) || [],
        inventory: startingEquipment,
        equipped: {
          backpack: startingEquipment.find(i => i.category === 'Backpack')
        },
        encumbrance: {
          current: inventoryWeight,
          max: baseEncumbrance,
        },
        backpackSlots: {
            current: startingEquipment.length,
            max: 8,
        },
        appearance: data.appearance || 'Not yet described.',
        backstory: data.backstory || 'A story waiting to be told.',
        createdAt: serverTimestamp(),
      };
      
        let startingSpells: Spell[] = [];
        if (data.level === 1) {
            let spellNames: string[] = [];
            if (data.class === 'Magus Acolyte') {
                spellNames = ['Light Rune', 'Detect Runes'];
            } else if (data.class === 'Healer') {
                spellNames = ['Minor Healing', 'Close wounds, minor'];
            } else if (data.class === 'Druid') {
                spellNames = ['Thorn Burst, minor', 'Dryad skin'];
            } else if (data.class === 'Warlock') {
                spellNames = ['Mirage', 'Shrink Spell'];
            }
            if (data.feats?.includes('rite-of-jinn-a')) {
                spellNames.push('Sand Shift');
            }
            if (spellNames.length > 0) {
                startingSpells = allSpells.filter(s => spellNames.includes(s.name));
            }
        }
        characterPayload.spells = startingSpells;

      const martialClasses = ['Soldier', 'Engineer'];
      
      if (martialClasses.includes(data.class)) {
        characterPayload.rank = 'Recruit';
      }

      if (data.class === 'Magus Acolyte' || data.class === 'Druid' || data.class === 'Warlock' || data.class === 'Monster Hunter' || data.background === 'Demon hunter' || data.class === 'Healer') {
        characterPayload.degree = '0th Degree';
      }

      if (data.class === 'Warlock') {
        characterPayload.soulPercentage = 90;
      }
      
      const charactersCollection = collection(firestore, 'users', user.uid, 'characters');
      await addDoc(charactersCollection, characterPayload);

      toast({
        title: 'Character Created!',
        description: `${data.name} the ${data.race} ${data.class} is ready for adventure.`,
      });

      router.push('/characters');
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: 'Error Creating Character',
        description: 'There was a problem saving your character. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAiUpdate = (backstory: string, appearance: string) => {
    form.setValue('backstory', backstory);
    form.setValue('appearance', appearance);
    toast({
        title: "AI Assistant",
        description: "Backstory and appearance have been updated.",
    })
  }

  const handleSkillsSave = (newSkills: string[]) => {
      form.setValue('skills', newSkills);
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof CharacterFormData)[] = [];
    switch (step) {
        case 1: fieldsToValidate = ['name', 'level', 'class', 'gender']; break;
        case 2: fieldsToValidate = ['race']; break;
        case 3: fieldsToValidate = ['background']; break;
    }
    const result = await form.trigger(fieldsToValidate);
    if (result) {
        setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
  
  const progressPercentage = (step / TOTAL_STEPS) * 100;
  
  const getAutomaticFeats = () => {
    const race = form.getValues('race');
    const charClass = form.getValues('class');
    const feats = [];

    if (race === 'Faun') feats.push('Headbutt');
    if (race === 'Astral-touched') feats.push('Teleport', 'Minor Telepathy');
    if (charClass === 'Soldier' || charClass === 'Engineer') feats.push('Battle Rage');
    if (charClass === 'Monster Hunter') feats.push('Novice Skinner');

    return feats;
  }

  const backgroundDescription = selectedBackground ? backgroundDescriptions[selectedBackground.toLowerCase()] : null;
  const showFactionSelection = selectedBackground && nobleBackgrounds.includes(selectedBackground.toLowerCase());

  const showMulticlassLevelSplit = selectedLevel > 1 && selectedMulticlass && selectedMulticlass !== 'none';
  const conModifier = Math.floor((form.getValues('stats').find(s => s.name === 'Constitution')?.value || 10) - 10) / 2;

  const handleWarlockFeatChange = (checked: boolean) => {
    const currentFeats = form.getValues('feats') || [];
    if (checked) {
      form.setValue('feats', [...currentFeats, 'rite-of-jinn-a']);
    } else {
      form.setValue('feats', currentFeats.filter(f => f !== 'rite-of-jinn-a'));
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        <Card>
          <CardHeader>
            <Progress value={progressPercentage} className="h-2 mb-4" />
            <CardTitle className="text-2xl text-center">
              {step === 1 && 'Choose Name, Level, Gender, and Class'}
              {step === 2 && 'Select your Race'}
              {step === 3 && 'Select your Background'}
              {step === 4 && 'Determine your Traits'}
              {step === 5 && 'Select your Skills & Feats'}
              {step === 6 && 'Appearance and Backstory'}
              {step === 7 && 'Review and Finish'}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[350px]">
            {step === 1 && (
              <div className="max-w-md mx-auto space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Character Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Elara" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Level</FormLabel>
                         <div className="flex items-center space-x-2">
                            <ShieldAlert className="h-4 w-4 text-primary" />
                            <Label htmlFor="gm-override-level" className="text-xs">Epic Levels (21-25)</Label>
                            <Switch id="gm-override-level" checked={isEpicLevel} onCheckedChange={setIsEpicLevel} />
                        </div>
                      </div>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Array.from({ length: isEpicLevel ? 25 : 20 }, (_, i) => i + 1).map(level => (
                            <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {classes.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedLevel > 1 && (
                  <FormField
                    control={form.control}
                    name="multiclass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Multiclass (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'none'}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a second class" /></SelectTrigger></FormControl>
                          <SelectContent>
                             <SelectItem value="none">None</SelectItem>
                            {multiclassOptions.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedClass === 'Thief' && (
                            <FormDescription>
                                Thieves can multiclass into Spy. If you chose the 'Disgraced noble' background, you can also multiclass into Noble.
                            </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                 {showMulticlassLevelSplit && (
                    <Card className="bg-muted/50 p-4">
                        <CardDescription className="mb-2 text-center">Distribute your {selectedLevel} levels.</CardDescription>
                        <div className="flex justify-around gap-4">
                           <FormField
                                control={form.control}
                                name="primaryClassLevel"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="text-center block">{selectedClass}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    const cappedValue = Math.min(value, selectedLevel -1);
                                                    field.onChange(cappedValue);
                                                    form.setValue('multiclassLevel', selectedLevel - cappedValue);
                                                }}
                                                min={1}
                                                max={selectedLevel -1}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                           />
                           <FormField
                                control={form.control}
                                name="multiclassLevel"
                                render={({ field }) => (
                                     <FormItem className="flex-1">
                                        <FormLabel className="text-center block">{selectedMulticlass}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    const cappedValue = Math.min(value, selectedLevel -1);
                                                    field.onChange(cappedValue);
                                                    form.setValue('primaryClassLevel', selectedLevel - cappedValue);
                                                }}
                                                min={1}
                                                max={selectedLevel -1}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                           />
                        </div>
                        <FormMessage>{form.formState.errors.primaryClassLevel?.message}</FormMessage>
                    </Card>
                )}
              </div>
            )}
             {step === 2 && (
                <div className="max-w-md mx-auto space-y-4">
                    <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a race" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {races.map(race => (
                              <SelectItem key={race} value={race}>{race}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {getAutomaticFeats().length > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Racial & Class Feats Granted!</AlertTitle>
                        <AlertDescription>
                          Based on your selections, you automatically gain: <strong>{getAutomaticFeats().join(', ')}</strong>.
                        </AlertDescription>
                      </Alert>
                    )}
              </div>
            )}
            {step === 3 && (
              <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="background"
                    render={({ field }) => (
                        <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Background</FormLabel>
                            {(selectedClass === 'Spy') && (
                                <div className="flex items-center space-x-2">
                                <ShieldAlert className="h-4 w-4 text-primary" />
                                <Label htmlFor="gm-override-bg" className="text-xs">GM Override</Label>
                                <Switch id="gm-override-bg" checked={isGmOverride} onCheckedChange={setIsGmOverride} />
                            </div>
                            )}
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a background" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {backgroundOptions.map(b => (
                                <SelectItem key={b} value={b.toLowerCase()}>{b}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        {selectedClass === 'Spy' && !isGmOverride && (
                            <FormDescription>
                            Spies are restricted to certain backgrounds. Enable GM Override to see all options.
                            </FormDescription>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {showFactionSelection && (
                        <Card className="p-4 bg-muted/50">
                            <Label>Faction</Label>
                            <RadioGroup value={factionChoice} onValueChange={(v) => setFactionChoice(v as any)} className="mt-2 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sudaran" id="sudaran" />
                                    <Label htmlFor="sudaran">Sudaran (King/Queen)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="mizarian" id="mizarian" />
                                    <Label htmlFor="mizarian">Mizarian (Sultan/Sultaness)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="homebrew" id="homebrew" />
                                    <Label htmlFor="homebrew">Homebrew</Label>
                                </div>
                            </RadioGroup>
                            {factionChoice === 'homebrew' && (
                                <Input 
                                    className="mt-2"
                                    placeholder="Enter faction name..." 
                                    value={homebrewFaction}
                                    onChange={(e) => setHomebrewFaction(e.target.value)}
                                />
                            )}
                        </Card>
                    )}
                </div>
                <div>
                  {backgroundDescription && (
                      <Card className="bg-muted/30">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BookCopy className="h-5 w-5 text-primary" />
                                <span>{selectedBackground.charAt(0).toUpperCase() + selectedBackground.slice(1)}</span>
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground">{backgroundDescription}</p>
                          </CardContent>
                      </Card>
                  )}
                </div>
              </div>
            )}
            {step === 4 && (
                <div className="max-w-md mx-auto space-y-4">
                    <RadioGroup defaultValue="roll" value={statMethod} onValueChange={(value: 'point-buy' | 'roll') => setStatMethod(value)} className="flex justify-center gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="point-buy" id="point-buy" />
                            <Label htmlFor="point-buy">Point Buy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="roll" id="roll" />
                            <Label htmlFor="roll">Roll Stats</Label>
                        </div>
                    </RadioGroup>

                    {statMethod === 'point-buy' ? (
                        <div className="text-center p-2 rounded-lg bg-primary/10">
                            <p className="font-bold text-lg text-primary">{points} / {POINT_BUY_LIMIT}</p>
                            <p className="text-xs text-primary/80">Points Remaining</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Button type="button" variant="outline" size="sm" onClick={handleRollAllStats} className="whitespace-nowrap"><Dices className="mr-2 h-4 w-4"/> Roll All Stats</Button>
                        </div>
                    )}
                    <Alert variant="default">
                      <AlertTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" />Hit Points</AlertTitle>
                      <AlertDescription>
                        At level 1, your character's Hit Points are calculated as 10 + your Constitution modifier ({10 + conModifier}).
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-md">
                          <FormLabel className="w-1/3">Trait</FormLabel>
                          <FormLabel className="w-1/4 text-center">Bonus</FormLabel>
                          <FormLabel className="w-1/2 text-center">Value</FormLabel>
                      </div>
                      {fields.map((field, index) => {
                          const racialBonus = getRacialModifier(selectedRace, field.name);
                          return (
                              <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                  <FormLabel className="w-1/3 font-normal">{field.name}</FormLabel>
                                  <div className="w-1/4 text-center text-primary font-semibold">
                                      {racialBonus > 0 ? `+${racialBonus}`: ''}
                                  </div>
                                  <div className="flex items-center gap-2 w-1/2 justify-end">
                                      {statMethod === 'point-buy' ? (
                                        <>
                                          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStat(index, field.value - 1)}><Minus className="h-4 w-4"/></Button>
                                          <Input type="number" className="w-16 h-8 text-center" {...form.register(`stats.${index}.value`, { valueAsNumber: true })} readOnly />
                                          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStat(index, field.value + 1)}><Plus className="h-4 w-4"/></Button>
                                        </>
                                      ) : (
                                        <Input type="number" className="w-16 h-8 text-center" {...form.register(`stats.${index}.value`, { valueAsNumber: true })} readOnly />
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                    </div>
                </div>
            )}
             {step === 5 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>Select skills for your character. Class skills are automatically selected.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SkillSelector
                            classSkills={CLASS_SKILLS[selectedClass.toLowerCase() as keyof typeof CLASS_SKILLS] || []}
                            currentSkills={form.getValues('skills') || []}
                            onSave={handleSkillsSave}
                            characterLevel={selectedLevel}
                            specialSwaps={SPECIAL_SKILL_SWAPS}
                            selectedClass={selectedClass}
                        />
                    </CardContent>
                </Card>
                {selectedClass === 'Warlock' && selectedLevel === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Warlock Pact</CardTitle>
                      <CardDescription>As a starting Warlock, you may choose a special pact.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Switch id="rite-of-jinn-a" onCheckedChange={handleWarlockFeatChange} />
                        <Label htmlFor="rite-of-jinn-a">Take the Rite of Jinn-a</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This special feat grants you the "Sand Shift" spell but does not count against your feat limit.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            {step === 6 && (
                 <div className="max-w-md mx-auto space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel htmlFor="image-upload">Character Portrait</FormLabel>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" /> Upload Image
                        </Label>
                      </Button>
                      <Input id="image-upload" type="file" className="sr-only" />
                    </div>
                    <div className="flex justify-end">
                        <AiBackstoryGenerator characterData={{...form.getValues(), feats: form.getValues().feats?.map(f => allFeats.find(af => af.id === f)?.name || '') || []}} onUpdate={handleAiUpdate} />
                    </div>
                    <FormField
                        control={form.control}
                        name="appearance"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Appearance</FormLabel>
                            <FormControl><Textarea placeholder="Describe your character's appearance..." {...field} rows={8} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="backstory"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Backstory</FormLabel>
                            <FormControl><Textarea placeholder="Describe your character's backstory..." {...field} rows={8}/></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )}
             {step === 7 && (
                <div className="max-w-md mx-auto space-y-4 text-center">
                    <h2 className="text-2xl font-headline">Ready to Begin?</h2>
                    <p className="text-muted-foreground">
                        Your character, {form.getValues('name')}, is ready for adventure. Save them to your gallery to begin.
                    </p>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Previous
            </Button>
            {step < TOTAL_STEPS && (
                <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            )}
            {step === TOTAL_STEPS && (
                <Button type="submit" size="lg">
                    <Save className="mr-2 h-4 w-4"/>
                    Save Character
                </Button>
            )}
        </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
