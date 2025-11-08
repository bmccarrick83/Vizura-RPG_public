
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { Character } from '@/types/character';
import { useFirebaseApp, useUser } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface CharacterEditorProps {
  character: Character;
  onSave: (character: Partial<Character>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function CharacterEditor({
  character,
  onSave,
  isOpen,
  setIsOpen,
  children,
}: CharacterEditorProps) {
  const [imageUrl, setImageUrl] = useState(character.portrait.imageUrl || '');
  const [imageHint, setImageHint] = useState(character.portrait.imageHint || '');
  const [isUploading, setIsUploading] = useState(false);
  const firebaseApp = useFirebaseApp();
  const { user } = useUser();

  const handleSave = () => {
    const updatedCharacter: Partial<Character> = {
      portrait: {
        ...character.portrait,
        imageUrl: imageUrl,
        imageHint: imageHint,
      },
    };
    onSave(updatedCharacter);
    setIsOpen(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && firebaseApp && user) {
          setIsUploading(true);
          const storage = getStorage(firebaseApp);
          const storageRef = ref(storage, `portraits/${user.uid}/${file.name}`);
          
          try {
              const snapshot = await uploadBytes(storageRef, file);
              const downloadUrl = await getDownloadURL(snapshot.ref);
              setImageUrl(downloadUrl);
          } catch(error) {
              console.error("Error uploading file:", error);
          } finally {
              setIsUploading(false);
          }
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {character.name}</DialogTitle>
          <DialogDescription>
            Update your character's details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="portrait">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="portrait">Portrait</TabsTrigger>
                <TabsTrigger value="info" disabled>Info</TabsTrigger>
            </TabsList>
            <TabsContent value="portrait" className="py-4">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                            <Input id="image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png"/>
                        </div>
                    </div>
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                            Or
                            </span>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="image-upload">Upload from Computer</Label>
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground"/>
                            <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="image-hint">AI Image Hint</Label>
                        <Input id="image-hint" value={imageHint} onChange={(e) => setImageHint(e.target.value)} placeholder="e.g. warrior elf"/>
                         <p className="text-xs text-muted-foreground mt-1">
                           Helps AI understand the image context. (Max 2 words)
                        </p>
                    </div>
                </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
