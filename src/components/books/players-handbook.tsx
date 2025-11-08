
'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import Link from 'next/link';

const tocItems = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Character Creation', href: '#character-creation' },
  { label: 'Races', href: '#races' },
  { label: 'Classes', href: '#classes' },
  { label: 'Playing the Game', href: '#playing-the-game' },
  { label: 'Glossary', href: '#glossary' },
];

export function PlayersHandbook() {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="max-w-5xl mx-auto bg-card p-4 sm:p-6 md:p-8 rounded-lg print:p-0 print:bg-transparent print:shadow-none">
      <ScrollArea className="h-[calc(100vh-12rem)] print:h-auto">
        <article className="prose prose-stone dark:prose-invert max-w-none prose-h1:font-headline prose-h2:font-headline prose-h1:text-4xl prose-h2:text-3xl prose-a:text-primary print:prose-sm">
          
          <section id="title-page" className="text-center py-16 print:py-8 border-b border-border">
              <h1 className="!mb-2" contentEditable="true" suppressContentEditableWarning={true}>Vizura Role-Playing Game</h1>
              <h1 className="!mt-0" contentEditable="true" suppressContentEditableWarning={true}>Player's Handbook</h1>
              <div className="mt-8 w-full h-96 bg-muted/50 rounded-lg border-2 border-dashed flex items-center justify-center print:hidden relative overflow-hidden">
                 {coverImageUrl ? (
                    <Image src={coverImageUrl} alt="Handbook Cover" layout="fill" objectFit="cover" />
                 ) : (
                    <div className="text-center text-muted-foreground">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <Button variant="ghost" onClick={handleUploadClick}>
                           <Upload className="h-6 w-6 mr-2" />
                           Upload Cover Art
                        </Button>
                        <p className="text-xs mt-2">Recommended size: 800x1200px</p>
                    </div>
                 )}
              </div>
          </section>

          <section id="toc" className="py-8 print:py-4 border-b border-border">
            <h2 className="font-serif">Table of Contents</h2>
            <ul className="list-none p-0 columns-2 print:columns-1">
              {tocItems.map(item => (
                <li key={item.label} className="p-0 mb-2">
                  <a href={item.href} onClick={(e) => handleTocClick(e, item.href)} className="no-underline hover:underline font-serif">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          
          <div className="py-8 space-y-12" contentEditable="true" suppressContentEditableWarning={true}>
            <section id="introduction">
              <h2>Introduction</h2>
              <p>Welcome to the world of Vizura, a realm of high fantasy, political intrigue, and ancient magic. This handbook is your guide to creating characters, understanding the rules, and embarking on epic adventures. Whether you are a seasoned role-player or new to the hobby, the rules within these pages are designed to be flexible, intuitive, and focused on storytelling.</p>
            </section>
            
            <section id="character-creation">
                <h2>Chapter 1: Character Creation</h2>
                <p>Your character is your avatar in the world of Vizura. Creating a character is a process of defining their abilities, personality, and history. Follow these steps to create your hero:</p>
                <ol>
                    <li><strong>Concept:</strong> Start with a basic idea. Are they a grizzled soldier, a cunning thief, or a devout healer?</li>
                    <li><strong>Race:</strong> Choose a race for your character, which will grant them unique abilities.</li>
                    <li><strong>Class:</strong> Select a class, which determines your character's primary skills and role.</li>
                    <li><strong>Background:</strong> Your background fleshes out your history and provides additional context.</li>
                    <li><strong>Traits:</strong> Determine your character's core stats, like Strength and Agility.</li>
                    <li><strong>Details:</strong> Finish by describing your character's appearance and writing their backstory.</li>
                </ol>
            </section>

            <section id="races">
                <h2>Chapter 2: Races</h2>
                <p>Placeholder for detailed descriptions of all the races available in Vizura, such as Humans, Gnomes, Markul, and more.</p>
            </section>

            <section id="classes">
                <h2>Chapter 3: Classes</h2>
                <p>Placeholder for detailed descriptions of all the classes, from the noble Soldier to the enigmatic Warlock.</p>
            </section>

            <section id="playing-the-game">
                <h2>Chapter 4: Playing the Game</h2>
                <p>This chapter will cover the core mechanics of the game, including skill checks, combat, magic, and exploration.</p>
                <h3>Hit Point Calculation</h3>
                <p>At 1st level, your character's maximum Hit Points (HP) are calculated as: <strong>10 + your Constitution modifier</strong>. Each time you level up, you will gain additional HP.</p>
            </section>

            <section id="glossary">
              <h2>Glossary</h2>
              <p><strong>AC (Armor Class):</strong> A measure of how hard it is for an opponent to land a successful blow on you.</p>
              <p><strong>Modifier:</strong> A bonus or penalty applied to a dice roll, typically derived from one of your core traits.</p>
              <p><strong>Feat:</strong> A special ability that gives your character a unique capability, often outside the scope of their class or race.</p>
            </section>
          </div>

        </article>
      </ScrollArea>
    </div>
  );
}
