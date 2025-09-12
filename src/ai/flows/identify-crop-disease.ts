'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying crop diseases from an image.
 *
 * It includes:
 * - identifyCropDisease - A function that takes an image of a crop and returns potential diseases with a confidence score.
 * - IdentifyCropDiseaseInput - The input type for the identifyCropDisease function.
 * - IdentifyCropDiseaseOutput - The return type for the identifyCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyCropDiseaseInput = z.infer<typeof IdentifyCropDiseaseInputSchema>;

const IdentifyCropDiseaseOutputSchema = z.object({
  diseaseIdentification: z.array(
    z.object({
      diseaseName: z.string().describe('The name of the identified disease.'),
      confidenceScore: z
        .number()
        .describe('The confidence score of the disease identification.'),
    })
  ).describe('List of identified diseases with confidence scores.'),
});
export type IdentifyCropDiseaseOutput = z.infer<typeof IdentifyCropDiseaseOutputSchema>;

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

  Image: {{media url=photoDataUri}}
  \n  Format your response as a JSON array of disease objects, each containing "diseaseName" and "confidenceScore".`,
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
