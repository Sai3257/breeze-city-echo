
export interface WeatherData {
  temperature: number;
  condition: string;
  airQuality: string;
  airQualityIndex: number;
  city: string;
}

export const getWeatherData = async (city: string): Promise<WeatherData> => {
  // Simulate API call with realistic delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`🌤️ Calling WeatherAPI.com for city: ${city}`);
  
  // Mock weather data - in real implementation, this would call WeatherAPI.com
  // Example API endpoint: http://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${city}&aqi=yes
  
  const mockWeatherData = {
    "London": { temp: 15, condition: "Partly Cloudy", aqi: 3, aqiText: "Moderate" },
    "New York": { temp: 22, condition: "Sunny", aqi: 2, aqiText: "Good" },
    "Tokyo": { temp: 18, condition: "Light Rain", aqi: 4, aqiText: "Unhealthy for Sensitive Groups" },
    "Paris": { temp: 19, condition: "Overcast", aqi: 3, aqiText: "Moderate" },
    "Sydney": { temp: 25, condition: "Clear", aqi: 1, aqiText: "Good" },
    "Mumbai": { temp: 32, condition: "Hot", aqi: 5, aqiText: "Unhealthy" },
    "Default": { temp: 20, condition: "Clear", aqi: 2, aqiText: "Good" }
  };
  
  const cityKey = Object.keys(mockWeatherData).find(
    key => key.toLowerCase() === city.toLowerCase()
  ) || "Default";
  
  const data = mockWeatherData[cityKey as keyof typeof mockWeatherData] || mockWeatherData.Default;
  
  const weatherResponse: WeatherData = {
    temperature: data.temp,
    condition: data.condition,
    airQuality: data.aqiText,
    airQualityIndex: data.aqi,
    city: city
  };
  
  console.log("🌟 Weather API Response:", weatherResponse);
  
  return weatherResponse;
};
