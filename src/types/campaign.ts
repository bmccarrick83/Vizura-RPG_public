
import { Timestamp } from 'firebase/firestore';

export interface Campaign {
  id: string;
  userAccountId: string;
  inGameTime: {
    day: number;
    hour: number;
  };
  isNight: boolean;
  createdAt: Timestamp;
}
