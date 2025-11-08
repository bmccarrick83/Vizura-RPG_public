
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { allAchievements, type AchievementDefinition } from '@/lib/achievements-data';
import { Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';

interface UnlockedAchievement {
    id: string;
    unlockedAt: Timestamp;
}

export default function AchievementsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const achievementsRef = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return collection(firestore, 'users', user.uid, 'achievements');
    }, [firestore, user?.uid]);

    const { data: unlockedAchievements, isLoading } = useCollection<UnlockedAchievement>(achievementsRef);
    
    const unlockedMap = new Map(unlockedAchievements?.map(a => [a.id, a.unlockedAt]));

    return (
        <div className="space-y-6">
            <h1 className="text-4xl">Achievements</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Your Triumphs</CardTitle>
                    <CardDescription>A record of your notable accomplishments throughout your adventures.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allAchievements.map(achievement => {
                                const isUnlocked = unlockedMap.has(achievement.id);
                                const unlockedAt = unlockedMap.get(achievement.id);
                                return (
                                    <Card 
                                        key={achievement.id}
                                        className={cn("flex flex-col items-center justify-center p-6 text-center transition-all", isUnlocked ? 'border-primary/50 bg-primary/10' : 'bg-muted/50')}
                                    >
                                        {isUnlocked ? (
                                            <Trophy className="h-12 w-12 text-primary mb-2" />
                                        ) : (
                                            <Lock className="h-12 w-12 text-muted-foreground mb-2" />
                                        )}
                                        <h3 className={cn("text-lg font-semibold", isUnlocked ? 'text-primary' : 'text-foreground')}>
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {achievement.description}
                                        </p>
                                        {isUnlocked && unlockedAt && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Unlocked {formatDistanceToNow(unlockedAt.toDate(), { addSuffix: true })}
                                            </p>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
