
export interface XPLevel {
    level: number;
    total: number;
    next: number;
}

const generateLevelData = (): Record<number, { total: number; next: number }> => {
    const data: Record<number, { total: number; next: number }> = {
        1: { total: 0, next: 300 }
    };
    let totalXP = 0;
    let requiredXP = 300;

    for (let level = 2; level <= 20; level++) {
        totalXP += requiredXP;
        
        if (level < 5) {
            requiredXP = Math.floor(requiredXP * 1.5);
        } else if (level < 10) {
            requiredXP = Math.floor(requiredXP * 1.25);
        } else {
            requiredXP = Math.floor(requiredXP * 1.1);
        }

        data[level] = {
            total: totalXP,
            next: totalXP + requiredXP
        };
    }
    return data;
}

export const levelXP: Record<number, { total: number; next: number }> = generateLevelData();

export const epicLevelXP: Record<number, { total: number; next: number }> = {
    21: { total: levelXP[20].next, next: levelXP[20].next + 50000 },
    22: { total: levelXP[20].next + 50000, next: levelXP[20].next + 110000 },
    23: { total: levelXP[20].next + 110000, next: levelXP[20].next + 180000 },
    24: { total: levelXP[20].next + 180000, next: levelXP[20].next + 260000 },
    25: { total: levelXP[20].next + 260000, next: Infinity },
}
