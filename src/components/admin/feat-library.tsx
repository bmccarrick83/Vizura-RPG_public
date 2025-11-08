
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Plus, Copy } from 'lucide-react';
import { allFeats as initialFeats, type Feat } from "@/lib/feat-data";
import { FeatCard } from "@/components/admin/feat-card";
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { EditFeatDialog } from './edit-feat-dialog';

export function FeatLibrary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [feats, setFeats] = useState<Feat[]>(initialFeats);
    const [editingFeat, setEditingFeat] = useState<Feat | null>(null);
    const { toast } = useToast();

    const filteredFeats = useMemo(() => {
        return feats.filter(feat => {
            if (!feat) return false;
            const term = searchTerm.toLowerCase();
            if (!term) return true;
            return (feat.name?.toLowerCase() || '').includes(term) || (feat.description?.toLowerCase() || '').includes(term);
        }).filter(Boolean); // Ensure no null or undefined items are in the final array
    }, [searchTerm, feats]);
    
    const handleSaveFeat = (updatedFeat: Feat) => {
        if (feats.some(f => f.id === updatedFeat.id)) {
            // Editing existing
            setFeats(feats.map(feat => feat.id === updatedFeat.id ? updatedFeat : feat));
            toast({ title: 'Feat Saved', description: `Changes to "${updatedFeat.name}" have been saved.` });
        } else {
            // Adding new
            setFeats([updatedFeat, ...feats]);
            toast({ title: 'Feat Created', description: `"${updatedFeat.name}" has been added to the library.` });
        }
        setEditingFeat(null);
    };
    
    const handleDeleteFeat = (featId: string) => {
        setFeats(feats.filter(feat => feat.id !== featId));
    };
    
    const handleCloneFeat = (featToClone: Feat) => {
        const newId = `${featToClone.id}-clone-${Date.now()}`;
        const clonedFeat: Feat = {
            ...featToClone,
            id: newId,
            name: `${featToClone.name} (Copy)`,
        };
        setFeats(prev => [clonedFeat, ...prev]);
        toast({ title: "Feat Cloned", description: `A copy of "${featToClone.name}" has been created.` });
    };

    const handleCreateNew = () => {
        setEditingFeat({
            id: `new-feat-${Date.now()}`,
            name: '',
            description: '',
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search all feats..."
                        className="pl-10 text-lg h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button size="lg" onClick={handleCreateNew}>
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Feat
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFeats.map(feat => (
                    <FeatCard 
                        key={feat.id} 
                        feat={feat} 
                        onEdit={() => setEditingFeat(feat)}
                        onDelete={() => handleDeleteFeat(feat.id)}
                        onClone={() => handleCloneFeat(feat)}
                     />
                ))}
            </div>
             {filteredFeats.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No feats found matching your criteria.</p>
                </div>
            )}

            
            <EditFeatDialog
                feat={editingFeat}
                isOpen={!!editingFeat}
                onClose={() => setEditingFeat(null)}
                onSave={handleSaveFeat}
                allFeatNames={feats.filter(f => f.id !== editingFeat?.id).map(f => f.name)}
            />
            
        </div>
    );
}
