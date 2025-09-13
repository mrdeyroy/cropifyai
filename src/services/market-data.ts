/**
 * @fileoverview Service for fetching market data.
 * In a real-world application, this would fetch data from an external API.
 */

// This is a mock function. In a real application, you would fetch this data
// from the Agmarknet API or another market data provider using the API key
// from process.env.AGMARKNET_API_KEY.
export async function getMarketPrices(location: string): Promise<{ crop: string; price: number }[]> {
  console.log(`Fetching market prices for ${location}...`);
  
  // Mock data based on the provided location.
  // A real implementation would have more sophisticated logic.
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
