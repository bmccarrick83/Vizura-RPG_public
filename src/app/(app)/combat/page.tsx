
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Dices, User, Swords, Heart, Shield, Fist } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Character } from '@/types/character';
import { Skeleton } from '@/components/ui/skeleton';

type RollType = 'advantage' | 'normal' | 'disadvantage';

type AttackResult = {
  characterName: string;
  roll1: number;
  roll2: number;
  finalRoll: number;
  attackModifier: number;
  attackTotal: number;
  weapon: string;
  isCrit: boolean;
  isFumble: boolean;
  targetArmor: number;
  isSuccess: boolean;
  rollType: RollType;
  damageRoll: number;
  strengthModifier: number;
  damageTotal: number;
  damageDie: string;
  timestamp: string;
  tieBreakerRoll?: { attacker: number; defender: number } | null;
};

type Weapon = {
    name: string;
    attackModifier: number;
    damageDie: string;
}

type UnarmedAttack = {
    name: string;
    damageDie: string;
}

const weapons: Weapon[] = [
  { name: 'Longsword', attackModifier: 5, damageDie: '1d8' },
  { name: 'Dagger', attackModifier: 4, damageDie: '1d4' },
  { name: 'Greataxe', attackModifier: 6, damageDie: '1d12' },
];

const unarmedAttacks: UnarmedAttack[] = [
    { name: 'Unarmed Strike', damageDie: '1d4' },
];

const rollDie = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
}

const parseAndRollDie = (dieString: string): number => {
    const match = dieString.match(/(\d+)d(\d+)/);
    if (!match) return 0;
    
    const numDice = parseInt(match[1]);
    const numSides = parseInt(match[2]);
    
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        total += rollDie(numSides);
    }
    return total;
}

export default function CombatPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const charactersRef = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'characters');
  }, [firestore, user?.uid]);

  const { data: characters, isLoading: areCharactersLoading } = useCollection<Character>(charactersRef);

  const [targetArmor, setTargetArmor] = useState('15');
  const [selectedAttack, setSelectedAttack] = useState(weapons[0].name);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [rollType, setRollType] = useState<RollType>('normal');
  const [combatLog, setCombatLog] = useState<AttackResult[]>([]);

  const selectedCharacter = characters?.find(c => c.id === selectedCharacterId);

  const availableUnarmedAttacks = useMemo(() => {
    const attacks = [...unarmedAttacks];
    if (selectedCharacter?.feats.some(f => f.name === 'Headbutt')) {
        attacks.push({ name: 'Headbutt', damageDie: '1d4' });
    }
    return attacks;
  }, [selectedCharacter]);

  const masteryBonus = useMemo(() => {
    if (!selectedCharacter) return 0;
    const level = selectedCharacter.level;
    if (level >= 11) return 4;
    if (level >= 8) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }, [selectedCharacter]);

  const handleAttack = () => {
    if (!selectedCharacter) return;
    
    const weapon = weapons.find(w => w.name === selectedAttack);
    const unarmedAttack = availableUnarmedAttacks.find(ua => ua.name === selectedAttack);

    if (!weapon && !unarmedAttack) return;

    const roll1 = rollDie(20);
    const roll2 = rollDie(20);

    let finalRoll: number;
    switch (rollType) {
      case 'advantage':
        finalRoll = Math.max(roll1, roll2);
        break;
      case 'disadvantage':
        finalRoll = Math.min(roll1, roll2);
        break;
      case 'normal':
      default:
        finalRoll = roll1;
        break;
    }

    const strengthModifier = Math.floor((selectedCharacter.stats.strength - 10) / 2);

    let attackModifier = 0;
    let damageDie = '1d4';
    if(weapon) {
        attackModifier = weapon.attackModifier;
        damageDie = weapon.damageDie;
    } else if (unarmedAttack) {
        attackModifier = strengthModifier; // Unarmed attacks use STR modifier to hit
        damageDie = unarmedAttack.damageDie;
    }

    const attackTotal = finalRoll + attackModifier + masteryBonus;
    const armor = parseInt(targetArmor);
    let isSuccess = finalRoll === 20 || (finalRoll !== 1 && attackTotal > armor);
    let tieBreakerRoll: { attacker: number; defender: number } | null = null;
    
    if (finalRoll !== 1 && finalRoll !== 20 && attackTotal === armor) {
        const attackerTieRoll = rollDie(20);
        const defenderTieRoll = rollDie(20);
        tieBreakerRoll = { attacker: attackerTieRoll, defender: defenderTieRoll };
        if (attackerTieRoll > defenderTieRoll) {
            isSuccess = true;
        }
    }


    let damageRoll = 0;
    let damageTotal = 0;

    if (isSuccess) {
        damageRoll = parseAndRollDie(damageDie);
        damageTotal = damageRoll + strengthModifier;
        if(selectedCharacter.class === 'Monk') {
            damageTotal += masteryBonus;
        }
        if(finalRoll === 20) { // Critical hit doubles dice roll
            damageTotal += damageRoll;
        }
    }
    
    const newResult: AttackResult = {
      characterName: selectedCharacter.name,
      roll1,
      roll2,
      finalRoll,
      attackModifier: attackModifier + masteryBonus,
      attackTotal,
      weapon: selectedAttack,
      isCrit: finalRoll === 20,
      isFumble: finalRoll === 1,
      targetArmor: armor,
      isSuccess,
      rollType,
      damageRoll,
      strengthModifier,
      damageTotal,
      damageDie: damageDie,
      timestamp: new Date().toLocaleTimeString(),
      tieBreakerRoll,
    };

    setCombatLog(prev => [newResult, ...prev]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Combat</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Swords /> Attack Roll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="character-select" className="text-sm font-medium">Attacking Character</Label>
              {areCharactersLoading ? (
                  <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCharacterId ?? ""} onValueChange={setSelectedCharacterId}>
                  <SelectTrigger id="character-select">
                    <SelectValue placeholder="Select character..." />
                  </SelectTrigger>
                  <SelectContent>
                    {characters?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Roll Type</Label>
              <RadioGroup value={rollType} onValueChange={(value: RollType) => setRollType(value)} className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <RadioGroupItem value="advantage" id="advantage" className="peer sr-only" />
                  <Label htmlFor="advantage" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Advantage
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
                  <Label htmlFor="normal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Normal
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="disadvantage" id="disadvantage" className="peer sr-only" />
                  <Label htmlFor="disadvantage" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Disadvantage
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="difficulty-select" className="text-sm font-medium">Target Armor</Label>
              <Select value={targetArmor} onValueChange={setTargetArmor}>
                <SelectTrigger id="difficulty-select">
                  <SelectValue placeholder="Select Target Armor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (Easy)</SelectItem>
                  <SelectItem value="15">15 (Medium)</SelectItem>
                  <SelectItem value="20">20 (Hard)</SelectItem>
                  <SelectItem value="25">25 (Very Hard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weapon-select" className="text-sm font-medium">Attack Type</Label>
              <Select value={selectedAttack} onValueChange={setSelectedAttack} disabled={!selectedCharacter}>
                <SelectTrigger id="weapon-select">
                  <SelectValue placeholder="Select attack..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Weapons</SelectLabel>
                        {weapons.map(w => <SelectItem key={w.name} value={w.name}>{w.name} (+{w.attackModifier})</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel>Unarmed Attacks</SelectLabel>
                        {availableUnarmedAttacks.map(ua => <SelectItem key={ua.name} value={ua.name}><div className="flex items-center gap-2"><Fist className="h-4 w-4" /> {ua.name}</div></SelectItem>)}
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleAttack} disabled={!selectedCharacterId}>
              <Dices className="mr-2 h-5 w-5"/> Roll Attack
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Combat Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] w-full rounded-md border p-4 bg-muted/30">
              {combatLog.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Your combat actions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {combatLog.map((log, index) => (
                    <div key={index}>
                        <div className="flex items-start justify-between gap-4 text-sm">
                            <div className="flex-1 space-y-1">
                                <p>
                                    <span className="font-semibold">{log.characterName}</span> attacks with <span className="font-semibold">{log.weapon}</span> vs AC <span className="font-semibold">{log.targetArmor}</span>.
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    Attack Roll ({log.rollType}): [{log.roll1}, {log.roll2}] &rarr; <span className="font-semibold">{log.finalRoll}</span> + {log.attackModifier} = <span className="font-bold text-lg">{log.attackTotal}</span>
                                </p>

                                {log.tieBreakerRoll && (
                                  <p className="text-xs text-blue-400">
                                    TIE! Tie-breaker: Attacker rolls <span className="font-bold">{log.tieBreakerRoll.attacker}</span>, Defender rolls <span className="font-bold">{log.tieBreakerRoll.defender}</span>.
                                  </p>
                                )}
                                
                                {log.isFumble ? (
                                     <p className="font-bold text-destructive flex items-center gap-2"><Shield className="w-4 h-4"/> FUMBLE!</p>
                                ) : log.isCrit ? (
                                    <p className="font-bold text-primary flex items-center gap-2"><Heart className="w-4 h-4"/> CRITICAL HIT! for {log.damageTotal} damage.</p>
                                ) : log.isSuccess ? (
                                    <p className="font-bold text-green-400 flex items-center gap-2"><Heart className="w-4 h-4"/> HIT! for {log.damageTotal} damage.</p>
                                ) : (
                                    <p className="font-bold text-red-400 flex items-center gap-2"><Shield className="w-4 h-4"/> MISS!</p>
                                )}

                                {log.isSuccess && (
                                     <p className="text-xs text-muted-foreground">
                                        Damage: ({log.damageDie}) <span className="font-semibold">{log.damageRoll}</span> + STR Mod <span className="font-semibold">{log.strengthModifier > 0 ? `+${log.strengthModifier}`: log.strengthModifier}</span> {log.isCrit && `+ Crit bonus ${log.damageRoll}`} = <span className="font-bold text-base">{log.damageTotal}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                            </div>
                        </div>
                        {index < combatLog.length -1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
