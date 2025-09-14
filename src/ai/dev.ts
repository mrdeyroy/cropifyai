import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-suggestions.ts';
import '@/ai/flows/voice-input-farm-data.ts';
import '@/ai/flows/identify-crop-disease.ts';
import '@/ai/flows/farmer-chatbot.ts';
import '@/ai/flows/text-to-speech.ts';
