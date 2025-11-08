'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { generateCharacterBackstory } from "@/ai/flows/generate-character-backstory";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

interface AiBackstoryGeneratorProps {
    characterData: {
        name: string;
        race: string;
        class: string;
        background: string;
        stats: { name: string; value: number }[];
        feats: string[];
    };
    onUpdate: (backstory: string, appearance: string) => void;
}

export function AiBackstoryGenerator({ characterData, onUpdate }: AiBackstoryGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ backstory: string, appearance: string} | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        const { name, race, "class": className, background, stats } = characterData;
        
        if (!name || !race || !className || !background) {
            toast({
                title: 'Incomplete Information',
                description: 'Please fill out Name, Race, Class, and Background before generating.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const statsRecord = stats.reduce((acc, stat) => {
                acc[stat.name.toLowerCase()] = stat.value;
                return acc;
            }, {} as Record<string, number>);

            const response = await generateCharacterBackstory({
                name,
                race,
                class: className,
                background,
                stats: statsRecord,
            });
            setResult(response);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Generation Failed',
                description: 'Could not generate backstory. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleApply = () => {
        if(result) {
            onUpdate(result.backstory, result.appearance);
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">AI Backstory Generator</DialogTitle>
                    <DialogDescription>
                        Generate a unique backstory and appearance for your character based on their details.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate with AI
                    </Button>

                    {result && (
                        <Card className="mt-4 max-h-[50vh] overflow-y-auto">
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-headline text-xl text-primary">Appearance</h3>
                                    <p className="text-sm text-muted-foreground">{result.appearance}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-headline text-xl text-primary">Backstory</h3>
                                    <p className="text-sm text-muted-foreground">{result.backstory}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleApply} disabled={!result}>Apply to Character</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
