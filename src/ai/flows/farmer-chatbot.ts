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
import type { WeatherData } from '@/services/weather';
import { z } from 'zod';

const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get the current weather conditions for a specific location.',
    inputSchema: z.object({
      location: z.string().describe('The city and state, e.g., "Nashik, Maharashtra" for which to get the weather.'),
    }),
    outputSchema: z.custom<WeatherData>(),
  },
  async ({ location }) => {
    return await getWeather(location);
  }
);


export async function farmerChatbot(
  input: FarmerChatbotInput
): Promise<FarmerChatbotOutput> {
  return farmerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmerChatbotPrompt',
  input: { schema: FarmerChatbotInputSchema },
  output: { schema: FarmerChatbotOutputSchema },
  tools: [getCurrentWeather],
  prompt: `You are AgriBot, an expert AI assistant for farmers. Your knowledge covers all aspects of agriculture, including crop management, soil science, pest and disease control, market trends, sustainable farming practices, and weather patterns.

  If the user asks about the weather, use the 'getCurrentWeather' tool to provide real-time information.

  Your tone should be helpful, clear, and encouraging. Provide practical, actionable advice. If a question is outside the scope of agriculture, politely state that you are an agricultural assistant and cannot answer it.
  
  You must respond in the same language as the user's most recent message.

  Here is the conversation history:
  {{#each history}}
  - {{role}}: {{{content}}}
  {{/each}}
  
  Based on the history, provide a helpful response to the user's latest message.`,
});

const farmerChatbotFlow = ai.defineFlow(
  {
    name: 'farmerChatbotFlow',
    inputSchema: FarmerChatbotInputSchema,
    outputSchema: FarmerChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
