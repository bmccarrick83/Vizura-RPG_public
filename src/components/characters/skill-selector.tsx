

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, ShieldAlert, GitCompareArrows } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { ALL_SKILLS } from './character-creator';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SkillSelectorProps {
    classSkills: string[];
    currentSkills: string[];
    onSave: (newSkills: string[]) => void;
    characterLevel: number;
    specialSwaps?: Record<string, { from: string, to: string }>;
    selectedClass?: string;
}

export function SkillSelector({ classSkills, currentSkills, onSave, characterLevel, specialSwaps = {}, selectedClass }: SkillSelectorProps) {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isGmOverride, setIsGmOverride] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Separate the free skills from the class skills
        const freeSkills = currentSkills.filter(s => !classSkills.includes(s));
        setSelectedSkills(freeSkills);
    }, [currentSkills, classSkills]);

    const freeSkillSlots = useMemo(() => {
        if (isGmOverride) return Infinity;
        // Every player gets 3 free skills
        return 3;
    }, [isGmOverride]);

    const nonClassSkillsCount = selectedSkills.length;
    
    const finalClassSkills = useMemo(() => {
        let skills = [...classSkills];
        // Handle engineer swap: if Improved Instinct is chosen as a free skill, Rune Knowledge is no longer a class skill
        const swap = specialSwaps?.[selectedClass || ''];
        if (swap && selectedSkills.includes(swap.to)) {
             skills = skills.filter(s => s !== swap.from);
        }
        return skills;
    }, [classSkills, selectedSkills, specialSwaps, selectedClass]);

    const allCharacterSkills = useMemo(() => {
        return [...new Set([...finalClassSkills, ...selectedSkills])];
    }, [finalClassSkills, selectedSkills]);


    const handleGmOverrideChange = (checked: boolean) => {
        setIsGmOverride(checked);
        if (checked) {
            toast({
                title: "GM Override Activated",
                description: "Skill selection restrictions have been lifted.",
            });
        } else {
             toast({
                title: "GM Override Deactivated",
                description: "Skill selection restrictions are now enforced.",
            });
        }
    };

    const handleAddSkill = (skill: string) => {
        if (finalClassSkills.includes(skill)) {
            toast({ variant: 'destructive', title: 'Cannot add class skill', description: 'This skill is already granted by your class.' });
            return;
        }

        const alreadySelected = selectedSkills.includes(skill);
        if (alreadySelected) {
             toast({ variant: 'destructive', title: 'Skill already selected' });
             return;
        }

        if (nonClassSkillsCount >= freeSkillSlots && !isGmOverride) {
            toast({
                variant: 'destructive',
                title: 'Skill Slot Limit Reached',
                description: `You can only select ${freeSkillSlots} skill(s). Use GM Override to add more.`,
            });
            return;
        }
        
        setSelectedSkills(prev => [...prev, skill]);
    };
    
    const handleSave = () => {
        onSave(selectedSkills);
    }

    const handleRemoveSkill = (skillToRemove: string) => {
         if (finalClassSkills.includes(skillToRemove)) {
            toast({ variant: 'destructive', title: 'Cannot remove class skill', description: 'This skill is granted by your class and cannot be removed.' });
            return;
        }
        setSelectedSkills(prev => prev.filter(s => s !== skillToRemove));
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">Skill Selector</Button>
            </SheetTrigger>
            <SheetContent className="min-w-[800px] sm:min-w-[900px] flex flex-col">
                <SheetHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="font-title text-3xl">Skill Selector</SheetTitle>
                            <SheetDescription>
                                You get 3 free skills to choose from. You have {Math.max(0, freeSkillSlots - nonClassSkillsCount)} slots remaining.
                            </SheetDescription>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-2 bg-muted p-2 rounded-md border">
                                        <ShieldAlert className="text-primary h-5 w-5" />
                                        <Label htmlFor="gm-override-skill">GM Override</Label>
                                        <Switch id="gm-override-skill" checked={isGmOverride} onCheckedChange={handleGmOverrideChange} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Lift all skill selection restrictions.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-6 flex-grow overflow-y-auto pt-4">
                    <div className="flex flex-col gap-4">
                         <h3 className="font-title text-2xl">Available Skills</h3>
                         <div className="overflow-y-auto h-[calc(100vh-250px)] pr-2">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Skill</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ALL_SKILLS.map((skill) => {
                                        
                                        const isClassSkill = finalClassSkills.includes(skill);
                                        const isSelected = selectedSkills.includes(skill);
                                        const canAdd = nonClassSkillsCount < freeSkillSlots || isGmOverride;
                                        
                                        const swap = specialSwaps?.[selectedClass || ''];
                                        const isEngineerSwapTarget = swap && skill === swap.to;
                                        
                                        const isDisabled = (isClassSkill || isSelected || (!canAdd && !isEngineerSwapTarget)) && !isGmOverride;


                                        return(
                                            <TableRow key={skill} className={isClassSkill ? 'bg-muted/30' : ''}>
                                                <TableCell className="font-semibold">{skill} 
                                                    {isClassSkill && <span className="text-xs text-primary">(Class)</span>}
                                                    {isEngineerSwapTarget && <span className="text-xs text-blue-400 ml-1">(Swaps {swap.from})</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddSkill(skill)}
                                                        disabled={isDisabled}
                                                        variant={isEngineerSwapTarget ? 'outline' : 'default'}
                                                    >
                                                        {isEngineerSwapTarget ? <GitCompareArrows className="mr-2" /> : <PlusCircle className="mr-2" />}
                                                        {isEngineerSwapTarget ? 'Swap' : 'Add'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                         </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-title text-2xl">Selected Skills ({allCharacterSkills.length})</h3>
                        <div className="space-y-2 overflow-y-auto h-[calc(100vh-250px)] pr-2">
                            {allCharacterSkills.sort().map(skill => (
                                 <div key={skill} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                    <div>
                                        <p className="font-semibold">
                                            {skill} 
                                            {finalClassSkills.includes(skill) && <span className="text-xs text-primary ml-1">(Class)</span>}
                                            {selectedSkills.includes(skill) && !finalClassSkills.includes(skill) && <span className="text-xs text-green-400 ml-1">(Selected)</span>}
                                        </p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveSkill(skill)} disabled={finalClassSkills.includes(skill)}>Remove</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
