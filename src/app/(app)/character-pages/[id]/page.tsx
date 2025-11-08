

'use client';

import { useState, useMemo, useContext, useEffect, useTransition } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Sparkles, Eye, Sun, Moon, Pencil, BrainCircuit, BookOpenCheck, Star, TramFront, Backpack, HeartCrack } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Character } from "@/types/character";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useDoc, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { CharacterSheetSkeleton } from "@/components/characters/character-sheet/character-sheet-skeleton";
import { DaggerIcon } from "@/components/icons/DaggerIcon";
import { CampaignContext } from "@/components/campaign/campaign-provider";
import { CharacterEditor } from "@/components/characters/character-editor";
import { VehicleStats } from "@/components/vehicles/vehicle-stats";
import { FootprintsIcon } from "@/components/icons/FootprintsIcon";
import { Armor, isArmor, allItems, type Item } from "@/lib/item-data";
import { ItemCard } from "@/components/inventory/item-card";
import { ReactSortable, type SortableEvent } from "react-sortablejs";
import { useToast } from "@/hooks/use-toast";
import type { Spell } from "@/lib/types";
import { useAchievements } from "@/hooks/use-achievements";


const statNames: Record<string, string> = {
    strength: 'STR',
    constitution: 'CON',
    leadership: 'LDR',
    knowledge: 'KNO',
    willpower: 'WIL',
    instinct: 'INS',
    agility: 'AGI',
    resolve: 'RES',
    perception: 'PER',
    concentration: 'CONC'
}

const SOLDIER_RANKS: Record<number, string> = {
  1: 'Recruit',
  2: 'Private',
  3: 'Corporal',
  5: 'Sergeant',
  6: 'Staff Sergeant',
  7: 'Master Sergeant',
  9: 'Warrant Officer 1',
  11: 'Warrant Officer 2',
  12: 'Warrant Officer 3',
  13: 'Warrant Officer 4',
  15: '2nd Lieutenant',
  16: '1st Lieutenant',
  17: 'Captain',
  18: 'Major',
  19: 'Lieutenant Colonel',
  20: 'Colonel',
};

const PILOT_RANKS: Record<number, string> = {
  1: 'Pilot cadet',
  2: '2nd Lieutenant',
  3: '1st Lieutenant',
  5: 'Captain',
  7: 'Major',
  10: 'Lieutenant colonel',
  13: 'Colonel',
  15: 'Squadron commander',
  17: 'Wing Commander',
  19: 'Major General',
  20: 'Supreme Air General',
};

const PHASE_CRAFT_TECHNICIAN_RANKS: Record<number, string> = {
  1: 'Technician 1',
  2: 'Technician 2',
  3: 'Technician 3',
  5: 'Matrix aligner 1',
  6: 'Matrix aligner 2',
  7: 'Matrix aligner 3',
  10: 'Shop foreman',
  12: 'Materials manager',
  15: 'Crystal shaper apprentice',
  17: 'Crystal shaper, craftsman',
  19: 'Crystal shaper, adeptus',
  20: 'Phase-craft Builder',
};


const MAGUS_DEGREES: Record<number, string> = {
    1: "Magus Acolyte",
    3: "Magus Neophyte",
    5: "Magus Adeptus",
    7: "Magus Theotechnus",
    9: "Magus Minor",
    12: "Magus Prestijus",
    15: "Magus major",
    18: "Magus Chief",
    20: "Magus Ipsimus",
};

const HEALER_RANKS: Record<number, string> = {
  1: 'Novice',
  3: 'Chanter',
  5: 'Diviner',
  7: 'Neovis',
  10: 'Ducolos',
  12: 'Adept',
  15: 'Mentor',
  17: 'Doctor',
  19: 'Prior / Prioress',
  20: 'Abbot / Abotess',
};

const MONK_RANKS: Record<number, string> = {
    1: "uchiri (seed)",
    2: "kozai'a (sprout)",
    3: "enkoi (sapling)",
    5: "shuzen (tree trunk)",
    7: "li-guan (tree canopy)",
    10: "yezian (sky)",
    12: "neo-ji (healer, sap strength)",
    15: "kyojan (monster strength)",
    17: "sobosa (master)",
    19: "kondan (Grandmaster)",
    20: "Kirutha (Ascended master)",
};


const MAX_XP = 10000;
const MAX_RANK = 'General';

const SPELLCASTING_CLASSES = ["Magus Acolyte", "Healer", "Pilot", "Druid", "Warlock"];
const NOBLE_BACKGROUNDS = [
  "prince", "duke", "princess", "duchess", "baron", "baroness", 
  "sudaran", "mizarian", "noble", "disgraced noble",
  "sultan", "sultaness", "emir", "sheikh", "chief"
];


function StatBox({ name, value, penaltyText, icon, tooltip }: { name: string, value: number, penaltyText?: string | null, icon?: React.ReactNode, tooltip?: string }) {
    const modifier = Math.floor((value - 10) / 2);
    
    const content = (
        <div className="relative flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 border h-24 w-24 shadow-inner-sm">
             {icon && <div className="absolute top-1 left-1 text-muted-foreground">{icon}</div>}
            <div className="text-sm uppercase font-semibold text-muted-foreground">{name}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold font-headline tracking-wider">{value}</div>
              {name !== 'PER' && name !== 'CONC' && (
                <div className="text-base font-semibold text-primary/80">({modifier >= 0 ? `+${modifier}` : modifier})</div>
              )}
            </div>
             {penaltyText && <div className="absolute -bottom-4 w-full text-center text-xs text-destructive">{penaltyText}</div>}
        </div>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {content}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return content;
}

function InventoryManager({ character, onInventoryChange }: { character: Character, onInventoryChange: (newInventory: Item[]) => void }) {
    const [carriedItems, setCarriedItems] = useState<Item[]>(character.inventory || []);
    const [gear] = useState<Item[]>(() =>
        allItems.filter(
            (item) => !(character.inventory || []).some((invItem) => invItem.id === item.id)
        )
    );

    const onSort = (evt: SortableEvent) => {
        const fromId = evt.from.dataset.sortableId;
        const toId = evt.to.dataset.sortableId;

        // This is a simplified implementation that only handles adding/removing from the main carried list
        // A full implementation would need to know which state setter to call based on the `toId`.
        // For now, we assume we are only modifying the `carriedItems` list.
        if (fromId !== 'carried' && toId === 'carried') {
             // Item added
            const itemId = evt.item.dataset.id;
            const item = allItems.find(i => i.id === itemId);
            if (item && evt.newIndex !== undefined) {
                 const newCarried = [...carriedItems];
                 newCarried.splice(evt.newIndex, 0, item);
                 onInventoryChange(newCarried);
            }
        } else if (fromId === 'carried' && toId !== 'carried') {
            // Item removed
            const itemId = evt.item.dataset.id;
             const newCarried = carriedItems.filter(i => i.id !== itemId);
            onInventoryChange(newCarried);
        } else if (fromId === 'carried' && toId === 'carried' && evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            // Reordered
            const newCarried = [...carriedItems];
            const [reorderedItem] = newCarried.splice(evt.oldIndex, 1);
            newCarried.splice(evt.newIndex, 0, reorderedItem);
            onInventoryChange(newCarried);
        }
    };
    
     useEffect(() => {
        setCarriedItems(character.inventory || []);
    }, [character.inventory]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Items</CardTitle>
                    <CardDescription>Drag items from here to your character's inventory.</CardDescription>
                </CardHeader>
                <CardContent className="h-[60vh] overflow-y-auto">
                    <ReactSortable
                        list={gear}
                        setList={() => {}} // We don't set the main gear list
                        group={{ name: 'shared', pull: 'clone', put: false }}
                        sort={false}
                        className="space-y-2"
                        data-sortable-id="gear"
                    >
                        {gear.map((item) => (
                            <div key={item.id} data-id={item.id}>
                                <ItemCard item={item} />
                            </div>
                        ))}
                    </ReactSortable>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Backpack /> Carried Items</CardTitle>
                    <CardDescription>Items on your person, not in a container.</CardDescription>
                </CardHeader>
                <CardContent className="h-[60vh] overflow-y-auto">
                     <ReactSortable
                        list={carriedItems}
                        setList={setCarriedItems}
                        group="shared"
                        className="space-y-2 min-h-full"
                        onEnd={onSort}
                        data-sortable-id="carried"
                    >
                        {carriedItems.map((item) => (
                            <div key={item.id} data-id={item.id}>
                                <ItemCard item={item} />
                            </div>
                        ))}
                    </ReactSortable>
                </CardContent>
            </Card>
        </div>
    );
}

function Spellbook({ spells }: { spells: Spell[] }) {
    if (!spells || spells.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="font-headline text-3xl">Spellbook</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">No spells known.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader><CardTitle className="font-headline text-3xl">Spellbook</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {spells.map(spell => (
                    <div key={spell.id} className="p-3 bg-muted/30 rounded-md border">
                        <h4 className="font-semibold text-primary">{spell.name} <span className="text-xs font-normal text-muted-foreground">(Degree {spell.degree})</span></h4>
                        <p className="text-sm text-muted-foreground">{spell.description}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


export default function CharacterSheetPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const campaignContext = useContext(CampaignContext);
  
  const characterRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !id) return null;
    return doc(firestore, 'users', user.uid, 'characters', id);
  }, [firestore, user?.uid, id]);

  const { data: character, isLoading: isCharacterLoading, error } = useDoc<Character>(characterRef);
  useAchievements(character);

  const [isNight, setIsNight] = useState(false);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [ragePointsUsed, setRagePointsUsed] = useState(0);

  const handleSave = async (updatedCharacter: Partial<Character>) => {
    if (!characterRef) return;
    try {
      await updateDoc(characterRef, updatedCharacter);
      toast({ title: "Character Updated" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error updating character", variant: "destructive" });
    }
  };
  
  const handleInventoryChange = (newInventory: Item[]) => {
    handleSave({ inventory: newInventory });
  };
  
    useEffect(() => {
    if (!character || !characterRef) return;
    
    let newRank: string | undefined;
    let rankList: Record<number, string> | undefined;

    switch (character.class) {
        case 'Soldier':
        case 'Engineer':
            rankList = SOLDIER_RANKS;
            break;
        case 'Pilot':
            rankList = PILOT_RANKS;
            break;
        case 'Phase Craft Technician':
            rankList = PHASE_CRAFT_TECHNICIAN_RANKS;
            break;
        case 'Healer':
            rankList = HEALER_RANKS;
            break;
        case 'Monk':
            rankList = MONK_RANKS;
            break;
    }

    if (rankList) {
        const rankLevel = Object.keys(rankList)
            .map(Number)
            .sort((a, b) => b - a)
            .find(level => character.level >= level);

        if (rankLevel) {
            newRank = rankList[rankLevel];
        }
        if (newRank && newRank !== character.rank) {
            updateDoc(characterRef, { rank: newRank });
            toast({
                title: "Rank Promotion!",
                description: `Congratulations, you have been promoted to ${newRank}.`,
            });
        }
    } else if (character.class.startsWith('Magus')) {
      const degreeLevel = Object.keys(MAGUS_DEGREES)
        .map(Number)
        .sort((a, b) => b - a)
        .find(level => character.level >= level);
      
      let newDegreeClass: string | undefined;
      if (degreeLevel) {
        newDegreeClass = MAGUS_DEGREES[degreeLevel];
      }
      
      if (newDegreeClass && newDegreeClass !== character.class) {
        updateDoc(characterRef, { class: newDegreeClass });
        toast({
          title: "Degree Advanced!",
          description: `You have advanced to the degree of ${newDegreeClass}.`,
        });
      }
    }


  }, [character, characterRef, toast]);


  const movementSpeed = useMemo(() => {
    if (!character) return 0;
    
    let speed = 30; // Default for Human, Astral-touched
    const level = character.level;
    const strength = character.stats.strength;
    const levelBonus = Math.floor(level / 3);

    switch (character.race) {
        case 'Centaur':
            speed = Math.max(35, strength * 3);
            if (level >= 3) {
                speed = Math.min(60, speed + 10 + (levelBonus - 1) * 2);
            } else {
                speed = Math.min(54, speed);
            }
            break;
        case 'Faun':
            speed = Math.max(30, strength * 2 + 5);
             if (level >= 3) {
                speed += 10 + (levelBonus - 1) * 2;
            } else {
                speed = Math.min(40, speed);
            }
            break;
        case 'Markul':
            speed = 50;
            if (level >= 3) {
               speed = Math.min(55, speed + levelBonus * 3);
            }
            break;
        case 'Half-Markul':
             speed = 40;
            if (level >= 3) {
               speed = Math.min(48, speed + levelBonus * 3);
            }
            break;
        case 'Gnome':
        case 'Spore Gnome':
        case 'Dwarf':
            speed = 25;
            if (level >= 3) {
                speed = 28;
            }
            break;
        default:
            speed = 30; // Human, Astral-touched
            break;
    }

    if (character.feats?.some(f => f.name === 'Speed boost')) {
        speed += 1;
    }

    // Encumbrance logic would go here if we had the data
    // For now, we assume not encumbered on this page.

    return speed;
  }, [character]);

  const masteryBonus = useMemo(() => {
    if (!character) return 0;
    const level = character.level;
    if (level >= 11) return 4;
    if (level >= 8) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }, [character]);

  const maxRagePoints = useMemo(() => {
    if (!character || !character.feats?.some(f => f.name === 'Battle Rage')) return 0;
    const level = character.level;
    if (level >= 17) return Infinity;
    if (level >= 13) return 6;
    if (level >= 9) return 5;
    if (level >= 5) return 4;
    return 3;
  }, [character]);


  if (isCharacterLoading) {
      return <CharacterSheetSkeleton />;
  }
  
  if (!character) {
      return <div>Character not found or you do not have permission to view it.</div>;
  }

  const isFullMoon = campaignContext?.isFullMoon ?? false;
  
  const isGnome = character.race === "Gnome" || character.race === "Spore Gnome";
  const isVampire = character.feats?.some(f => f.name === 'Vampire');
  const isWereBitten = character.feats?.some(f => f.name === 'Were-bitten');
  const showTimeToggle = isGnome || isVampire || isWereBitten;

  const isDruid = character.class === "Druid";
  const isMonk = character.class === "Monk";

  const { perceptionScore, perceptionBonusText } = useMemo(() => {
    let instinctMod = Math.floor((character.stats.instinct - 10) / 2);
    let score = 10 + instinctMod;
    const penalties: string[] = [];
    const bonuses: string[] = [];

    if (isNight) {
        if (isGnome || isVampire) {
            score += 2; 
            bonuses.push("(+2 Night Vision)");
        }
        if (!isGnome && !isVampire && !isFullMoon) { // Normal night
             score -= 5;
            penalties.push("(-5 Darkness)");
        }
    } else { // Day
        if (isVampire) {
            score -= 10; // Vampire daylight penalty
            penalties.push("(-10 Sunlight)");
        }
        if (isGnome) {
            score -= 2; // Spore Gnome daylight penalty
            penalties.push("(-2 Sunlight)");
        }
    }

    if(isFullMoon) {
      // New moon is not full moon. The prompt seems to confuse new/full moon. Assuming full moon is bright.
      // And new moon is dark. `isFullMoon` is what we have.
      if(!isNight) {
        // No effect during day
      } else if (!isGnome && !isVampire) { // At night on a full moon
         // Brighter than normal night, so less penalty
         score += 4; // Let's say it negates most of the darkness penalty.
         bonuses.push("(+4 Full Moon)");
      }
    } else { // Not a full moon, check for new moon penalty
        if (isNight && !isGnome && !isVampire) {
             // New moon is extra dark. Let's add an additional penalty on top of darkness.
            score -= 1;
            penalties.push("(-1 New Moon)");
        }
    }
    
    const bonusText = [...bonuses, ...penalties].join(' ');
    return { perceptionScore: score, perceptionBonusText: bonusText };

  }, [character.stats.instinct, isNight, isGnome, isVampire, isFullMoon]);

  
  const derivedConcentrationScore = useMemo(() => {
    let score = character.stats.constitution;
    if (isDruid || isMonk) {
        score += 1;
    }
    return score;
  }, [character.stats.constitution, isDruid, isMonk]);

  const { warlockWillpowerPenalty, warlockLeadershipPenalty } = useMemo(() => {
    if (character.class !== 'Warlock' || character.level < 10) {
      return { warlockWillpowerPenalty: 0, warlockLeadershipPenalty: 0 };
    }

    // Level 10: -1 to each
    // Level 20: -6 Willpower, -5 Leadership
    const levelRange = 10; // 10 to 20
    const progress = (character.level - 10) / levelRange;
    
    const willpowerPenalty = Math.floor(1 + progress * 5); // From 1 to 6
    const leadershipPenalty = Math.floor(1 + progress * 4); // From 1 to 5

    return { 
      warlockWillpowerPenalty: -willpowerPenalty,
      warlockLeadershipPenalty: -leadershipPenalty
    };
  }, [character.class, character.level]);

  const { leadershipScore, leadershipPenaltyText } = useMemo(() => {
    let score = character.stats.leadership + warlockLeadershipPenalty;
    let penaltyTexts: string[] = [];

    if (character.class === 'Noble') {
        const background = character.background.toLowerCase();
        if (['prince', 'princess'].includes(background)) score += 1;
        if (['baron', 'baroness', 'sheikh'].includes(background)) score += 2;
        if (['duke', 'duchess', 'sultan', 'sultaness'].includes(background)) score += 3;
    }
    
    const formerPeerClasses = ['Soldier', 'Engineer', 'Pilot', 'Phase Craft Technician'];
    if (character.multiclass === 'Thief' && formerPeerClasses.includes(character.class)) {
        score -= 2;
        penaltyTexts.push("(-2 Disgraced)");
    }
    
    const hasDisguiseKit = character.inventory?.some(item => item.id === 'disguise-kit');
    const isWearingThiefsCoat = character.equipped.cloak?.id === 'thiefs-coat';

    if (isWearingThiefsCoat && !hasDisguiseKit) {
      const isThiefOrSpy = character.class === 'Thief' || character.class === 'Spy';
      const isNoble = NOBLE_BACKGROUNDS.includes(character.background.toLowerCase());

      if (!isThiefOrSpy) {
        if (isNoble) {
          score -= 3;
          penaltyTexts.push("(-3 Thief's Coat)");
        } else {
          score -= 2;
          penaltyTexts.push("(-2 Thief's Coat)");
        }
      }
    }
    return { leadershipScore: score, leadershipPenaltyText: penaltyTexts.length > 0 ? penaltyTexts.join(' ') : null };
  }, [character, warlockLeadershipPenalty]);
  
  const finalWillpower = useMemo(() => {
      return character.stats.willpower + warlockLeadershipPenalty;
  }, [character.stats.willpower, warlockLeadershipPenalty]);


  const armorClassScore = useMemo(() => {
    const equippedArmor = character.equipped.armor;
    if (equippedArmor && isArmor(equippedArmor)) {
      const bonus = equippedArmor.ac || 0;
      return 12 + Math.floor(bonus / 2);
    }
    return 12;
  }, [character.equipped.armor]);


  const isSpellcaster = SPELLCASTING_CLASSES.includes(character.class);
  const hpPercentage = (character.hp.current / character.hp.max) * 100;
  const xpPercentage = (character.xp.current / character.xp.nextLevel) * 100;
  
  const innateMagicScore = useMemo(() => {
    let score = Math.max(6, Math.floor((character.stats.instinct + character.stats.knowledge) / 2));
    if (isDruid) {
        score += 1;
    }
    return score;
  }, [character.stats.instinct, character.stats.knowledge, isDruid]);
  
  const spellDl = useMemo(() => {
      return 10 + Math.floor((character.stats.knowledge - 10) / 2) + masteryBonus;
  }, [character.stats.knowledge, masteryBonus]);

  const innateMagicPercentage = (character.innateMagic.current / innateMagicScore) * 100;


  const characterStats = {
      ...character.stats,
      leadership: leadershipScore,
      willpower: finalWillpower,
  }

  const hasBattleRage = character.feats?.some(f => f.name === "Battle Rage");

  const tabCount = isSpellcaster ? 6 : 5;
  
  const isRankedClass = ['Soldier', 'Engineer', 'Pilot', 'Phase Craft Technician', 'Healer', 'Monk'].includes(character.class);
  const isDegreeClass = character.class.startsWith('Magus') || ['Druid', 'Warlock', 'Monster Hunter'].includes(character.class) || character.background === 'Demon hunter';
  const isWarlock = character.class === 'Warlock';
  const soulPercentage = (character.soulPercentage ?? 100);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
       <div className="flex justify-between items-start">
        <div className="grid grid-cols-3 gap-8 items-center flex-grow">
            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1 text-center">
                    <Shield className="h-10 w-10 text-muted-foreground" />
                    <div className="text-5xl font-bold">{armorClassScore}</div>
                    <div className="text-sm text-muted-foreground">Armor Points</div>
                </div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="relative h-48 w-48 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
                <Image
                  src={character.portrait.imageUrl}
                  alt={character.portrait.description}
                  data-ai-hint={character.portrait.imageHint}
                  fill
                  className="object-cover object-top"
                />
              </div>
               <CardHeader className="p-4">
                  <CardTitle className="font-headline text-5xl">{character.name}</CardTitle>
                  {isRankedClass && character.rank && (
                    <CardDescription className="text-xl text-primary font-semibold">
                      {character.rank}
                    </CardDescription>
                  )}
                  {isDegreeClass && (
                    <CardDescription className="text-xl text-primary font-semibold">
                      {character.class.startsWith('Magus') ? character.class : character.degree}
                    </CardDescription>
                  )}
                  <CardDescription className="text-lg text-amber-200/80">
                    Level {character.level} {character.race} {character.class.startsWith('Magus') ? 'Magus' : character.class}
                  </CardDescription>
                   <div className="pt-1">
                      <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-medium text-purple-300/80 flex items-center gap-1"><Star className="w-3 h-3"/> XP</span>
                          <span className="font-mono text-xs">{character.xp.current} / {character.xp.nextLevel}</span>
                      </div>
                      <Progress value={xpPercentage} className="h-2" />
                    </div>
                </CardHeader>
            </div>

            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1 text-center">
                    <DaggerIcon className="h-10 w-10 text-muted-foreground" />
                    <div className="text-5xl font-bold">{character.initiative}</div>
                    <div className="text-sm text-muted-foreground">Initiative</div>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
          {showTimeToggle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Sun className={cn("h-6 w-6", !isNight && "text-primary")} />
                    <Switch id="day-night-toggle" checked={isNight} onCheckedChange={setIsNight} />
                    <Moon className={cn("h-6 w-6", isNight && "text-primary")} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle between Day and Night to see effects on stats like Perception for characters with light sensitivity or night vision.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
            <CharacterEditor
              character={character}
              onSave={(updated) => handleSave(updated)}
              isOpen={isEditorOpen}
              setIsOpen={setEditorOpen}
            >
              <Button>
                <Pencil className="mr-2 h-4 w-4" /> Edit Character
              </Button>
            </CharacterEditor>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Vitality & Movement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-green-400">Health</span>
                    <span className="font-mono text-sm">{character.hp.current} / {character.hp.max}</span>
                </div>
                <Progress value={hpPercentage} className="h-4" />
              </div>
               <div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-blue-400">Innate Magic</span>
                    <span className="font-mono text-sm">{character.innateMagic.current} / {innateMagicScore}</span>
                </div>
                <Progress value={innateMagicPercentage} className="h-4" />
              </div>
               {isWarlock && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-destructive-foreground/80 flex items-center gap-1"><HeartCrack /> Soul</span>
                      <span className="font-mono text-sm">{soulPercentage}% Remaining</span>
                  </div>
                  <Progress value={soulPercentage} className="h-4" />
                </div>
              )}
              <div className="flex justify-around pt-4">
                {isSpellcaster && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-1 text-center cursor-help">
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                                <div className="text-3xl font-bold">{spellDl}</div>
                                <div className="text-xs text-muted-foreground">Spell DL</div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Spell Difficulty Level = 10 + Knowledge modifier + Mastery Bonus</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
                )}
                 <div className="flex flex-col items-center gap-1 text-center">
                    <FootprintsIcon className="h-6 w-6 text-muted-foreground" />
                    <div className="text-3xl font-bold">{movementSpeed}</div>
                    <div className="text-xs text-muted-foreground">Speed (ft)</div>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Traits</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-4">
                    {Object.entries(characterStats).map(([stat, value]) => {
                        const isWarlockPenalty = isWarlock && (stat === 'willpower' || stat === 'leadership');
                        let bonus = 0;
                        if(stat === 'leadership' && character.class === 'Noble') {
                          const bg = character.background.toLowerCase();
                          if (['prince', 'princess'].includes(bg)) bonus = 1;
                          else if (['baron', 'baroness', 'sheikh'].includes(bg)) bonus = 2;
                          else if (['duke', 'duchess', 'sultan', 'sultaness'].includes(bg)) bonus = 3;
                        }

                         return (
                            <StatBox
                                key={stat}
                                name={statNames[stat]}
                                value={value + bonus}
                                penaltyText={stat === 'leadership' ? leadershipPenaltyText : null}
                                tooltip={isWarlockPenalty ? "Warlock's Bargain Penalty" : bonus > 0 ? `+${bonus} from Noble background` : undefined}
                           />
                         )
                    })}
                    <StatBox name={statNames['perception']} value={perceptionScore} penaltyText={perceptionBonusText} icon={<Eye className="w-4 h-4"/>} />
                    <StatBox name={statNames['concentration']} value={derivedConcentrationScore} icon={<BrainCircuit className="w-4 h-4"/>}/>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className={`grid w-full grid-cols-${tabCount}`}>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="feats">Feats</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    {isSpellcaster && <TabsTrigger value="spells">Spells</TabsTrigger>}
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                </TabsList>
                <TabsContent value="skills">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-3xl">Skills</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Skill</TableHead>
                                        <TableHead className="text-right">Modifier</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(character.skills).map(([skill, modifier]) => (
                                        <TableRow key={skill}>
                                            <TableCell className="font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</TableCell>
                                            <TableCell className="text-right font-mono text-lg">{modifier + masteryBonus >= 0 ? `+${modifier + masteryBonus}` : modifier + masteryBonus}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="feats">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-3xl">Feats</CardTitle></CardHeader>
                        <CardContent>
                           {(character.feats && character.feats.length > 0) ? (
                                <ul className="space-y-3">
                                    {character.feats.map(feat => feat && (
                                        <li key={feat.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border">
                                            <BookOpenCheck className="w-5 h-5 mt-1 text-amber-400 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{feat.name}</h4>
                                                <p className="text-xs text-muted-foreground">{feat.description}</p>
                                                {feat.name === 'Battle Rage' && (
                                                    <div className="mt-2">
                                                        <RadioGroup
                                                            value={ragePointsUsed.toString()}
                                                            onValueChange={(value) => setRagePointsUsed(parseInt(value))}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Label className="text-xs mr-2">Rage Points Used:</Label>
                                                            {maxRagePoints !== Infinity && Array.from({ length: maxRagePoints }).map((_, i) => (
                                                                <div key={i} className="flex items-center space-x-1">
                                                                    <RadioGroupItem value={(i + 1).toString()} id={`rage-${i + 1}`} />
                                                                    <Label htmlFor={`rage-${i + 1}`} className="text-xs">
                                                                        {i + 1}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                            {maxRagePoints === Infinity && <p className="text-xs text-primary">Unlimited</p>}
                                                        </RadioGroup>
                                                         <Button variant="ghost" size="sm" className="text-xs h-auto p-1 mt-1" onClick={() => setRagePointsUsed(0)}>Reset</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center">No feats acquired.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inventory">
                    <InventoryManager character={character} onInventoryChange={handleInventoryChange} />
                </TabsContent>
                {isSpellcaster && <TabsContent value="spells">
                    <Spellbook spells={character.spells} />
                </TabsContent>}
                <TabsContent value="vehicles">
                    <VehicleStats />
                </TabsContent>
                <TabsContent value="details">
                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline text-3xl">Appearance and Backstory</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-4">
                            <div>
                                <h4 className="font-semibold text-amber-300">Appearance</h4>
                                <p className="text-foreground/80 whitespace-pre-wrap">{character.appearance}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-amber-300">Backstory</h4>
                                <p className="text-foreground/80 whitespace-pre-wrap">{character.backstory}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}




    

    

    