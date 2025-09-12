'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating crop suggestions based on farm data and market demand.
 *
 * The flow takes farm-specific data (soil type, location, weather data link, pH, moisture, nutrient content) and
 * market demand as input, and uses an AI model to generate tailored crop suggestions.
 *
 * @function generateCropSuggestions - The exported function that triggers the flow.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateCropSuggestionsInput,
  GenerateCropSuggestionsInputSchema,
  GenerateCropSuggestionsOutput,
  GenerateCropSuggestionsOutputSchema,
} from '@/lib/types';


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
  - Temperature: {{{temperature}}}°C
  - Past Crop Rotation Data: {{{pastCropRotationData}}}
  - Weather Forecast: {{{weatherForecast}}}
  - Market Prices: {{{marketPrices}}}

  Considering the current market demand: {{{marketDemand}}}, suggest the most suitable crops for the farmer to plant. 
  For each crop, provide the following details:
  - cropName: The name of the crop.
  - yieldForecast: The estimated yield in an appropriate unit (e.g., quintals/acre).
  - profitMargin: An estimated profit margin percentage.
  - sustainabilityScore: A score from 0 to 100 representing how sustainable the crop is for the given conditions (considering water usage, soil health impact, etc.).
  
  Also, provide a short, overall explanation of your reasoning for the suggestions.
  Ensure the crop suggestions are provided in an array of objects.
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
