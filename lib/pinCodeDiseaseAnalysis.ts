/**
 * PIN Code Based Weather & Disease Analysis
 * Integrates PIN code location lookup with weather-based disease prediction
 */

import type { WeatherData, DoctorRequirement, DiseasePrediction } from './types/doctor-module'
import { fetchWeatherFromAPI } from './fetchWeatherData'
import { predictDiseases } from './predictDisease'

/**
 * PIN code to location coordinates mapping
 * Can be extended with a geocoding service
 */
interface PinCodeLocation {
  pincode: string
  city: string
  district: string
  state: string
  latitude: number
  longitude: number
}

/**
 * Major Indian cities with coordinates (for PIN code matching)
 * These are approximate city centers - can be refined with actual PIN code geocoding
 */
const INDIAN_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // Karnataka
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Mysore': { latitude: 12.2958, longitude: 76.6394 },
  'Mangalore': { latitude: 12.9141, longitude: 74.8560 },
  
  // Maharashtra
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
  'Nagpur': { latitude: 21.1458, longitude: 79.0882 },
  
  // Tamil Nadu
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Coimbatore': { latitude: 11.0168, longitude: 76.9558 },
  'Madurai': { latitude: 9.9252, longitude: 78.1198 },
  
  // Delhi NCR
  'New Delhi': { latitude: 28.6139, longitude: 77.2090 },
  'Delhi': { latitude: 28.7041, longitude: 77.1025 },
  'Gurgaon': { latitude: 28.4595, longitude: 77.0266 },
  'Noida': { latitude: 28.5355, longitude: 77.3910 },
  
  // West Bengal
  'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
  
  // Telangana
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  
  // Gujarat
  'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
  'Surat': { latitude: 21.1702, longitude: 72.8311 },
  
  // Rajasthan
  'Jaipur': { latitude: 26.9124, longitude: 75.7873 },
  
  // Kerala
  'Kochi': { latitude: 9.9312, longitude: 76.2673 },
  'Thiruvananthapuram': { latitude: 8.5241, longitude: 76.9366 },
  
  // Add more cities as needed
}

/**
 * State capital coordinates for fallback
 */
const STATE_CAPITALS: Record<string, { latitude: number; longitude: number }> = {
  'Karnataka': { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
  'Maharashtra': { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
  'Tamil Nadu': { latitude: 13.0827, longitude: 80.2707 }, // Chennai
  'Delhi': { latitude: 28.7041, longitude: 77.1025 }, // Delhi
  'West Bengal': { latitude: 22.5726, longitude: 88.3639 }, // Kolkata
  'Telangana': { latitude: 17.3850, longitude: 78.4867 }, // Hyderabad
  'Gujarat': { latitude: 23.0225, longitude: 72.5714 }, // Ahmedabad
  'Rajasthan': { latitude: 26.9124, longitude: 75.7873 }, // Jaipur
  'Kerala': { latitude: 8.5241, longitude: 76.9366 }, // Thiruvananthapuram
  'Uttar Pradesh': { latitude: 26.8467, longitude: 80.9462 }, // Lucknow
  'Madhya Pradesh': { latitude: 23.2599, longitude: 77.4126 }, // Bhopal
  'Punjab': { latitude: 30.7333, longitude: 76.7794 }, // Chandigarh
  'Andhra Pradesh': { latitude: 16.5062, longitude: 80.6480 }, // Amaravati
  'Haryana': { latitude: 30.7333, longitude: 76.7794 }, // Chandigarh
  'Bihar': { latitude: 25.5941, longitude: 85.1376 }, // Patna
  'Odisha': { latitude: 20.2961, longitude: 85.8245 }, // Bhubaneswar
  'Assam': { latitude: 26.1445, longitude: 91.7362 }, // Guwahati
  'Jharkhand': { latitude: 23.3441, longitude: 85.3096 }, // Ranchi
  'Chhattisgarh': { latitude: 21.2514, longitude: 81.6296 }, // Raipur
  'Uttarakhand': { latitude: 30.0668, longitude: 79.0193 }, // Dehradun
  'Himachal Pradesh': { latitude: 31.1048, longitude: 77.1734 }, // Shimla
  'Jammu and Kashmir': { latitude: 34.0837, longitude: 74.7973 }, // Srinagar
  'Goa': { latitude: 15.2993, longitude: 74.1240 }, // Panaji
}

/**
 * Get state capital coordinates as fallback
 */
function getStateCapitalCoordinates(state: string): { latitude: number; longitude: number } | null {
  return STATE_CAPITALS[state] || null
}

/**
 * Geocode a location using Open-Meteo Geocoding API (free, no API key required)
 */
async function geocodeLocation(locationString: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const encodedLocation = encodeURIComponent(locationString)
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodedLocation}&count=1&language=en&format=json`
    )
    
    const data = await response.json()
    
    if (data && data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        latitude: result.latitude,
        longitude: result.longitude
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Fetches location details from PIN code using India Post API
 */
export async function getLocationFromPinCode(pincode: string): Promise<PinCodeLocation | null> {
  try {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      throw new Error('Invalid PIN code format')
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()

    if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0]
      const city = postOffice.District || postOffice.Name
      const state = postOffice.State
      
      // Try to get coordinates from our predefined list
      let coordinates = INDIAN_CITY_COORDINATES[city] || 
                       INDIAN_CITY_COORDINATES[postOffice.District]
      
      // If not found in our list, try to geocode the city+state
      if (!coordinates || (coordinates.latitude === 0 && coordinates.longitude === 0)) {
        const geocoded = await geocodeLocation(`${city}, ${state}, India`)
        if (geocoded) {
          coordinates = geocoded
        }
      }
      
      // If still no coordinates, use state capital or major city as fallback
      if (!coordinates || (coordinates.latitude === 0 && coordinates.longitude === 0)) {
        coordinates = getStateCapitalCoordinates(state) || { latitude: 20.5937, longitude: 78.9629 } // India center
      }

      return {
        pincode,
        city,
        district: postOffice.District,
        state: state,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching PIN code location:', error)
    return null
  }
}

/**
 * Analyzes disease risk for a specific PIN code
 * Complete workflow: PIN code → Location → Weather → Disease Prediction → Doctor Requirements
 */
export async function analyzeDiseaseByPinCode(pincode: string): Promise<{
  location: PinCodeLocation | null
  weather: WeatherData | null
  diseases: DiseasePrediction[]
  doctorRequirements: DoctorRequirement[]
  totalDoctorsRequired: number
  summary: string
} | null> {
  try {
    console.log(`🔍 Starting disease analysis for PIN code: ${pincode}`)

    // Step 1: Get location from PIN code
    const location = await getLocationFromPinCode(pincode)
    if (!location) {
      console.error('❌ Could not find location for PIN code:', pincode)
      return null
    }

    console.log(`✅ Location found: ${location.city}, ${location.state}`)

    // Step 2: Check if we have valid coordinates
    if (location.latitude === 0 && location.longitude === 0) {
      console.error('❌ No coordinates available for this location')
      return {
        location,
        weather: null,
        diseases: [],
        doctorRequirements: [],
        totalDoctorsRequired: 0,
        summary: `Location ${location.city} found, but coordinates not available. Please add coordinates for this city.`
      }
    }

    // Step 3: Fetch weather data for the location
    console.log(`🌤️ Fetching weather data for ${location.city}...`)
    const weather = await fetchWeatherFromAPI({
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
    })

    console.log(`✅ Weather data: ${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.rainfall}mm rain`)

    // Step 4: Predict diseases based on weather
    console.log(`🦠 Predicting diseases...`)
    const diseases = predictDiseases(weather)
    console.log(`✅ Found ${diseases.length} potential disease risks`)

    // Step 5: Calculate doctor requirements
    const doctorRequirements: DoctorRequirement[] = diseases.map(disease => ({
      id: `${location.pincode}-${disease.disease}`,
      city: location.city,
      predicted_disease: disease.disease,
      risk_level: disease.risk_level,
      required_doctors: disease.required_doctors,
      specialty: disease.specialty,
      generated_at: new Date().toISOString(),
    }))

    const totalDoctorsRequired = doctorRequirements.reduce(
      (sum, req) => sum + req.required_doctors,
      0
    )

    // Step 6: Generate summary
    const summary = generateSummary(location, weather, diseases, totalDoctorsRequired)

    console.log(`✅ Analysis complete: ${totalDoctorsRequired} total doctors required`)

    return {
      location,
      weather,
      diseases,
      doctorRequirements,
      totalDoctorsRequired,
      summary,
    }
  } catch (error) {
    console.error('❌ Error in disease analysis:', error)
    return null
  }
}

/**
 * Generates a human-readable summary of the analysis
 */
function generateSummary(
  location: PinCodeLocation,
  weather: WeatherData,
  diseases: DiseasePrediction[],
  totalDoctors: number
): string {
  const highRisk = diseases.filter(d => d.risk_level >= 0.6)
  const mediumRisk = diseases.filter(d => d.risk_level >= 0.4 && d.risk_level < 0.6)
  
  let summary = `📍 Location: ${location.city}, ${location.state} (PIN: ${location.pincode})\n`
  summary += `🌡️ Weather: ${weather.temperature.toFixed(1)}°C, ${weather.humidity.toFixed(0)}% humidity, ${weather.rainfall.toFixed(1)}mm rainfall\n\n`
  
  if (diseases.length === 0) {
    summary += `✅ Good news! No significant disease risks detected for current weather conditions.\n`
    summary += `👨‍⚕️ Recommended: Maintain standard medical staffing (${totalDoctors} doctors)`
  } else {
    summary += `⚠️ Disease Risk Assessment:\n`
    
    if (highRisk.length > 0) {
      summary += `\n🔴 HIGH RISK (${highRisk.length}):\n`
      highRisk.forEach(d => {
        summary += `   • ${d.disease}: ${(d.risk_level * 100).toFixed(0)}% risk - ${d.required_doctors} ${d.specialty} doctor(s) needed\n`
      })
    }
    
    if (mediumRisk.length > 0) {
      summary += `\n🟡 MEDIUM RISK (${mediumRisk.length}):\n`
      mediumRisk.forEach(d => {
        summary += `   • ${d.disease}: ${(d.risk_level * 100).toFixed(0)}% risk - ${d.required_doctors} ${d.specialty} doctor(s) needed\n`
      })
    }
    
    summary += `\n👨‍⚕️ Total Medical Staff Recommended: ${totalDoctors} specialized doctors`
  }
  
  return summary
}

/**
 * Batch analyze multiple PIN codes
 */
export async function analyzeMultiplePinCodes(pincodes: string[]): Promise<Map<string, Awaited<ReturnType<typeof analyzeDiseaseByPinCode>>>> {
  const results = new Map()
  
  for (const pincode of pincodes) {
    const analysis = await analyzeDiseaseByPinCode(pincode)
    results.set(pincode, analysis)
  }
  
  return results
}

/**
 * Get disease analysis for hospital's area based on saved PIN code
 */
export async function getHospitalAreaDiseaseRisk(hospitalPinCode: string): Promise<{
  hasRisk: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'none'
  diseases: string[]
  doctorsNeeded: number
  recommendation: string
} | null> {
  const analysis = await analyzeDiseaseByPinCode(hospitalPinCode)
  
  if (!analysis || !analysis.weather) {
    return null
  }

  const highRiskDiseases = analysis.diseases.filter(d => d.risk_level >= 0.6)
  const mediumRiskDiseases = analysis.diseases.filter(d => d.risk_level >= 0.4 && d.risk_level < 0.6)
  
  let riskLevel: 'low' | 'medium' | 'high' | 'none' = 'none'
  if (highRiskDiseases.length > 0) {
    riskLevel = 'high'
  } else if (mediumRiskDiseases.length > 0) {
    riskLevel = 'medium'
  } else if (analysis.diseases.length > 0) {
    riskLevel = 'low'
  }

  const diseaseNames = analysis.diseases.map(d => d.disease)
  
  let recommendation = ''
  if (riskLevel === 'high') {
    recommendation = `⚠️ HIGH RISK: Increase bed capacity and medical staff. ${analysis.totalDoctorsRequired} specialized doctors recommended.`
  } else if (riskLevel === 'medium') {
    recommendation = `🟡 MODERATE RISK: Prepare additional resources. ${analysis.totalDoctorsRequired} doctors on standby recommended.`
  } else if (riskLevel === 'low') {
    recommendation = `✅ LOW RISK: Monitor situation. Standard staffing sufficient.`
  } else {
    recommendation = `✅ NO RISK: Normal operations. No additional medical staff needed.`
  }

  return {
    hasRisk: analysis.diseases.length > 0,
    riskLevel,
    diseases: diseaseNames,
    doctorsNeeded: analysis.totalDoctorsRequired,
    recommendation,
  }
}

/**
 * Export for use in API routes and components
 */
export {
  INDIAN_CITY_COORDINATES,
  type PinCodeLocation,
}
