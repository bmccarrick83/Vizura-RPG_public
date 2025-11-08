
'use client';

import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { partyMembers, npcs } from '@/lib/campaign-data';
import { monsters, beasts } from '@/lib/bestiary-data';
import { PartyCard } from '@/components/campaign/party-card';
import { NpcCard } from '@/components/campaign/npc-card';
import { CreatureCard } from '@/components/campaign/creature-card';
import { CampaignContext } from '@/components/campaign/campaign-provider';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Link2, Settings, Share, Coins, Home, Landmark, ShieldCheck, Star, Clock, Trash2, Plus, Minus, ChevronsRight, ChevronsLeft, Moon, Sun, CloudSun, Leaf, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const initialMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function SeasonIcon({ season }: { season: string }) {
    switch (season) {
        case 'Spring': return <Leaf className="text-green-400 w-10 h-10" />;
        case 'Summer': return <CloudSun className="text-yellow-400 w-10 h-10" />;
        case 'Autumn': return <Leaf className="text-orange-400 w-10 h-10" />;
        case 'Winter': return <Snowflake className="text-blue-300 w-10 h-10" />;
        default: return null;
    }
}


export default function CampaignPage() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('CampaignContext must be used within a CampaignProvider');
  }
  const { isSolo, setIsSolo } = context;
  const mapImage = PlaceHolderImages.find(img => img.id === 'world-map')!;
  const [date, setDate] = useState<Date>();
  const [isGmOverrideEnabled, setIsGmOverrideEnabled] = useState(true);
  
  // Time of Day State
  const [time, setTime] = useState({ hour: 8, minute: 0 });
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [currentSeason, setCurrentSeason] = useState('');
  const [isNight, setIsNight] = useState(false);
  const [months, setMonths] = useState(initialMonths);
  const [newMonth, setNewMonth] = useState('');

  useEffect(() => {
    // Set initial random day and season on component mount
    setDayOfWeek(daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)]);
    setCurrentSeason(seasons[Math.floor(Math.random() * seasons.length)]);
  }, []);


  const shareableLink = typeof window !== 'undefined' ? `${window.location.origin}/campaign/join/abc-123` : '';

  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: 'Link Copied!',
      description: 'The shareable campaign link has been copied to your clipboard.',
    });
  };
  
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
  
  const handleMonthChange = (index: number, value: string) => {
    const newMonths = [...months];
    newMonths[index] = value;
    setMonths(newMonths);
  };

  const handleAddMonth = () => {
    if (newMonth.trim()) {
      setMonths([...months, newMonth.trim()]);
      setNewMonth('');
    }
  };

  const handleRemoveMonth = (index: number) => {
    setMonths(months.filter((_, i) => i !== index));
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-headline">Campaigns</h1>
          <p className="text-muted-foreground text-lg">Manage your ongoing adventures.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="solo-mode" className="text-lg">
            Solo Mode
          </Label>
          <Switch id="solo-mode" checked={isSolo} onCheckedChange={setIsSolo} />
        </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2"><Settings /> Campaign Setup</CardTitle>
          <CardDescription>Configure your next game session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              <div>
                <Label className="font-semibold">Next Session Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 h-full">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Keep GM Override for players?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allows players to bypass rules.
                    </p>
                  </div>
                  <Switch
                    checked={isGmOverrideEnabled}
                    onCheckedChange={setIsGmOverrideEnabled}
                    disabled={isSolo}
                  />
              </div>
               {isSolo && (
                  <div className="rounded-md border p-4 bg-muted/50 text-center h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">GM Override is always enabled in Solo Mode.</p>
                  </div>
                )}
          </div>
          
           <Separator />

           <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Clock /> Time & Calendar</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold">Time of Day</h4>
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
                        <div className="grid grid-cols-3 gap-2">
                           <Button variant="outline" onClick={() => adjustTime(-60)}><ChevronsLeft className="mr-2 h-4 w-4"/> -1 hr</Button>
                           <Button variant="outline" onClick={() => adjustTime(-15)}><Minus className="mr-2 h-4 w-4"/> -15 min</Button>
                           <Button variant="outline" onClick={() => adjustTime(60)}>+1 hr <ChevronsRight className="ml-2 h-4 w-4"/></Button>
                           <Button variant="outline" onClick={() => adjustTime(15)}>+15 min <Plus className="ml-2 h-4 w-4"/></Button>
                           <Button variant="outline" onClick={() => adjustTime(4 * 60)}>+4 hr</Button>
                           <Button variant="outline" onClick={() => adjustTime(8 * 60)}>Full Rest (8 hr)</Button>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold">Calendar Months</h4>
                        <div className="space-y-2">
                            {months.map((month, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={month}
                                        onChange={(e) => handleMonthChange(index, e.target.value)}
                                        className="h-8"
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveMonth(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="New month name..."
                                value={newMonth}
                                onChange={(e) => setNewMonth(e.target.value)}
                                className="h-9"
                            />
                            <Button onClick={handleAddMonth} size="sm">Add Month</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Tabs defaultValue="party">
              <TabsList>
                  <TabsTrigger value="party">Party</TabsTrigger>
                  <TabsTrigger value="npcs">NPCs</TabsTrigger>
                  <TabsTrigger value="monsters">Monsters</TabsTrigger>
                  <TabsTrigger value="beasts">Beasts</TabsTrigger>
              </TabsList>
              <TabsContent value="party">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partyMembers.map(member => (
                      <PartyCard key={member.id} member={member} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="npcs">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {npcs.map(npc => (
                      <NpcCard key={npc.id} npc={npc} />
                    ))}
                </div>
              </TabsContent>
               <TabsContent value="monsters">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monsters.map(creature => (
                      <CreatureCard key={creature.id} creature={creature} />
                    ))}
                </div>
              </TabsContent>
               <TabsContent value="beasts">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {beasts.map(creature => (
                      <CreatureCard key={creature.id} creature={creature} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}
