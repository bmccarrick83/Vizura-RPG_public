
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sun, Moon, Clock, ChevronsRight, ChevronsLeft, Plus, Minus, Leaf, Snowflake, CloudSun } from 'lucide-react';
import { characters as pregenCharacters } from '@/lib/placeholder-data';
import type { Character } from '@/types/character';
import { SoloCharacterSheet } from './solo-character-sheet';
import { cn } from '@/lib/utils';
import { SoloCampaignLayout } from './solo-campaign-layout';

const TOTAL_STEPS = 5;
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

function SeasonIcon({ season }: { season: string }) {
    switch (season) {
        case 'Spring': return <Leaf className="text-green-400 w-10 h-10" />;
        case 'Summer': return <CloudSun className="text-yellow-400 w-10 h-10" />;
        case 'Autumn': return <Leaf className="text-orange-400 w-10 h-10" />;
        case 'Winter': return <Snowflake className="text-blue-300 w-10 h-10" />;
        default: return null;
    }
}

function SoloTimeCard() {
    const [time, setTime] = useState({ hour: 8, minute: 0 });
    const [dayOfWeek] = useState(() => daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)]);
    const [currentSeason] = useState('Spring');
    const [isNight, setIsNight] = useState(false);

    const adjustTime = (minutes: number) => {
        let newMinute = time.minute + minutes;
        let newHour = time.hour;
        
        newHour += Math.floor(newMinute / 60);
        newMinute = newMinute % 60;
        
        if (newMinute < 0) {
            newMinute += 60;
            newHour -= 1;
        }
        
        newHour = (newHour + 24) % 24;

        const newIsNight = newHour >= 18 || newHour < 6;
        setIsNight(newIsNight);
        
        setTime({ hour: newHour, minute: newMinute });
    };

    return (
        <Card className="bg-muted/30 border">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Clock /> Time of Day</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-6 p-4 rounded-lg bg-background border">
                    <div className="flex flex-col items-center gap-1 text-center">
                        {isNight ? <Moon className="text-primary w-10 h-10" /> : <Sun className="text-primary w-10 h-10" />}
                        <span className="text-xs text-muted-foreground">{isNight ? 'Night' : 'Day'}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-5xl font-mono font-bold tracking-wider">
                            {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-muted-foreground font-semibold">{dayOfWeek}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <SeasonIcon season={currentSeason} />
                        <span className="text-xs text-muted-foreground">{currentSeason}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" onClick={() => adjustTime(4 * 60)}>+4 hr <ChevronsRight className="ml-2 h-4 w-4"/></Button>
                   <Button variant="outline" onClick={() => adjustTime(8 * 60)}>Full Rest (8 hr)</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex justify-center items-center gap-2 mb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 w-8 rounded-full ${currentStep > index ? 'bg-primary' : 'bg-muted'}`}
                />
            ))}
        </div>
    );
}

export function SoloCampaignStepper() {
    const [step, setStep] = useState(1);
    const [selectedChar, setSelectedChar] = useState<Partial<Character> | null>(null);
    const [displayedCharacters, setDisplayedCharacters] = useState<Partial<Character>[]>([]);
    
    // Function to shuffle an array
    const shuffleArray = (array: any[]) => {
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    }

    useEffect(() => {
        // Shuffle the characters once on mount and pick the first 3
        const shuffled = shuffleArray([...pregenCharacters]);
        setDisplayedCharacters(shuffled.slice(0, 3));
    }, []);

    const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleDeleteCharacter = useCallback((charId: string) => {
        // Find a new character that isn't currently displayed
        const displayedIds = new Set(displayedCharacters.map(c => c.id));
        const availablePool = pregenCharacters.filter(c => !displayedIds.has(c.id) || c.id === charId);
        const newCharacterPool = availablePool.filter(c => c.id !== charId);

        if (newCharacterPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * newCharacterPool.length);
            const newChar = newCharacterPool[randomIndex];
            setDisplayedCharacters(prev => prev.map(c => c.id === charId ? newChar : c));
        } else {
             // If no new characters are available, just remove the old one
             setDisplayedCharacters(prev => prev.filter(c => c.id !== charId));
        }

        // If the deleted character was the selected one, unselect it
        if (selectedChar?.id === charId) {
            setSelectedChar(null);
        }
    }, [displayedCharacters, selectedChar]);

    if (step === TOTAL_STEPS) {
      return <SoloCampaignLayout />;
    }

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <StepIndicator currentStep={step} />
                    <CardTitle className="text-2xl text-center">
                        {step === 1 && 'Step 1: Choose Your Hero'}
                        {step === 2 && 'Step 2: Select a Scenario'}
                        {step === 3 && 'Step 3: Define the World'}
                        {step === 4 && 'Step 4: Set the Time & Difficulty'}
                    </CardTitle>
                     <CardDescription className="text-center">
                        {step === 1 && 'Select a character to lead your solo journey.'}
                        {step === 2 && 'What kind of adventure are you looking for?'}
                        {step === 3 && 'Generate or load a world map.'}
                        {step === 4 && 'Adjust the starting time and challenge to your liking.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[350px] flex items-center justify-center">
                   {step === 1 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {displayedCharacters.map(char => (
                            <div key={char.id} onClick={() => setSelectedChar(char)} className={cn("cursor-pointer rounded-lg", selectedChar?.id === char.id && "ring-2 ring-primary shadow-lg")}>
                                <SoloCharacterSheet 
                                    character={char as Character} 
                                    onDelete={() => handleDeleteCharacter(char.id!)}
                                />
                            </div>
                        ))}
                     </div>
                   )}
                   {step === 2 && <p className="text-muted-foreground">Scenario selection coming soon.</p>}
                   {step === 3 && <p className="text-muted-foreground">World definition coming soon.</p>}
                   {step === 4 && <SoloTimeCard />}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Previous
                    </Button>
                    <Button onClick={handleNext} disabled={step === 1 && !selectedChar}>
                        {step < TOTAL_STEPS - 1 ? 'Next' : 'Start Campaign'}
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
