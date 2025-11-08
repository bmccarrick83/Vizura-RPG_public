
import { z } from 'zod';

export const FeatSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    prerequisite: z.string().optional(),
});

export type Feat = z.infer<typeof FeatSchema>;

export const allFeats: Feat[] = [
    { id: 'vampire', name: 'Vampire', description: 'Grants vampiric abilities, including bite attack and light sensitivity.' },
    { id: 'were-bitten', name: 'Were-bitten', description: 'Grants lycanthropic abilities, including transforming under the full moon.' },
    { id: 'battle-rage', name: 'Battle Rage', description: 'You are enraged during a battle or siege. You get three rage points at level 1. The rage points reset after each 8 hour sleep. Rage points scale up at level 5(4 points), level 9 (5 points), level 13 (6 rage points), level 17 (unlimited rage points).' },
    { id: 'sharpshooter', name: 'Sharpshooter', description: 'Ignores partial cover and can take a penalty to hit for extra damage with ranged weapons.' },
    { id: 'tough', name: 'Tough', description: 'Increases your hit points by 2.' },
    { id: 'sniper', name: 'Sniper', description: "A soldier or Monster Hunter improves their concentration by 2. Requires an agility of 13 or higher. Additionally, your ranged weapon attacks have advantage and your attack ignores cover. You ignore any penalties for being prone while firing. If you are hidden, and miss a target your location has a .1 chance (descending) of being revealed. If you fire and your location drops to .6, your enemy can roll for advantage to locate you." },
    { id: 'toxin-resistance', name: 'Toxin Resistance', description: 'A +1 to Constitution rolls when exposed to plant and animal toxins.'},
    { id: 'improved-leadership', name: 'Improved Leadership', description: '+1 Leadership to character.'},
    { id: 'novice-skinner', name: 'Novice Skinner', description: 'Gives the monster slayer a +1 to Skinning skill rolls.' },
    { id: 'headbutt', name: 'Headbutt', description: 'The character can attack with its head, doing 1d4 + Strength modifier damage.'},
    { id: 'teleport', name: 'Teleport', description: 'Instantly move 35 feet in any direction that you can see for 10 seconds. Stone walls and rock features 25 ft or thicker blocks this spell.' },
    { id: 'minor-telepathy', name: 'Minor Telepathy', description: 'You can communicate with a nearby creature / person that you can see at a 5 foot range. You can transmit thoughts, visualizations, and emotions.' },
    { id: 'oathforged-disciple', name: 'Oathforged Disciple', description: 'Devotion to a divine or cosmic entity grants you enhanced resilience and conviction.', prerequisite: 'Tough' },
    { id: 'cover-adept', name: 'Hide expert', description: 'You excel at using your surroundings for protection. When you are in half-cover, you gain an additional +1 AC, for a total of +3 AC.' },
    { id: 'rite-of-jinn-a', name: 'Rite of Jinn-a', description: 'Become jinn, granting the "Sand Shift" spell permanently. Your soul was torn apart, infused with enchanted sand, and reconstituted.' },
    { id: 'ritual-of-summoning', name: 'Ritual of Summoning', description: 'Allows at least two Magi, appointed by a Magus Chief or high-ranking noble, to summon a hero from Earth to aid in a war. Earth-born heroes are known for their leadership and immunity to certain enchantments.' },
    { id: 'sense-danger', name: 'Sense Danger', description: 'Your battlefield experience has honed your senses. You have a +1 bonus to all Instinct-based skill checks and to your passive Perception score. Available to Soldiers and Engineers at level 2.' },
].map(feat => FeatSchema.parse(feat));
