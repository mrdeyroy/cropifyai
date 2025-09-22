'use server';

/**
 * @fileOverview A conversational AI flow for a farmer chatbot.
 *
 * - farmerChatbot - A function that handles the chatbot conversation.
 */

import { ai } from '@/ai/genkit';
import {
  FarmerChatbotInput,
  FarmerChatbotInputSchema,
  FarmerChatbotOutput,
  FarmerChatbotOutputSchema,
} from '@/lib/types';
import { getWeather } from '@/services/weather';
import { getMarketPrices } from '@/services/market-data'; // your existing market service
import type { WeatherData } from '@/services/weather';
import { z } from 'zod';

// -----------------------------
// 1. Weather Tool
// -----------------------------
const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get the current weather conditions for a specific location.',
    inputSchema: z.object({
      location: z.string().describe(
        'The city and state, e.g., "Nashik, Maharashtra" for which to get the weather.'
      ),
    }),
    outputSchema: z.custom<WeatherData>(),
  },
  async ({ location }) => {
    return await getWeather(location);
  }
);

// -----------------------------
// 2. Agricultural Term Definition Tool
// -----------------------------
const getTermDefinition = ai.defineTool(
  {
    name: 'getTermDefinition',
    description: 'Get the definition of a specific agricultural term.',
    inputSchema: z.object({
      term: z.string().describe('The agricultural term to define.'),
    }),
    outputSchema: z.string(),
  },
  async ({ term }) => {
    const dictionary: Record<string, string> = {
      photosynthesis:
        'The process by which green plants use sunlight to synthesize foods from carbon dioxide and water.',
      loam: 'A fertile soil of clay and sand containing humus.',
      npk: 'Stands for Nitrogen (N), Phosphorus (P), and Potassium (K). These are the three main macronutrients required by plants.',
      'crop rotation':
        'The practice of growing a series of different types of crops in the same area across a sequence of growing seasons.',
    };

    const definition = dictionary[term.toLowerCase()];
    return definition || `I'm sorry, I don't have a definition for "${term}".`;
  }
);

// -----------------------------
// 3. Market Price Tool
// -----------------------------
const getMarketPrice = ai.defineTool(
  {
    name: 'getMarketPrice',
    description: 'Get the current market price of crops in a specific location.',
    inputSchema: z.object({
      crop: z.string().describe('The crop name, e.g., "wheat".'),
      location: z
        .string()
        .describe('The location to fetch market prices for, e.g., "Kolkata, West Bengal".'),
    }),
    outputSchema: z.array(
      z.object({ crop: z.string(), price: z.number() })
    ),
  },
  async ({ crop, location }) => {
    try {
      const data = await getMarketPrices(location);

      const filtered = data.filter(
        (item: { crop: string; }) => item.crop.toLowerCase() === crop.toLowerCase()
      );

      if (filtered.length === 0) {
        return [{ crop, price: 0 }]; // fallback if no data found
      }
      return filtered;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      return [{ crop, price: 0 }]; // fallback on error
    }
  }
);

// -----------------------------
// 4. Prompt Definition
// -----------------------------
const prompt = ai.definePrompt({
  name: 'farmerChatbotPrompt',
  input: { schema: FarmerChatbotInputSchema },
  output: { schema: FarmerChatbotOutputSchema },
  tools: [getCurrentWeather, getTermDefinition, getMarketPrice], // new tool added
  prompt: `You are AgriBot, an expert AI agronomist and agricultural consultant. Your knowledge is comprehensive, covering all aspects of agriculture, including crop management, soil science, pest and disease control, market trends, sustainable farming practices, and climate/weather patterns.

**Instructions for Responding:**

1. **Cultivation Analysis:** When a user asks about cultivating a specific crop in a particular location (e.g., "coffee in Darjeeling"), provide:
   * **Ideal Conditions**: optimal soil type, pH, altitude, temperature, rainfall.
   * **Regional Analysis**: how the location matches ideal conditions.
   * **Specific Advice**: soil preparation, local factors.
   * **Important**: For cultivation, DO NOT use 'getCurrentWeather' or 'getMarketPrice'.

2. **Weather Tool Usage**: Use 'getCurrentWeather' **only** for explicit requests about current weather (e.g., "What's the weather in Nashik?").

3. **Market Price Tool Usage**: Use 'getMarketPrice' **only** when the user asks about current market prices of crops (e.g., "Current wheat price in Kolkata").

4. **Definition Tool Usage**: Use 'getTermDefinition' if the user asks for agricultural term definitions.

5. **General Conduct**:
   * Tone: helpful, clear, encouraging.
   * Provide practical advice.
   * If outside agriculture, politely decline.
   * Respond in the same language as user's latest message.

Conversation history:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

Based on the history and instructions, provide a helpful response to the user's latest message.`,
});

// -----------------------------
// 5. Chatbot Flow
// -----------------------------
const farmerChatbotFlow = ai.defineFlow(
  {
    name: 'farmerChatbotFlow',
    inputSchema: FarmerChatbotInputSchema,
    outputSchema: FarmerChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        response:
          "I'm sorry, I encountered an issue and can't respond right now. Please try again in a moment.",
      };
    }
    return output;
  }
);

// -----------------------------
// 6. Exported chatbot function
// -----------------------------
export async function farmerChatbot(
  input: FarmerChatbotInput
): Promise<FarmerChatbotOutput> {
  return farmerChatbotFlow(input);
}
