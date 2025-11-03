/**
 * Weather Data Fetching Utility
 * Uses Open-Meteo API (100% free, no API key required)
 * Documentation: https://open-meteo.com/en/docs
 */

import type { 
  WeatherData, 
  OpenMeteoResponse, 
  WeatherFetchConfig, 
  CityCoordinates 
} from './types/doctor-module'

/**
 * Major city coordinates for weather tracking
 * Add more cities as needed
 */
export const CITY_COORDINATES: CityCoordinates[] = [
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'USA', state: 'NY' },
  { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'USA', state: 'CA' },
  { name: 'Chicago', latitude: 41.8781, longitude: -87.6298, country: 'USA', state: 'IL' },
  { name: 'Houston', latitude: 29.7604, longitude: -95.3698, country: 'USA', state: 'TX' },
  { name: 'Phoenix', latitude: 33.4484, longitude: -112.0740, country: 'USA', state: 'AZ' },
  { name: 'Philadelphia', latitude: 39.9526, longitude: -75.1652, country: 'USA', state: 'PA' },
  { name: 'San Antonio', latitude: 29.4241, longitude: -98.4936, country: 'USA', state: 'TX' },
  { name: 'San Diego', latitude: 32.7157, longitude: -117.1611, country: 'USA', state: 'CA' },
  { name: 'Dallas', latitude: 32.7767, longitude: -96.7970, country: 'USA', state: 'TX' },
  { name: 'San Jose', latitude: 37.3382, longitude: -121.8863, country: 'USA', state: 'CA' },
]

/**
 * Fetches current weather data from Open-Meteo API
 * @param config Weather fetch configuration with coordinates and city name
 * @returns WeatherData object with current conditions
 */
export async function fetchWeatherFromAPI(config: WeatherFetchConfig): Promise<WeatherData> {
  const { latitude, longitude, city, timezone = 'auto' } = config

  try {
    // Build API URL with enhanced weather parameters for better disease prediction
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current_weather: 'true',
      hourly: 'temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,pressure_msl,dewpoint_2m,uv_index',
      timezone: timezone,
    })

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
    
    console.log(`Fetching enhanced weather data for ${city} from Open-Meteo API...`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`)
    }

    const data: OpenMeteoResponse = await response.json()

    // Extract current weather data
    const currentWeather = data.current_weather
    if (!currentWeather) {
      throw new Error('No current weather data available from API')
    }

    // Get latest hourly data for enhanced parameters
    const latestHourlyData = data.hourly ? {
      humidity: data.hourly.relativehumidity_2m?.[0] || 0,
      precipitation: data.hourly.precipitation?.[0] || 0,
      windSpeed: data.hourly.windspeed_10m?.[0] || currentWeather.windspeed || 0,
      pressure: data.hourly.pressure_msl?.[0] || 1013, // Default to standard sea level pressure
      dewPoint: data.hourly.dewpoint_2m?.[0] || 0,
      uvIndex: data.hourly.uv_index?.[0] || 0,
    } : { 
      humidity: 0, 
      precipitation: 0, 
      windSpeed: currentWeather.windspeed || 0,
      pressure: 1013,
      dewPoint: 0,
      uvIndex: 0,
    }

    const weatherData: WeatherData = {
      city,
      temperature: currentWeather.temperature,
      humidity: latestHourlyData.humidity,
      rainfall: latestHourlyData.precipitation,
      windSpeed: latestHourlyData.windSpeed,
      uvIndex: latestHourlyData.uvIndex,
      pressure: latestHourlyData.pressure,
      dewPoint: latestHourlyData.dewPoint,
      weatherCode: currentWeather.weathercode,
      recorded_at: new Date().toISOString(),
    }

    console.log(`Enhanced weather data fetched successfully for ${city}:`, {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.rainfall,
      windSpeed: weatherData.windSpeed,
      uvIndex: weatherData.uvIndex,
      pressure: weatherData.pressure,
    })
    return weatherData

  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch weather data for ${city}: ${error.message}`)
    }
    throw new Error(`Failed to fetch weather data for ${city}: Unknown error`)
  }
}

/**
 * Fetches weather data for multiple cities
 * @param cities Array of city coordinates
 * @returns Array of WeatherData for successful fetches
 */
export async function fetchWeatherForCities(
  cities: CityCoordinates[] = CITY_COORDINATES
): Promise<WeatherData[]> {
  console.log(`Fetching weather data for ${cities.length} cities...`)
  
  const weatherPromises = cities.map(city =>
    fetchWeatherFromAPI({
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
    }).catch(error => {
      console.error(`Failed to fetch weather for ${city.name}:`, error)
      return null // Return null for failed fetches
    })
  )

  const results = await Promise.all(weatherPromises)
  
  // Filter out null results (failed fetches)
  const successfulFetches = results.filter((data): data is WeatherData => data !== null)
  
  console.log(`Successfully fetched weather data for ${successfulFetches.length}/${cities.length} cities`)
  
  return successfulFetches
}

/**
 * Get city coordinates by name
 * @param cityName Name of the city
 * @returns City coordinates or undefined if not found
 */
export function getCityCoordinates(cityName: string): CityCoordinates | undefined {
  return CITY_COORDINATES.find(
    city => city.name.toLowerCase() === cityName.toLowerCase()
  )
}

/**
 * Validates weather data
 * @param data Weather data to validate
 * @returns Boolean indicating if data is valid
 */
export function isValidWeatherData(data: WeatherData): boolean {
  return (
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number' &&
    typeof data.rainfall === 'number' &&
    data.humidity >= 0 &&
    data.humidity <= 100 &&
    data.city.length > 0
  )
}

/**
 * Formats weather data for display
 * @param data Weather data
 * @returns Formatted string for UI
 */
export function formatWeatherData(data: WeatherData): string {
  return `${data.temperature.toFixed(1)}°C, ${data.humidity.toFixed(0)}% humidity, ${data.rainfall.toFixed(1)}mm rain`
}

/**
 * Calculate average weather from multiple data points
 * @param weatherDataArray Array of weather data
 * @returns Average weather data
 */
export function calculateAverageWeather(weatherDataArray: WeatherData[]): Omit<WeatherData, 'id' | 'city' | 'recorded_at' | 'created_at'> {
  if (weatherDataArray.length === 0) {
    return { temperature: 0, humidity: 0, rainfall: 0 }
  }

  const sum = weatherDataArray.reduce(
    (acc, data) => ({
      temperature: acc.temperature + data.temperature,
      humidity: acc.humidity + data.humidity,
      rainfall: acc.rainfall + data.rainfall,
    }),
    { temperature: 0, humidity: 0, rainfall: 0 }
  )

  return {
    temperature: sum.temperature / weatherDataArray.length,
    humidity: sum.humidity / weatherDataArray.length,
    rainfall: sum.rainfall / weatherDataArray.length,
  }
}
