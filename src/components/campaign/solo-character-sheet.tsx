

'use client';

import type { Character, CharacterFeat } from '@/types/character';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, BrainCircuit, Heart, Backpack, BookOpen, Sparkles, Swords, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { getStartingEquipment } from '@/lib/items';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { allFeats } from '@/lib/feat-data';
import { allSpells } from '@/lib/spell-data';
import type { Spell } from '@/lib/types';
import { isWeapon, type Weapon } from '@/lib/item-data';

function StartingPackContents({ characterClass }: { characterClass: string }) {
    const equipment = getStartingEquipment(characterClass);
    return (
        <div className="space-y-2">
            {equipment.map((item, index) => (
                <div key={`${item.id}-${index}`} className="text-sm p-2 bg-muted/50 rounded-md">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
            ))}
        </div>
    )
}

function WeaponSheetContents({ characterClass }: { characterClass: string }) {
    const equipment = getStartingEquipment(characterClass);
    const weapons = equipment.filter(isWeapon);

    const ammoCount: Record<string, number> = {};
    equipment.forEach(item => {
        if (item.id === 'crossbow-bolt') {
            ammoCount['crossbow'] = (ammoCount['crossbow'] || 0) + 1;
        }
    });

    return (
        <div className="space-y-4">
            {weapons.length > 0 ? weapons.map((weapon, index) => (
                <div key={`${weapon.id}-${index}`} className="text-sm p-3 bg-muted/50 rounded-md border">
                    <p className="font-semibold text-base">{weapon.name}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                        <span>Damage: <span className="font-mono text-foreground">{weapon.damage}</span></span>
                        {weapon.properties?.includes('Ammunition') && (
                            <span>Ammo: {ammoCount[weapon.id] || 0}</span>
                        )}
                    </div>
                    {weapon.properties && <p className="text-xs text-muted-foreground mt-1">Properties: {weapon.properties.join(', ')}</p>}
                </div>
            )) : <p className="text-sm text-muted-foreground text-center">No weapons in starting pack.</p>}
        </div>
    )
}


export function SoloCharacterSheet({ character, onDelete }: { character: Character, onDelete?: () => void }) {
    if (!character || !character.stats || !character.hp || !character.class) {
        return null; // or a loading/error state
    }
    const ac = 12 + Math.floor((character.equipped?.armor?.ac || 0) / 2);
    const hp = character.hp;

    const characterFeats = character.feats || [];
    const characterSpells = character.spells || [];

    const hasSpecialAbilities = characterFeats.length > 0 || characterSpells.length > 0;

    return (
        <Card className="w-full relative group/sheet">
            {onDelete && (
                 <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/sheet:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
            <CardHeader>
                <CardTitle>{character.name}</CardTitle>
                <CardDescription>Lvl {character.level} {character.race} {character.class}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex justify-around text-center">
                    <div className="flex flex-col items-center">
                        <Shield className="h-6 w-6 text-blue-400" />
                        <span className="font-bold text-lg">{ac}</span>
                        <span className="text-xs text-muted-foreground">AC</span>
                    </div>
                     <div className="flex flex-col items-center">
                        <Heart className="h-6 w-6 text-red-400" />
                        <span className="font-bold text-lg">{hp.current}/{hp.max}</span>
                        <span className="text-xs text-muted-foreground">HP</span>
                    </div>
                </div>

                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Traits</h4>
                        {hasSpecialAbilities && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer">Racial</Badge>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        {characterFeats.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold mb-2 flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4"/> Racial Feats</h5>
                                                <div className="space-y-2">
                                                    {characterFeats.map(feat => (
                                                        <div key={feat.name}>
                                                            <p className="font-semibold text-xs">{feat.name}</p>
                                                            <p className="text-xs text-muted-foreground">{feat.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {characterSpells.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4"/> Starting Spells</h5>
                                                 <div className="space-y-2">
                                                    {characterSpells.map(spell => (
                                                        <div key={spell.id}>
                                                            <p className="font-semibold text-xs">{spell.name}</p>
                                                            <p className="text-xs text-muted-foreground">{spell.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {Object.entries(character.stats).map(([key, value]) => (
                            <div key={key} className="p-1 bg-muted/50 rounded">
                                <p className="font-bold uppercase">{key.substring(0,3)}</p>
                                <p>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                     <Table>
                        <TableBody>
                            {character.skills && Object.keys(character.skills).length > 0 ? (
                                Object.entries(character.skills).map(([skill, modifier]) => (
                                    <TableRow key={skill}>
                                        <TableCell className="font-medium text-xs p-1">{skill.replace(/([A-Z])/g, ' $1')}</TableCell>
                                        <TableCell className="text-right font-mono text-xs p-1">{modifier >= 0 ? `+${modifier}` : modifier}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-xs text-muted-foreground p-1">No skills defined.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="p-2 flex justify-between">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Swords className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Starting Weapons for {character.class}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
                            <WeaponSheetContents characterClass={character.class} />
                        </ScrollArea>
                    </SheetContent>
                </Sheet>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Backpack className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Starting Pack for {character.class}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
                            <StartingPackContents characterClass={character.class} />
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </CardFooter>
        </Card>
    )
}
