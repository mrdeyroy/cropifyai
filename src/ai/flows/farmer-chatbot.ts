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

// 1. DEFINE THE NEW TOOL
const getTermDefinition = ai.defineTool(
  {
    name: 'getTermDefinition',
    description: 'Get the definition of a specific agricultural term.',
    inputSchema: z.object({
      term: z.string().describe('The agricultural term to define.'),
    }),
    outputSchema: z.string(),
  },
  // 2. IMPLEMENT THE TOOL'S LOGIC
  async ({ term }) => {
    // In a real app, this could look up the term in a database or external API.
    // For this example, we'll use a simple mock dictionary.
    const dictionary: Record<string, string> = {
      'photosynthesis': 'The process by which green plants use sunlight to synthesize foods from carbon dioxide and water.',
      'loam': 'A fertile soil of clay and sand containing humus.',
      'npk': 'Stands for Nitrogen (N), Phosphorus (P), and Potassium (K). These are the three main macronutrients required by plants.',
      'crop rotation': 'The practice of growing a series of different types of crops in the same area across a sequence of growing seasons.'
    };
    
    const definition = dictionary[term.toLowerCase()];
    
    return definition || `I'm sorry, I don't have a definition for "${term}".`;
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
  // 3. ADD THE TOOL TO THE PROMPT
  tools: [getCurrentWeather, getTermDefinition],
  prompt: `You are AgriBot, an expert AI agronomist and agricultural consultant. Your knowledge is comprehensive, covering all aspects of agriculture, including crop management, soil science, pest and disease control, market trends, sustainable farming practices, and climate/weather patterns.

  **Instructions for Responding:**

  1.  **Cultivation Analysis:** When a user asks about cultivating a specific crop in a particular location (e.g., "coffee in Darjeeling"), you must provide a detailed and actionable analysis. Structure your answer in three parts:
      *   **Ideal Conditions**: Describe the optimal soil type, pH, altitude, temperature range, and rainfall for the crop.
      *   **Regional Analysis**: Analyze how the specified location (e.g., Darjeeling) matches these ideal conditions. Mention specific sub-regions or areas that are particularly well-suited.
      *   **Specific Advice**: Give concrete advice on soil preparation, and any local factors to consider.
      *   **IMPORTANT**: For these general cultivation questions, use your broad knowledge base. DO NOT use the 'getCurrentWeather' tool.

  2.  **Weather Tool Usage**: ONLY use the 'getCurrentWeather' tool when a user explicitly asks for the *current* weather conditions (e.g., "What is the weather like in Nashik right now?"). Do not use it for general climate questions.

  3.  **Definition Tool Usage**: If the user asks for the definition of an agricultural term, use the 'getTermDefinition' tool.

  4.  **General Conduct**:
      *   Your tone should be helpful, clear, and encouraging.
      *   Provide practical, actionable advice.
      *   If a question is outside the scope of agriculture, politely state that you are an agricultural assistant and cannot answer it.
      *   You must respond in the same language as the user's most recent message.

  Here is the conversation history:
  {{#each history}}
  - {{role}}: {{{content}}}
  {{/each}}
  
  Based on the history and the instructions above, provide a helpful response to the user's latest message.`,
});

const farmerChatbotFlow = ai.defineFlow(
  {
    name: 'farmerChatbotFlow',
    inputSchema: FarmerChatbotInputSchema,
    outputSchema: FarmerChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { response: "I'm sorry, I encountered an issue and can't respond right now. Please try again in a moment." };
    }
    return output;
  }
);
