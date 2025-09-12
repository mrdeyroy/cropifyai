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

export async function farmerChatbot(
  input: FarmerChatbotInput
): Promise<FarmerChatbotOutput> {
  return farmerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmerChatbotPrompt',
  input: { schema: FarmerChatbotInputSchema },
  output: { schema: FarmerChatbotOutputSchema },
  prompt: `You are AgriBot, an expert AI assistant for farmers. Your knowledge covers all aspects of agriculture, including crop management, soil science, pest and disease control, market trends, sustainable farming practices, and weather patterns.

  Your tone should be helpful, clear, and encouraging. Provide practical, actionable advice. If a question is outside the scope of agriculture, politely state that you are an agricultural assistant and cannot answer it.

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
