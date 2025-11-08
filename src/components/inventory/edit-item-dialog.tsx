
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
import { Item, ItemCategory, Rarity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EditItemDialogProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Extremely Rare', 'Legendary'];
const categories: ItemCategory[] = ['Weapon', 'Armor', 'Consumable', 'Backpack', 'Cloak/Coat', 'Mount', 'Vehicle', 'Currency', 'Item'];


export function EditItemDialog({ item, isOpen, onClose, onSave }: EditItemDialogProps) {
  const [formData, setFormData] = useState<Partial<Item> | null>(item);
  const { toast } = useToast();
  
  const [isHighValue, setIsHighValue] = useState(false);
  const [displayCost, setDisplayCost] = useState('');

  useEffect(() => {
    if (item) {
      setFormData(item);
      // Safely check for cost before evaluating it
      const highValue = item.category === 'Vehicle' || (item.cost !== undefined && item.cost >= 100);
      setIsHighValue(highValue);

      if (highValue) {
        setDisplayCost(((item.cost || 0) / 100).toString());
      } else {
        setDisplayCost((item.cost || 0).toString());
      }
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? (value === '' ? '' : Number(value)) : value,
    }));
  };
  
  const handleSelectChange = (name: keyof Item, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayCost(e.target.value);
  }

  const handleSaveChanges = () => {
    const costInUnits = parseFloat(displayCost) || 0;
    const finalCost = isHighValue ? Math.round(costInUnits * 100) : costInUnits;
    
    const updatedItem = {
        ...formData,
        cost: finalCost
    } as Item;

    onSave(updatedItem);
    toast({
      title: 'Item Saved',
      description: `Changes to "${updatedItem.name}" have been saved.`,
    });
    onClose();
  };
  
  if (!isOpen || !item) return null;

  const costLabel = isHighValue ? 'Cost (in Gold Crowns)' : 'Cost (in coppers)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit: {item.name}</DialogTitle>
          <DialogDescription>
            Modify the item properties below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] p-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData?.name || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="id">ID (cannot change)</Label>
                  <Input id="id" name="id" value={formData?.id || ''} readOnly disabled />
              </div>
              <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData?.description || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input id="weight" name="weight" type="number" value={formData?.weight || 0} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="cost">{costLabel}</Label>
                  <Input id="cost" name="cost" type="number" value={displayCost} onChange={handleCostChange} />
              </div>
               <div className="space-y-2">
                  <Label>Rarity</Label>
                  <Select value={formData?.rarity} onValueChange={(value) => handleSelectChange('rarity', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {rarities.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Category</Label>
                   <Select value={formData?.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
          </div>
        </ScrollArea>
       
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
