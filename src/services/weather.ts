/**
 * @fileoverview Service for fetching weather data.
 */

export type WeatherData = {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  uv: string; // OpenWeatherMap doesn't provide UV index in the free tier, so this remains mock.
};

// Mock function to generate weather data based on location
const getMockWeather = (location: string): WeatherData => {
  // Use a simple hash to get consistent "random" data for a given location
  const hash = location
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    temp: 25 + (hash % 10), // Temp between 25-34
    condition: ['Sunny', 'Partly Cloudy', 'Clear'][hash % 3],
    humidity: 60 + (hash % 15), // Humidity between 60-75
    wind: 8 + (hash % 10), // Wind between 8-17 km/h
    uv: ['High', 'Very High', 'Moderate'][hash % 3],
  };
};

export async function getWeather(location: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  if (!apiKey || apiKey === "your_weather_api_key_here") {
    console.warn("OpenWeatherMap API key not found. Using mock data.");
    return getMockWeather(location);
  }

  const city = location.split(',')[0].trim();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Authentication error with OpenWeatherMap API. Please check if your NEXT_PUBLIC_WEATHER_API_KEY is correct and active. Falling back to mock data.");
      } else {
        throw new Error(`Weather API request failed with status ${response.status}`);
      }
      return getMockWeather(location);
    }
    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0]?.description || 'Clear',
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      uv: 'N/A', // UV Index requires a separate API call in OpenWeatherMap
    };
  } catch (error) {
    console.error("Error fetching from OpenWeatherMap API:", error);
    return getMockWeather(location); // Fallback to mock data on error
  }
}
