'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying crop diseases from an image.
 *
 * It includes:
 * - identifyCropDisease - A function that takes an image of a crop and returns potential diseases with a confidence score.
 */

import {ai} from '@/ai/genkit';
import {
  IdentifyCropDiseaseInput,
  IdentifyCropDiseaseInputSchema,
  IdentifyCropDiseaseOutput,
  IdentifyCropDiseaseOutputSchema,
} from '@/lib/types';


export async function identifyCropDisease(input: IdentifyCropDiseaseInput): Promise<IdentifyCropDiseaseOutput> {
  return identifyCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyCropDiseasePrompt',
  input: {schema: IdentifyCropDiseaseInputSchema},
  output: {schema: IdentifyCropDiseaseOutputSchema},
  prompt: `You are an AI assistant specialized in identifying crop diseases from images.

  Analyze the provided image and identify potential diseases affecting the crop.
  Provide a list of identified diseases along with a confidence score for each identification.
  For each disease, also provide a "treatment" array of strings with recommended actions, and a "prevention" array of strings with preventative measures.

  Image: {{media url=photoDataUri}}
  
  Format your response as a JSON object.`,
});

const identifyCropDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyCropDiseaseFlow',
    inputSchema: IdentifyCropDiseaseInputSchema,
    outputSchema: IdentifyCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
