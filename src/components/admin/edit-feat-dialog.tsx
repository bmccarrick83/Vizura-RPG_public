
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Feat } from '@/lib/feat-data';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EditFeatDialogProps {
  feat: Feat | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (feat: Feat) => void;
  allFeatNames: string[];
}

export function EditFeatDialog({ feat, isOpen, onClose, onSave, allFeatNames }: EditFeatDialogProps) {
  const [formData, setFormData] = useState<Partial<Feat> | null>(feat);
  const { toast } = useToast();

  useEffect(() => {
    if (feat) {
      setFormData(feat);
    }
  }, [feat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => (prev ? { ...prev, prerequisite: value === 'none' ? undefined : value } : null));
  };
  
  const handleSaveChanges = () => {
    if (!formData?.name?.trim()) {
        toast({ title: 'Name is required', variant: 'destructive' });
        return;
    }
    onSave(formData as Feat);
    onClose();
  };
  
  if (!isOpen || !feat || !formData) return null;

  const isNew = feat.name === '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create New Feat' : `Edit: ${feat.name}`}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Define a new feat for your players.' : 'Modify the feat properties below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={4} />
            </div>
            <div className="space-y-2">
                <Label>Prerequisite (Optional)</Label>
                <Select value={formData.prerequisite || 'none'} onValueChange={handleSelectChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {allFeatNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
       
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
