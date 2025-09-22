/**
 * @fileoverview Service for fetching market data from Agmarknet.
 */

import type { MarketPrice } from '@/lib/types';

// This function fetches live market data from the Agmarknet API.
export async function getMarketPrices(location: string): Promise<{ crop: string; price: number }[]> {
  const apiKey = process.env.NEXT_PUBLIC_AGMARKNET_API_KEY;
  if (!process.env.NEXT_PUBLIC_AGMARKNET_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_AGMARKNET_API_KEY in environment variables");
  }


  const parts = location.split(',');
  const state = parts.length > 1 ? parts[parts.length - 1].trim() : location;


  // Note: The Agmarknet API endpoint and query parameters might need adjustment
  // based on the actual API documentation. This is a representative example.
  const resourceId = process.env.NEXT_PUBLIC_AGMARKNET_RESOURCE_ID;
  if (!resourceId) throw new Error("Missing NEXT_PUBLIC_AGMARKNET_RESOURCE_ID");
 
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=${state}&sort[arrival_date]=desc&limit=10`;


  try {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Agmarknet API request failed with status ${response.status}`);
    return getMockMarketPrices(location); // Fallback to mock data
  }

  // Define the type for API records
  interface AgmarknetRecord {
    commodity: string;
    modal_price: string;
    state?: string;
    district?: string;
    market?: string;
    arrival_date?: string;
  }

  const data: { records?: AgmarknetRecord[] } = await response.json();

  if (!data.records || data.records.length === 0) {
    console.log("No market data found for the location, using mock data.");
    return getMockMarketPrices(location);
  }

  // Process records safely with type safety
  const processedData = data.records
    .filter(record => record.commodity && record.modal_price) // filter out invalid records
    .map(record => ({
      crop: record.commodity,
      price: parseFloat(record.modal_price),
    }));

  // Remove duplicates, keeping the first entry
  const uniqueCrops = new Map<string, { crop: string; price: number }>();
  processedData.forEach(item => {
    if (!uniqueCrops.has(item.crop)) {
      uniqueCrops.set(item.crop, item);
    }
  });

  return Array.from(uniqueCrops.values());

  } 
  catch (error) {
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
