import { z } from 'zod';

export type Farm = {
  id: string;
  name: string;
  location: string;
  soilType: string;
  ph: number;
  moisture: number;
  temperature: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
};

export type CropSuggestion = {
  cropName: string;
  reasoning: string;
  yieldPotential: string;
  marketTrends: string;
  optimalConditions: {
    temperature: string;
    rainfall: string;
  };
};

export type MarketPrice = {
  crop: string;
  price: number;
  change: number;
  lastUpdated: string;
  history: { date: string; price: number }[];
};

export const ExpenseCategorySchema = z.enum([
    'seeds', 'fertilizer', 'pesticides', 'irrigation', 'labor', 'machinery', 'transport', 'other'
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const TransactionSchema = z.object({
    id: z.string(),
    date: z.string(),
    type: z.enum(['income', 'expense']),
    category: z.string(), // For income, might be 'sales', for expenses use ExpenseCategory
    description: z.string(),
    amount: z.number(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const IdentifyCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyCropDiseaseInput = z.infer<typeof IdentifyCropDiseaseInputSchema>;

export const IdentifyCropDiseaseOutputSchema = z.object({
  isCrop: z.boolean().describe('Whether or not the image contains a crop or plant.'),
  diseaseIdentification: z.array(
    z.object({
      diseaseName: z.string().describe('The name of the identified disease.'),
      confidenceScore: z
        .number()
        .describe('The confidence score of the disease identification.'),
      treatment: z.array(z.string()).describe('Recommended treatment steps.'),
      prevention: z.array(z.string()).describe('Recommended prevention steps.'),
    })
  ).describe('List of identified diseases with confidence scores. Empty if the crop is healthy or not a crop.'),
});
export type IdentifyCropDiseaseOutput = z.infer<typeof IdentifyCropDiseaseOutputSchema>;

export type DiseaseIdentification = z.infer<typeof IdentifyCropDiseaseOutputSchema>['diseaseIdentification'][number];

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const FarmerChatbotInputSchema = z.object({
  history: z.array(MessageSchema),
});
export type FarmerChatbotInput = z.infer<typeof FarmerChatbotInputSchema>;

export const FarmerChatbotOutputSchema = z.object({
  response: z.string(),
});
export type FarmerChatbotOutput = z.infer<typeof FarmerChatbotOutputSchema>;

export const GenerateCropSuggestionsInputSchema = z.object({
  soilType: z.string().describe('The type of soil on the farm.'),
  location: z.string().describe('The geographical location of the farm.'),
  weatherDataLink: z.string().describe('Link to weather data for the farm location.'),
  pH: z.number().describe('The pH level of the soil.'),
  moistureContent: z.string().describe('The moisture content of the soil.'),
  nutrientContent: z.string().describe('The nutrient content of the soil (e.g., NPK values).'),
  temperature: z.number().describe('The average temperature in Celsius.'),
  pastCropRotationData: z.string().describe('Information about past crop rotations on the farm.'),
  weatherForecast: z.string().describe('Weather forecast for the location.'),
  budget: z.number().describe('The farmer\'s budget for planting crops.'),
});

export type GenerateCropSuggestionsInput = z.infer<
  typeof GenerateCropSuggestionsInputSchema
>;

export const GenerateCropSuggestionsOutputSchema = z.object({
  cropSuggestions: z
    .array(
      z.object({
        cropName: z.string().describe('The name of the suggested crop.'),
        yieldForecast: z
          .string()
          .describe('The forecasted yield for the crop (e.g., in quintals/acre).'),
        profitMargin: z
          .number()
          .describe('The estimated profit margin as a percentage.'),
        sustainabilityScore: z
          .number()
          .describe('A score from 0 to 100 indicating the sustainability of growing this crop.'),
      })
    )
    .describe('An array of crop suggestions tailored to the farm conditions and market demand.'),
  reasoning: z.string().describe('Explanation of the reasoning behind the crop suggestions.'),
});

export type GenerateCropSuggestionsOutput = z.infer<
  typeof GenerateCropSuggestionsOutputSchema
>;
