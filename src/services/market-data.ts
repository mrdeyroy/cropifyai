/**
 * @fileoverview Service for fetching market data from Agmarknet.
 */

import type { MarketPrice } from '@/lib/types';

// This function fetches live market data from the Agmarknet API.
export async function getMarketPrices(location: string): Promise<{ crop: string; price: number }[]> {
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    console.warn("Agmarknet API key not found. Using mock data.");
    return getMockMarketPrices(location);
  }

  const state = location.split(',')[1]?.trim() || location;

  // Note: The Agmarknet API endpoint and query parameters might need adjustment
  // based on the actual API documentation. This is a representative example.
  const url = `https://data.gov.in/api/v2/agmarknet.json?api-key=${apiKey}&filters[state]=${state}&sort[arrival_date]=desc&limit=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Agmarknet API request failed with status ${response.status}`);
      return getMockMarketPrices(location); // Fallback to mock data
    }
    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
        console.log("No market data found for the location, using mock data.");
        return getMockMarketPrices(location);
    }

    // Process the records to fit the expected format
    const processedData = data.records.map((record: any) => ({
      crop: record.commodity,
      price: parseFloat(record.modal_price)
    }));

    // Remove duplicates, keeping the first entry
    const uniqueCrops = new Map();
    processedData.forEach((item: {crop: string, price: number}) => {
        if(!uniqueCrops.has(item.crop)){
            uniqueCrops.set(item.crop, item);
        }
    });

    return Array.from(uniqueCrops.values());

  } catch (error) {
    console.error("Error fetching from Agmarknet API:", error);
    return getMockMarketPrices(location); // Fallback to mock data on error
  }
}

// Mock function to be used if the API key is not available.
function getMockMarketPrices(location: string): { crop: string; price: number }[] {
  console.log(`Using mock market prices for ${location}...`);
  
  if (location.toLowerCase().includes('maharashtra')) {
    return [
      { crop: 'Soybeans', price: 3600 },
      { crop: 'Cotton', price: 7500 },
      { crop: 'Sugarcane', price: 3200 },
      { crop: 'Grapes', price: 85 },
    ];
  } else if (location.toLowerCase().includes('punjab')) {
    return [
      { crop: 'Wheat', price: 2250 },
      { crop: 'Rice', price: 3800 },
      { crop: 'Corn', price: 1450 },
      { crop: 'Potato', price: 1500 },
    ];
  } else {
    return [
      { crop: 'Corn', price: 1420 },
      { crop: 'Soybeans', price: 3550 },
      { crop: 'Wheat', price: 2230 },
      { crop: 'Grapes', price: 82 },
    ];
  }
}
