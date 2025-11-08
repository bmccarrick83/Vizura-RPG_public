
import type { Spell } from './types';

export const allSpells: Spell[] = [
    // Magus Acolyte
    { id: 'light-rune', name: 'Light Rune', description: 'Creates a floating rune that emits light equivalent to a torch for 1 hour.', degree: 0, category: 'Rune' },
    { id: 'detect-runes', name: 'Detect Runes', description: 'For 10 minutes, you can sense the presence of active or dormant runes within 30 feet.', degree: 0, category: 'Rune' },
    
    // Healer
    { id: 'minor-healing', name: 'Minor Healing', description: 'Restores 1d4 hit points to a creature you touch.', degree: 0, category: 'Healing' },
    { id: 'close-wounds-minor', name: 'Close wounds, minor', description: 'Stabilizes a dying creature you touch.', degree: 0, category: 'Healing' },

    // Druid
    { id: 'thorn-burst-minor', name: 'Thorn Burst, minor', description: 'You rapidly fire off three thorn projectiles from a free hand at a target you can see.', degree: 0, category: 'Nature' },
    { id: 'dryad-skin', name: 'Dryad skin', description: 'You gain a +1 to AC for 12 hours.', degree: 0, category: 'Nature' },

    // Warlock
    { id: 'mirage', name: 'Mirage', description: 'Create a minor visual illusion, like a small object or a brief sound, within 15 feet.', degree: 0, category: 'Illusion' },
    { id: 'shrink-spell', name: 'Shrink Spell', description: 'Reduces a non-magical object in size by 50% for 1 minute.', degree: 0, category: 'Utility' },
    { id: 'sand-shift', name: 'Sand Shift', description: 'Your membership in a jinn community (in Limbo or near a distant Mizarian desert oasis community) has paid off. You are offered to participate in the \'Rite of Jiinn-a\' to become jinnn, which grants you the \'sand shift\' spell. The ritual is held in the Onyx Pyramid (or similar thematic name) in the binding-room. Your soul was torn apart, infued with enchanted sand, and reconstituted. This spell is permanent and can\'t be removed.', degree: 0, category: 'Utility' },
];

