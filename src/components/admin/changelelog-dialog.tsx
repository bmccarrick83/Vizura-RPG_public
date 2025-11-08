'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Save,
  Backpack,
  TramFront,
  RefreshCcw,
  MessageSquare,
  Users,
  Send,
  Rocket,
} from 'lucide-react';
import { HorseshoeIcon } from '../icons/HorseshoeIcon';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { partyMembers } from '@/lib/campaign-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { characters as pregenCharacters } from '@/lib/placeholder-data';
import { SoloCharacterSheet } from './solo-character-sheet';
import { useState } from 'react';

function LeftBar() {
  const iconButtonClasses = "h-12 w-12";
  return (
    <div className="flex flex-col items-center gap-4 p-2 bg-card border-r">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={iconButtonClasses}>
              <Save />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Save Game</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={iconButtonClasses}>
              <Backpack />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Inventory</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={iconButtonClasses}>
              <TramFront />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Vehicles</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={iconButtonClasses}>
              <HorseshoeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Mounts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function TopBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCharacterSelect = () => {
    // Logic to start campaign with selected character
    setIsOpen(false);
  };
  
  return (
    <div className="flex items-center justify-between p-2 bg-card border-b">
       <div></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
                <Rocket className="mr-2 h-4 w-4" />
                Quick Start
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose your Hero</DialogTitle>
              <DialogDescription>Select a pre-generated character to start your solo adventure immediately.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pregenCharacters.map(char => (
                  <div key={char.id} onClick={handleCharacterSelect} className="cursor-pointer">
                    <SoloCharacterSheet character={char} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <RefreshCcw />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>Restart Scenario</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}

function RightBar() {
  const sampleCrewMember = partyMembers[0];
  return (
    <div className="w-48 p-4 bg-card border-l overflow-y-auto">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users /> NPCs & Allies
      </h3>
      <div className="space-y-4">
        {/* Example Crew Token */}
        <div className="flex flex-col items-center text-center gap-2">
           <Avatar className="h-20 w-20 border-2 border-primary/50">
             <AvatarImage src={sampleCrewMember.imageUrl} alt={sampleCrewMember.name} />
             <AvatarFallback>
                <User className="h-10 w-10"/>
             </AvatarFallback>
           </Avatar>
           <div>
            <p className="font-semibold text-sm">{sampleCrewMember.name}</p>
            <p className="text-xs text-muted-foreground">{sampleCrewMember.class}</p>
           </div>
        </div>
        {/* Add more tokens here as needed */}
      </div>
    </div>
  );
}

function BottomBar() {
    return (
        <div className="h-56 flex flex-col p-4 bg-card border-t">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare /> Game Log & Chat</h3>
            <ScrollArea className="flex-1 bg-muted/30 p-3 rounded-md mb-2">
                 <div className="text-sm text-muted-foreground space-y-2">
                    <p><span className="text-primary font-semibold">Tavern Keeper:</span> Welcome to the Rusty Flagon, traveler. What can I get for ya?</p>
                 </div>
            </ScrollArea>
             <div className="flex items-center gap-2">
                <Textarea placeholder="What do you do?" className="flex-1 resize-none" rows={1} />
                <Button>
                    <Send className="h-4 w-4"/>
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
    );
}

export function SoloCampaignLayout() {
  return (
    <div className="h-[calc(100vh-10rem)] w-full flex flex-col bg-muted/20 rounded-lg border overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftBar />
        <main className="flex-1 overflow-auto">
            <Card className="h-full w-full flex items-center justify-center bg-background">
                <CardContent className="text-center p-0">
                    <p className="text-2xl font-semibold text-muted-foreground">Map Area</p>
                    <p className="text-muted-foreground">Coming Soon</p>
                </CardContent>
            </Card>
        </main>
        <RightBar />
      </div>
      <BottomBar />
    </div>
  );
}