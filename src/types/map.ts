
import { Timestamp } from 'firebase/firestore';

export interface Map {
    id: string;
    name: string;
    tiles: string; 
    createdAt: Timestamp;
    userId: string;
}
