
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './use-toast';
import { allAchievements, levelAchievements, multiclassAchievements } from '@/lib/achievements-data';
import type { Character } from '@/types/character';

export function useAchievements(character: Character | null) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const processedLevelRef = useRef<number>(0);

  const achievementsRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'achievements');
  }, [firestore, user]);

  const { data: unlockedAchievements } = useCollection<{ id: string }>(achievementsRef);
  const unlockedAchievementIds = useMemo(() => new Set(unlockedAchievements?.map(a => a.id)), [unlockedAchievements]);

  const unlockAchievement = async (achievementId: string) => {
    if (!user || !firestore || unlockedAchievementIds.has(achievementId)) {
        return;
    }

    const achievement = allAchievements.find(a => a.id === achievementId);
    if (achievement) {
        try {
            const achievementRef = doc(firestore, 'users', user.uid, 'achievements', achievement.id);
            await setDoc(achievementRef, {
                id: achievement.id,
                unlockedAt: serverTimestamp()
            });

            toast({
                title: 'Achievement Unlocked!',
                description: achievement.title,
                duration: 20000,
                icon: 'trophy',
            });

            unlockedAchievementIds.add(achievementId);
        } catch (error) {
            console.error(`Failed to unlock achievement ${achievementId}:`, error);
        }
    }
  };


  useEffect(() => {
    if (!character || !user || !firestore) {
      return;
    }

    // Check for level-based achievements
    if (character.level > processedLevelRef.current) {
        for (const level in levelAchievements) {
            const achievementId = levelAchievements[level as unknown as keyof typeof levelAchievements];
            if (character.level >= Number(level)) {
                unlockAchievement(achievementId);
            }
        }
        processedLevelRef.current = character.level;
    }
    
    // Check for multiclass achievements
    if (character.multiclass && multiclassAchievements[character.class] && multiclassAchievements[character.class][character.multiclass]) {
        const achievementId = multiclassAchievements[character.class][character.multiclass];
        unlockAchievement(achievementId);
    }

  }, [character, user, firestore, toast]); // removed unlockedAchievementIds from deps to avoid re-triggering

  return { unlockAchievement };
}
