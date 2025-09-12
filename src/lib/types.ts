export type User = {
  name: string;
  email: string;
  avatar: string;
};

export type Farm = {
  id: string;
  name: string;
  location: string;
  soilType: string;
  ph: number;
  moisture: number;
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
};

export type DiseaseIdentification = {
    diseaseName: string;
    confidenceScore: number;
    treatment: string[];
    prevention: string[];
}
