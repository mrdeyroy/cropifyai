'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating crop suggestions based on farm data and market demand.
 *
 * The flow takes farm-specific data (soil type, location, weather data link, pH, moisture, nutrient content) and
 * market demand as input, and uses an AI model to generate tailored crop suggestions.
 *
 * @interface GenerateCropSuggestionsInput - Defines the input schema for the generateCropSuggestions function.
 * @interface GenerateCropSuggestionsOutput - Defines the output schema for the generateCropSuggestions function.
 * @function generateCropSuggestions - The exported function that triggers the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropSuggestionsInputSchema = z.object({
  soilType: z.string().describe('The type of soil on the farm.'),
  location: z.string().describe('The geographical location of the farm.'),
  weatherDataLink: z.string().describe('Link to weather data for the farm location.'),
  pH: z.number().describe('The pH level of the soil.'),
  moistureContent: z.string().describe('The moisture content of the soil.'),
  nutrientContent: z.string().describe('The nutrient content of the soil (e.g., NPK values).'),
  marketDemand: z.string().describe('Information about current market demands for crops.'),
  pastCropRotationData: z.string().describe('Information about past crop rotations on the farm.'),
  weatherForecast: z.string().describe('Weather forecast for the location.'),
  marketPrices: z.string().describe('Current market prices for various crops.'),
});

export type GenerateCropSuggestionsInput = z.infer<
  typeof GenerateCropSuggestionsInputSchema
>;

const GenerateCropSuggestionsOutputSchema = z.object({
  cropSuggestions: z
    .array(z.string())
    .describe('An array of crop suggestions tailored to the farm conditions and market demand.'),
  reasoning: z.string().describe('Explanation of the reasoning behind the crop suggestions.'),
});

export type GenerateCropSuggestionsOutput = z.infer<
  typeof GenerateCropSuggestionsOutputSchema
>;

export async function generateCropSuggestions(
  input: GenerateCropSuggestionsInput
): Promise<GenerateCropSuggestionsOutput> {
  return generateCropSuggestionsFlow(input);
}

const generateCropSuggestionsPrompt = ai.definePrompt({
  name: 'generateCropSuggestionsPrompt',
  input: {schema: GenerateCropSuggestionsInputSchema},
  output: {schema: GenerateCropSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide crop suggestions to farmers based on their farm's specific conditions and current market demands.

  Consider the following information about the farm:
  - Soil Type: {{{soilType}}}
  - Location: {{{location}}}
  - Weather Data Link: {{{weatherDataLink}}}
  - pH Level: {{{pH}}}
  - Moisture Content: {{{moistureContent}}}
  - Nutrient Content: {{{nutrientContent}}}
  - Past Crop Rotation Data: {{{pastCropRotationData}}}
  - Weather Forecast: {{{weatherForecast}}}
  - Market Prices: {{{marketPrices}}}

  Considering the current market demand: {{{marketDemand}}}, suggest the most suitable crops for the farmer to plant. Provide a short explanation of your reasoning.
  Ensure the crop suggestions are provided in an array.
  `,
});

const generateCropSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateCropSuggestionsFlow',
    inputSchema: GenerateCropSuggestionsInputSchema,
    outputSchema: GenerateCropSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await generateCropSuggestionsPrompt(input);
    return output!;
  }
);
