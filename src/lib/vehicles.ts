
import { type Vehicle } from '@/types/vehicle';

export const vehicleData: Vehicle[] = [
    {
        type: 'Phase-Craft (Luxury)',
        size: 'Medium',
        description: 'A comfortable, top-of-the-line skimmer with plush seating.',
        damageDie: '1d6',
        qualities: '+1d4 for phase surge collision. May ignore up to 15 feet of stone structures and light armor.'
    },
     {
        type: 'Phase-Craft (Military)',
        size: 'Medium',
        description: 'An armored skimmer with weapon hardpoints.',
        damageDie: '1d10',
        qualities: '+1d6 for phase surge collision. May ignore up to 30 feet of stone structures and all armor if phasing through.'
    },
    {
        type: 'Phase-Craft (Experimental)',
        size: 'Medium',
        description: 'An unstable but powerful prototype skimmer that hums with energy.',
        damageDie: '2d8',
        qualities: '+2d6 for phase surge collision. May ignore up to 50 feet of any structure. 10% chance of dimensional rift on critical failure.'
    },
    {
        type: 'Caravan',
        size: 'Medium',
        description: 'Overland transport with heavy frames',
        damageDie: '1d10',
        qualities: '+2 damage if charging or downhill. Can attach reinforced plating (+2 Defense).'
    },
    {
        type: 'Leyline Train',
        size: 'Large',
        description: 'Magically powered transport along leyline tracks or floating rails',
        damageDie: '2d10 + Speed Tier Bonus',
        qualities: '+3 per Speed Tier or car segment used in impact. Collisions may cause area shockwave damage (1d6 to nearby).'
    }
];
