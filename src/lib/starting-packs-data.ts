
import { adventurerPack, classPacks } from './starting-packs';

const adventurerItemIds = adventurerPack.map(item => item.id);

const classItemIds = Object.values(classPacks).flatMap(pack => pack.map(item => item.id));

export const allStartingPackItemIds = new Set([
    ...adventurerItemIds,
    ...classItemIds
]);
