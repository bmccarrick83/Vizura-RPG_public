
import { PlaceHolderImages } from './placeholder-images';

export type Building = {
    id: string;
    name: string;
    description: string;
    imageHint: string;
    imageUrl: string;
    associatedClass: string[];
};

export const allBuildings: Building[] = [
    {
        id: 'forge',
        name: 'Forge',
        description: 'A stone building with a tall chimney, billowing smoke. The sound of a hammer on anvil rings out from within.',
        imageHint: 'fantasy blacksmith forge',
        imageUrl: PlaceHolderImages.find(img => img.id === 'dashboard-hero')?.imageUrl || 'https://picsum.photos/seed/forge/400/300',
        associatedClass: ['Engineer'],
    },
    {
        id: 'watchtower',
        name: 'Watchtower',
        description: 'A tall, rickety wooden tower overlooking the surrounding area. It looks recently manned.',
        imageHint: 'fantasy watchtower',
        imageUrl: PlaceHolderImages.find(img => img.id === 'dashboard-hero')?.imageUrl || 'https://picsum.photos/seed/watchtower/400/300',
        associatedClass: ['Soldier'],
    }
];
