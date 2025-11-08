
export interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
    trigger?: 'level' | 'multiclass' | 'event';
}

export const allAchievements: AchievementDefinition[] = [
    {
        id: 'level-5',
        title: 'Seasoned Adventurer',
        description: 'Reach character level 5.',
        icon: 'trophy',
        trigger: 'level'
    },
    {
        id: 'level-10',
        title: 'Veteran Hero',
        description: 'Reach character level 10.',
        icon: 'trophy',
        trigger: 'level'
    },
    {
        id: 'level-15',
        title: 'Master of the Realm',
        description: 'Reach character level 15.',
        icon: 'trophy',
        trigger: 'level'
    },
    {
        id: 'level-20',
        title: 'Legend of the Ages',
        description: 'Reach character level 20.',
        icon: 'trophy',
        trigger: 'level'
    },
    {
        id: 'disgraced-noble',
        title: 'A Fall From Grace',
        description: 'Chose the shadows over your station by multiclassing into a Thief.',
        icon: 'trophy',
        trigger: 'multiclass'
    },
    {
        id: 'busted-down',
        title: 'Busted Down',
        description: 'You were caught and stripped of your rank and privileges.',
        icon: 'trophy',
        trigger: 'multiclass'
    },
    {
        id: 'exiled-monk',
        title: 'Exiled Monk',
        description: 'Caught stealing, you were exiled from your monastery, breaking a piece of your spirit.',
        icon: 'trophy',
        trigger: 'multiclass'
    },
    {
        id: 'tavern-brawl',
        title: 'Tavern Brawl',
        description: 'You got into a fight in a tavern.',
        icon: 'trophy',
        trigger: 'event'
    }
];

export const levelAchievements: Record<number, string> = {
    5: 'level-5',
    10: 'level-10',
    15: 'level-15',
    20: 'level-20',
};

export const multiclassAchievements: Record<string, Record<string, string>> = {
    'Noble': {
        'Thief': 'disgraced-noble'
    },
    'Soldier': {
        'Thief': 'busted-down'
    },
    'Engineer': {
        'Thief': 'busted-down'
    },
    'Pilot': {
        'Thief': 'busted-down'
    },
    'Phase Craft Technician': {
        'Thief': 'busted-down'
    },
    'Monk': {
        'Thief': 'exiled-monk'
    }
};

    
