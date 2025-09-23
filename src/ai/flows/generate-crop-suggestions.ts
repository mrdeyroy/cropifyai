'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating crop suggestions based on farm data and market demand.
 *
 * The flow takes farm-specific data (soil type, location, weather data link, pH, moisture, nutrient content) and
 * market demand as input, and uses an AI model to generate tailored crop suggestions. It uses a tool to fetch live market data.
 *
 * @function generateCropSuggestions - The exported function that triggers the flow.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateCropSuggestionsInput,
  GenerateCropSuggestionsInputSchema,
  GenerateCropSuggestionsOutput,
  GenerateCropSuggestionsOutputSchema,
} from '@/lib/types';
import { getMarketPrices } from '@/services/market-data';
import { z } from 'zod';


// Tool to get market prices
const getMarketData = ai.defineTool(
  {
    name: 'getMarketData',
    description: 'Get current market prices for various crops in a given location. Use this to understand market trends and demand.',
    inputSchema: z.object({
        location: z.string().describe('The state or region to get market prices for, e.g., "Maharashtra"'),
    }),
    outputSchema: z.array(z.object({
        crop: z.string(),
        price: z.number(),
    })),
  },
  async (input) => {
    console.log(`Tool: Getting market data for ${input.location}`);
    return getMarketPrices(input.location);
  }
);


export async function generateCropSuggestions(
  input: GenerateCropSuggestionsInput
): Promise<GenerateCropSuggestionsOutput> {
  return generateCropSuggestionsFlow(input);
}

const generateCropSuggestionsPrompt = ai.definePrompt({
  name: 'generateCropSuggestionsPrompt',
  input: { schema: GenerateCropSuggestionsInputSchema },
  output: { schema: GenerateCropSuggestionsOutputSchema },
  tools: [getMarketData],
  prompt: `You are an AI assistant designed to provide crop suggestions to farmers based on their farm's specific conditions and current market demands.

  Use the 'getMarketData' tool to fetch the latest market prices for the farm's location to help your decision.

  Consider the following information about the farm:
  - Budget: ₹{{{budget}}}
  - Soil Type: {{{soilType}}}
  - Location: {{{location}}}
  - Weather Data Link: {{{weatherDataLink}}}
  - pH Level: {{{pH}}}
  - Moisture Content: {{{moistureContent}}}
  - Nutrient Content: {{{nutrientContent}}}
  - Temperature: {{{temperature}}}°C
  - Past Crop Rotation Data: {{{pastCropRotationData}}}
  - Weather Forecast: {{{weatherForecast}}}

  Based on the farm's conditions, the farmer's budget, and the live market data you fetch, suggest the most suitable crops for the farmer to plant. 
  For each crop, provide the following details:
  - cropName: The name of the crop.
  - yieldForecast: The estimated yield in an appropriate unit (e.g., quintals/acre).
  - profitMargin: An estimated profit margin percentage.
  - sustainabilityScore: A score from 0 to 100 representing how sustainable the crop is for the given conditions (considering water usage, soil health impact, etc.).
  
  For the 'reasoning' output, provide a visually appealing analysis using markdown. Do NOT write a summary paragraph. Instead, create a bulleted list where each item represents a key factor you considered. Start each bullet point with a relevant emoji. use line breaks.
  
  Example format for reasoning:
  * 💰 **Budget**: Fits within the provided budget of ₹{{{budget}}}.
  * 🌱 **Soil & Climate**: The selected crops are well-suited for the {{{soilType}}} soil and the expected weather conditions.
  * 📈 **Market Trends**: Based on the data from the 'getMarketData' tool, these crops show strong demand in {{{location}}}.
  * 🌿 **Sustainability**: These options have a good sustainability score, indicating efficient water use and positive impact on soil health.

  Ensure the crop suggestions are provided in an array of objects.
  `,
});

const generateCropSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateCropSuggestionsFlow',
    inputSchema: GenerateCropSuggestionsInputSchema,
    outputSchema: GenerateCropSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await generateCropSuggestionsPrompt(input);
    return output!;
  }
);
