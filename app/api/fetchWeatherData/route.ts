/**
 * API Route: Fetch Weather Data and Generate Disease Predictions
 * Endpoint: /api/fetchWeatherData
 * Method: GET, POST
 * 
 * This endpoint:
 * 1. Fetches weather data from Open-Meteo API
 * 2. Stores weather data in Firestore
 * 3. Generates disease predictions
 * 4. Stores doctor requirements in Firestore
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc } from 'firebase/firestore'
import { 
  fetchWeatherForCities, 
  getCityCoordinates, 
  fetchWeatherFromAPI,
  CITY_COORDINATES 
} from '@/lib/fetchWeatherData'
import { predictDiseases } from '@/lib/predictDisease'
import { predictWithML, initializeMLModel, getMLModel } from '@/lib/mlModel'
import type { DoctorRequirement, ApiResponse } from '@/lib/types/doctor-module'

/**
 * GET handler - Fetches weather and updates predictions for all cities
 */
export async function GET() {
  try {
    console.log('🌤️ Starting weather data fetch and disease prediction process...')
    
    // Fetch weather data for all configured cities
    const weatherDataArray = await fetchWeatherForCities(CITY_COORDINATES)
    
    if (weatherDataArray.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Failed to fetch weather data for any city',
        message: 'No weather data available'
      }, { status: 500 })
    }

    // Store weather data in Firestore
    const weatherCollection = collection(db, 'weather_data')
    const insertedWeatherIds: string[] = []
    
    for (const weatherData of weatherDataArray) {
      try {
        const docRef = await addDoc(weatherCollection, {
          ...weatherData,
          recorded_at: Timestamp.now()
        })
        insertedWeatherIds.push(docRef.id)
      } catch (error) {
        console.error(`❌ Error storing weather data for ${weatherData.city}:`, error)
      }
    }

    console.log(`✅ Stored weather data for ${insertedWeatherIds.length} cities`)

    // Initialize ML model if not trained
    const mlModel = getMLModel()
    if (!mlModel.isTrained()) {
      console.log('🧠 Training ML model for the first time...')
      await initializeMLModel(2000, 50)
    }

    // Generate disease predictions for each city using BOTH methods
    const allPredictions: DoctorRequirement[] = []
    
    for (const weather of weatherDataArray) {
      // Get ML predictions
      let predictions
      try {
        const mlPredictions = await predictWithML({
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          wind_speed: weather.windSpeed || 0,
          uv_index: weather.uvIndex || 0,
          pressure: weather.pressure || 1013,
          dew_point: weather.dewPoint || 0,
          weather_code: weather.weatherCode || 0
        })
        
        // Convert ML predictions to doctor requirements format
        predictions = mlPredictions.map(pred => {
          // Map disease names to specialties
          let specialty = 'General Medicine'
          if (pred.disease.includes('Dengue') || pred.disease.includes('Malaria') || pred.disease.includes('Typhoid')) {
            specialty = 'Infectious Disease'
          } else if (pred.disease.includes('Respiratory') || pred.disease.includes('Pneumonia') || pred.disease.includes('Asthma')) {
            specialty = 'Pulmonology'
          } else if (pred.disease.includes('Heat') || pred.disease.includes('Dehydration')) {
            specialty = 'Emergency Medicine'
          } else if (pred.disease.includes('Gastro')) {
            specialty = 'Gastroenterology'
          } else if (pred.disease.includes('Skin')) {
            specialty = 'Dermatology'
          } else if (pred.disease.includes('Allergic') || pred.disease.includes('Rhinitis')) {
            specialty = 'Allergy & Immunology'
          }
          
          // Calculate required doctors based on probability
          const requiredDoctors = Math.ceil(pred.probability / 25) // 25% = 1 doctor, 50% = 2, 75% = 3, 100% = 4
          
          return {
            disease: pred.disease,
            risk_level: pred.riskLevel,
            required_doctors: requiredDoctors,
            specialty: specialty,
            ml_probability: pred.probability,
            ml_confidence: pred.confidence
          }
        })
        
        console.log(`🧠 ML predictions for ${weather.city}: ${predictions.length} diseases`)
      } catch (error) {
        console.error(`⚠️ ML prediction failed for ${weather.city}, falling back to rule-based:`, error)
        // Fallback to rule-based predictions
        const rulePredictions = predictDiseases(weather)
        predictions = rulePredictions.map(pred => ({
          disease: pred.disease,
          risk_level: pred.risk_level,
          required_doctors: pred.required_doctors,
          specialty: pred.specialty,
          ml_probability: undefined,
          ml_confidence: undefined
        }))
      }
      
      // Convert predictions to doctor requirements format
      const doctorRequirements: Omit<DoctorRequirement, 'id' | 'created_at'>[] = predictions.map(pred => ({
        city: weather.city,
        predicted_disease: pred.disease,
        risk_level: pred.risk_level,
        required_doctors: pred.required_doctors,
        specialty: pred.specialty,
        generated_at: new Date().toISOString(),
        ml_probability: pred.ml_probability,
        ml_confidence: pred.ml_confidence,
        prediction_method: pred.ml_probability ? 'ML' : 'Rule-Based'
      }))
      
      allPredictions.push(...doctorRequirements as DoctorRequirement[])
    }

    // Store doctor requirements in Firestore
    if (allPredictions.length > 0) {
      const requirementsCollection = collection(db, 'doctor_requirements')
      let insertedCount = 0
      
      for (const prediction of allPredictions) {
        try {
          await addDoc(requirementsCollection, {
            ...prediction,
            generated_at: Timestamp.now()
          })
          insertedCount++
        } catch (error) {
          console.error('❌ Error storing prediction:', error)
        }
      }

      console.log(`✅ Stored ${insertedCount} disease predictions`)
    }

    // Clean up old data (keep last 30 days)
    await cleanupOldData()

    return NextResponse.json<ApiResponse<{
      weather_count: number
      prediction_count: number
      cities: string[]
    }>>({
      success: true,
      data: {
        weather_count: weatherDataArray.length,
        prediction_count: allPredictions.length,
        cities: weatherDataArray.map(w => w.city)
      },
      message: `Successfully processed weather data and predictions for ${weatherDataArray.length} cities`
    })

  } catch (error) {
    console.error('❌ Error in fetchWeatherData API:', error)
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch weather data and generate predictions'
    }, { status: 500 })
  }
}

/**
 * POST handler - Fetches weather for a specific city
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city } = body

    if (!city) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'City name is required',
        message: 'Please provide a city name'
      }, { status: 400 })
    }

    console.log(`🌤️ Fetching weather data for ${city}...`)

    // Get city coordinates
    const coordinates = getCityCoordinates(city)
    
    if (!coordinates) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: `City "${city}" not found in database`,
        message: 'City not supported. Please use one of the configured cities.'
      }, { status: 404 })
    }

    // Fetch weather data
    const weatherData = await fetchWeatherFromAPI({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      city: coordinates.name
    })

    // Store in Firestore
    const weatherCollection = collection(db, 'weather_data')
    const docRef = await addDoc(weatherCollection, {
      ...weatherData,
      recorded_at: Timestamp.now()
    })

    const insertedWeather = {
      id: docRef.id,
      ...weatherData
    }

    // Generate disease predictions
    const predictions = predictDiseases(weatherData)
    
    // Also get ML predictions
    let mlPredictionsRaw: Array<{
      disease: string
      probability: number
      confidence: number
      riskLevel: string
    }> = []
    try {
      const mlModel = getMLModel()
      if (!mlModel.isTrained()) {
        await initializeMLModel(2000, 50)
      }
      
      mlPredictionsRaw = await predictWithML({
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
        wind_speed: weatherData.windSpeed || 0,
        uv_index: weatherData.uvIndex || 0,
        pressure: weatherData.pressure || 1013,
        dew_point: weatherData.dewPoint || 0,
        weather_code: weatherData.weatherCode || 0
      })
      
      console.log(`🧠 ML predictions for ${city}: ${mlPredictionsRaw.length} diseases`)
    } catch (error) {
      console.error('⚠️ ML prediction failed, using rule-based only:', error)
    }
    
    // Convert ML predictions to full format with specialty
    const mlPredictions = mlPredictionsRaw.map(pred => {
      let specialty = 'General Medicine'
      const requiredDoctors = Math.ceil(pred.probability / 25)
      
      if (pred.disease.includes('Dengue') || pred.disease.includes('Malaria') || pred.disease.includes('Typhoid')) {
        specialty = 'Infectious Disease'
      } else if (pred.disease.includes('Respiratory') || pred.disease.includes('Pneumonia') || pred.disease.includes('Asthma')) {
        specialty = 'Pulmonology'
      } else if (pred.disease.includes('Heat') || pred.disease.includes('Dehydration')) {
        specialty = 'Emergency Medicine'
      } else if (pred.disease.includes('Gastro')) {
        specialty = 'Gastroenterology'
      } else if (pred.disease.includes('Skin')) {
        specialty = 'Dermatology'
      } else if (pred.disease.includes('Allergic') || pred.disease.includes('Rhinitis')) {
        specialty = 'Allergy & Immunology'
      }
      
      return {
        disease: pred.disease,
        probability: pred.probability,
        risk_level: pred.riskLevel,
        required_doctors: requiredDoctors,
        specialty: specialty,
        ml_confidence: pred.confidence
      }
    })
    
    // Store predictions (prefer ML if available)
    const predictionsToStore = mlPredictions.length > 0 ? mlPredictions : predictions
    
    if (predictionsToStore.length > 0) {
      const doctorRequirements = predictionsToStore.map(pred => {
        // Check if this is an ML prediction (has ml_confidence)
        const isMLPrediction = 'ml_confidence' in pred
        
        if (isMLPrediction) {
          return {
            city: weatherData.city,
            predicted_disease: pred.disease,
            risk_level: pred.risk_level,
            required_doctors: pred.required_doctors,
            specialty: pred.specialty,
            generated_at: new Date().toISOString(),
            ml_probability: pred.probability,
            ml_confidence: pred.ml_confidence,
            prediction_method: 'ML'
          }
        } else {
          // Rule-based prediction
          return {
            city: weatherData.city,
            predicted_disease: pred.disease,
            risk_level: pred.risk_level,
            required_doctors: pred.required_doctors,
            specialty: pred.specialty,
            generated_at: new Date().toISOString(),
            prediction_method: 'Rule-Based'
          }
        }
      })

      const requirementsCollection = collection(db, 'doctor_requirements')
      for (const requirement of doctorRequirements) {
        try {
          await addDoc(requirementsCollection, {
            ...requirement,
            generated_at: Timestamp.now()
          })
        } catch (error) {
          console.error('❌ Error storing prediction:', error)
        }
      }
    }

    return NextResponse.json<ApiResponse<{
      weather: typeof insertedWeather
      predictions: typeof predictions
    }>>({
      success: true,
      data: {
        weather: insertedWeather,
        predictions
      },
      message: `Successfully fetched weather and predictions for ${city}`
    })

  } catch (error) {
    console.error('❌ Error in POST /api/fetchWeatherData:', error)
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to process request'
    }, { status: 500 })
  }
}

/**
 * Helper function to clean up old data
 */
async function cleanupOldData(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo)

    // Clean up old weather data
    const weatherQuery = query(
      collection(db, 'weather_data'),
      where('recorded_at', '<', thirtyDaysAgoTimestamp)
    )
    const weatherSnap = await getDocs(weatherQuery)
    
    let weatherDeletedCount = 0
    for (const docSnapshot of weatherSnap.docs) {
      try {
        await deleteDoc(docSnapshot.ref)
        weatherDeletedCount++
      } catch (error) {
        console.error('⚠️ Error deleting weather document:', error)
      }
    }

    // Clean up old predictions
    const predictionsQuery = query(
      collection(db, 'doctor_requirements'),
      where('generated_at', '<', thirtyDaysAgoTimestamp)
    )
    const predictionsSnap = await getDocs(predictionsQuery)
    
    let predictionsDeletedCount = 0
    for (const docSnapshot of predictionsSnap.docs) {
      try {
        await deleteDoc(docSnapshot.ref)
        predictionsDeletedCount++
      } catch (error) {
        console.error('⚠️ Error deleting prediction document:', error)
      }
    }

    console.log(`🧹 Cleaned up old data (30+ days): ${weatherDeletedCount} weather records, ${predictionsDeletedCount} predictions`)
  } catch (error) {
    console.error('⚠️ Error in cleanup:', error)
  }
}
