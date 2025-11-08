
'use server';
/**
 * This file contains the Genkit flow for generating a character's backstory and appearance.
 *
 * - generateCharacterBackstory: The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { BackstoryInputSchema, BackstoryOutputSchema, type BackstoryInput, type BackstoryOutput } from '@/types/character';

export async function generateCharacterBackstory(input: BackstoryInput): Promise<BackstoryOutput> {
  return generateCharacterBackstoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterBackstoryPrompt',
  input: {schema: BackstoryInputSchema},
  output: {schema: BackstoryOutputSchema},
  config: {
    maxOutputTokens: 512,
  },
  prompt: `You are a master storyteller and world-builder in a high-fantasy setting called Vizura.
  Given the following character details, create a compelling and original backstory and a vivid physical appearance.
  
  Character Details:
  - Name: {{{name}}}
  - Race: {{{race}}}
  - Class: {{{class}}}
  - Background: {{{background}}}
  - Stats: {{jsonStringify stats}}
  
  Generate a backstory that is consistent with their details. For example, a character with high Strength and a Soldier background might have a history of military service, while a character with high Knowledge and a Sage background might have a story involving a library or a mentor.
  
  Generate a physical appearance that is also consistent with their details. A Markul will be large and imposing, a Gnome will be small and nimble.`,
});

const generateCharacterBackstoryFlow = ai.defineFlow(
  {
    name: 'generateCharacterBackstoryFlow',
    inputSchema: BackstoryInputSchema,
    outputSchema: BackstoryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid output.");
    }
    return output;
  }
);
