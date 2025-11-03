/**
 * Disease Prediction Logic - Rule-Based System
 * Uses weather conditions to predict seasonal disease risks
 * No external ML APIs required - lightweight and fast
 */

import type { 
  WeatherData, 
  DiseasePrediction, 
  DiseaseDefinition 
} from './types/doctor-module'

/**
 * Disease definitions with prediction rules and thresholds
 * Updated with research-based multi-factor risk calculations
 */
export const DISEASE_DEFINITIONS: DiseaseDefinition[] = [
  {
    name: 'Dengue Fever',
    specialty: 'Infectious Disease',
    doctors_required: 5,
    thresholds: {
      temperature_min: 20,
      temperature_max: 35,
      humidity_min: 70,
      rainfall_min: 5,
    },
    description: 'Mosquito-borne viral infection common in tropical regions',
    symptoms: [
      'High fever (40°C/104°F)',
      'Severe headache',
      'Pain behind the eyes',
      'Joint and muscle pain',
      'Nausea and vomiting',
      'Skin rash'
    ],
    prevention: [
      'Use mosquito repellent',
      'Wear protective clothing',
      'Remove standing water',
      'Use mosquito nets',
      'Install window screens'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Optimal dengue breeding temperature: 25-30°C (highest risk)
      if (weather.temperature >= 25 && weather.temperature <= 30) {
        risk += 0.35
      } else if (weather.temperature >= 20 && weather.temperature <= 35) {
        risk += 0.20
      }
      
      // High humidity is critical for mosquito survival (>70% optimal)
      if (weather.humidity > 80) {
        risk += 0.30
      } else if (weather.humidity > 70) {
        risk += 0.20
      }
      
      // Rainfall creates breeding grounds (5-20mm optimal)
      if (weather.rainfall >= 5 && weather.rainfall <= 20) {
        risk += 0.25
      } else if (weather.rainfall > 20) {
        risk += 0.15 // Too much rain can flush out larvae
      }
      
      // Low wind speed allows mosquitoes to fly (<15 km/h)
      if (weather.windSpeed !== undefined && weather.windSpeed < 15) {
        risk += 0.10
      }
      
      // Compound risk for perfect dengue conditions
      if (weather.temperature >= 25 && weather.temperature <= 30 && 
          weather.humidity > 75 && weather.rainfall >= 5) {
        risk = Math.min(risk + 0.15, 1.0)
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Malaria',
    specialty: 'Infectious Disease',
    doctors_required: 6,
    thresholds: {
      temperature_min: 18,
      temperature_max: 32,
      humidity_min: 60,
      rainfall_min: 3,
    },
    description: 'Parasitic disease transmitted by Anopheles mosquitoes',
    symptoms: [
      'Cyclical fever and chills',
      'Sweating',
      'Headache and muscle pain',
      'Fatigue',
      'Nausea and vomiting',
      'Anemia'
    ],
    prevention: [
      'Sleep under insecticide-treated nets',
      'Take antimalarial medication',
      'Use mosquito repellent',
      'Wear long sleeves and pants',
      'Eliminate standing water',
      'Indoor residual spraying'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Malaria parasites develop optimally at 20-30°C
      if (weather.temperature >= 20 && weather.temperature <= 30) {
        risk += 0.35
      } else if (weather.temperature >= 18 && weather.temperature <= 32) {
        risk += 0.20
      }
      
      // High humidity (60-90%) crucial for mosquito survival
      if (weather.humidity >= 70 && weather.humidity <= 90) {
        risk += 0.30
      } else if (weather.humidity >= 60) {
        risk += 0.20
      }
      
      // Moderate rainfall creates breeding sites
      if (weather.rainfall >= 3 && weather.rainfall <= 15) {
        risk += 0.25
      }
      
      // Low wind speed (<10 km/h) helps mosquito activity
      if (weather.windSpeed !== undefined && weather.windSpeed < 10) {
        risk += 0.10
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Influenza (Flu)',
    specialty: 'General Medicine',
    doctors_required: 3,
    thresholds: {
      temperature_max: 20,
      humidity_min: 40,
    },
    description: 'Viral infection affecting the respiratory system, common in cold weather',
    symptoms: [
      'Fever and chills',
      'Cough and sore throat',
      'Runny or stuffy nose',
      'Body aches',
      'Fatigue',
      'Headache'
    ],
    prevention: [
      'Get annual flu vaccination',
      'Wash hands frequently',
      'Avoid close contact with sick people',
      'Cover mouth when coughing',
      'Stay home when sick',
      'Boost immune system'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Flu thrives in cold temperatures (5-15°C optimal)
      if (weather.temperature >= 5 && weather.temperature <= 15) {
        risk += 0.40
      } else if (weather.temperature < 20) {
        risk += 0.25
      }
      
      // Low to moderate humidity (40-70%) helps virus spread
      if (weather.humidity >= 40 && weather.humidity <= 70) {
        risk += 0.30
      } else if (weather.humidity < 40) {
        risk += 0.20 // Dry air allows longer aerosol survival
      }
      
      // High atmospheric pressure associated with cold, dry conditions
      if (weather.pressure !== undefined && weather.pressure > 1020) {
        risk += 0.10
      }
      
      // Winter conditions compound risk
      if (weather.temperature < 15 && weather.humidity >= 40 && weather.humidity <= 70) {
        risk = Math.min(risk + 0.15, 1.0)
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Typhoid Fever',
    specialty: 'Infectious Disease',
    doctors_required: 4,
    thresholds: {
      temperature_min: 20,
      temperature_max: 35,
      humidity_min: 60,
      rainfall_min: 2,
    },
    description: 'Bacterial infection from contaminated water, common after flooding',
    symptoms: [
      'Prolonged high fever',
      'Weakness and fatigue',
      'Abdominal pain',
      'Headache',
      'Loss of appetite',
      'Rose-colored spots on chest'
    ],
    prevention: [
      'Drink boiled or bottled water',
      'Wash hands with soap',
      'Avoid street food',
      'Get typhoid vaccination',
      'Ensure proper sanitation',
      'Cook food thoroughly'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Warm, humid conditions (20-35°C) promote bacterial growth
      if (weather.temperature >= 25 && weather.temperature <= 35) {
        risk += 0.35
      } else if (weather.temperature >= 20) {
        risk += 0.20
      }
      
      // High humidity increases contamination risk
      if (weather.humidity > 70) {
        risk += 0.25
      }
      
      // Heavy rainfall (>10mm) contaminates water supplies
      if (weather.rainfall > 10) {
        risk += 0.30
      } else if (weather.rainfall > 2) {
        risk += 0.15
      }
      
      // Flooding conditions (high rain + high humidity)
      if (weather.rainfall > 15 && weather.humidity > 75) {
        risk = Math.min(risk + 0.20, 1.0)
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Heat Stroke',
    specialty: 'Emergency Medicine',
    doctors_required: 2,
    thresholds: {
      temperature_min: 35,
    },
    description: 'Serious condition caused by prolonged exposure to high temperatures',
    symptoms: [
      'Body temperature above 40°C (104°F)',
      'Altered mental state',
      'Hot, dry skin',
      'Nausea and vomiting',
      'Rapid heartbeat',
      'Headache and dizziness'
    ],
    prevention: [
      'Stay hydrated',
      'Avoid outdoor activities during peak heat',
      'Wear light, loose clothing',
      'Use sunscreen',
      'Take frequent breaks in shade',
      'Check on vulnerable individuals'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Extreme heat is primary factor (>35°C)
      if (weather.temperature > 42) {
        risk += 0.60
      } else if (weather.temperature > 38) {
        risk += 0.45
      } else if (weather.temperature > 35) {
        risk += 0.30
      }
      
      // High UV index (>8) increases risk
      if (weather.uvIndex !== undefined) {
        if (weather.uvIndex > 10) {
          risk += 0.20
        } else if (weather.uvIndex > 8) {
          risk += 0.15
        }
      }
      
      // High humidity prevents cooling through sweating
      if (weather.temperature > 35 && weather.humidity > 70) {
        risk += 0.20 // Heat index effect
      } else if (weather.temperature > 35 && weather.humidity < 30) {
        risk += 0.10 // Dry heat dehydration
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Respiratory Infections',
    specialty: 'Pulmonology',
    doctors_required: 4,
    thresholds: {
      temperature_max: 18,
      humidity_min: 50,
    },
    description: 'Various respiratory tract infections common in cold, damp conditions',
    symptoms: [
      'Persistent cough',
      'Shortness of breath',
      'Chest pain or tightness',
      'Wheezing',
      'Fever',
      'Fatigue'
    ],
    prevention: [
      'Keep indoor air clean',
      'Avoid smoking and pollutants',
      'Stay warm and dry',
      'Practice good hygiene',
      'Boost immune system',
      'Get vaccinated'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Cold temperatures (<18°C) stress respiratory system
      if (weather.temperature < 10) {
        risk += 0.35
      } else if (weather.temperature < 18) {
        risk += 0.25
      }
      
      // Moderate to high humidity (50-80%) supports pathogen survival
      if (weather.humidity >= 60 && weather.humidity <= 80) {
        risk += 0.30
      } else if (weather.humidity >= 50) {
        risk += 0.20
      }
      
      // Low pressure systems associated with respiratory issues
      if (weather.pressure !== undefined && weather.pressure < 1000) {
        risk += 0.15
      }
      
      // Cold, damp conditions compound risk
      if (weather.temperature < 15 && weather.humidity > 65 && weather.rainfall > 1) {
        risk = Math.min(risk + 0.15, 1.0)
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Pneumonia',
    specialty: 'Pulmonology',
    doctors_required: 5,
    thresholds: {
      temperature_max: 15,
      humidity_min: 60,
    },
    description: 'Lung infection causing inflammation, severe in cold/damp conditions',
    symptoms: [
      'Chest pain when breathing',
      'Confusion (in older adults)',
      'Cough with phlegm',
      'Fatigue',
      'Fever and chills',
      'Shortness of breath'
    ],
    prevention: [
      'Get pneumonia vaccine',
      'Practice good hygiene',
      'Don\'t smoke',
      'Stay up to date on immunizations',
      'Keep immune system strong',
      'Avoid sick people'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Very cold temperatures (<15°C) increase risk
      if (weather.temperature < 5) {
        risk += 0.40
      } else if (weather.temperature < 15) {
        risk += 0.30
      }
      
      // High humidity (>60%) in cold weather
      if (weather.humidity > 70 && weather.temperature < 15) {
        risk += 0.35
      } else if (weather.humidity > 60) {
        risk += 0.20
      }
      
      // Sudden temperature drops increase vulnerability
      if (weather.dewPoint !== undefined) {
        const temperatureDiff = weather.temperature - weather.dewPoint
        if (temperatureDiff > 10 && weather.temperature < 15) {
          risk += 0.15
        }
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Allergic Rhinitis',
    specialty: 'Allergy & Immunology',
    doctors_required: 2,
    thresholds: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_min: 40,
      humidity_max: 70,
    },
    description: 'Allergic reaction causing nasal inflammation, common in spring/fall',
    symptoms: [
      'Sneezing',
      'Runny or stuffy nose',
      'Itchy eyes, nose, or throat',
      'Watery eyes',
      'Postnasal drip',
      'Cough'
    ],
    prevention: [
      'Monitor pollen counts',
      'Keep windows closed during high pollen days',
      'Use air purifiers',
      'Shower after outdoor activities',
      'Take antihistamines',
      'Avoid outdoor activities at peak pollen times'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Mild temperatures (15-25°C) ideal for pollen release
      if (weather.temperature >= 18 && weather.temperature <= 24) {
        risk += 0.35
      } else if (weather.temperature >= 15 && weather.temperature <= 25) {
        risk += 0.25
      }
      
      // Moderate humidity (40-70%) optimal for pollen spread
      if (weather.humidity >= 45 && weather.humidity <= 65) {
        risk += 0.30
      }
      
      // Low rainfall (<1mm) keeps pollen airborne longer
      if (weather.rainfall < 1) {
        risk += 0.20
      }
      
      // Moderate wind (10-20 km/h) disperses pollen
      if (weather.windSpeed !== undefined && weather.windSpeed >= 10 && weather.windSpeed <= 20) {
        risk += 0.15
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Asthma Attacks',
    specialty: 'Pulmonology',
    doctors_required: 3,
    thresholds: {
      temperature_min: 10,
      temperature_max: 30,
    },
    description: 'Respiratory condition worsened by weather changes and air quality',
    symptoms: [
      'Shortness of breath',
      'Chest tightness',
      'Wheezing',
      'Coughing',
      'Difficulty sleeping',
      'Rapid breathing'
    ],
    prevention: [
      'Use prescribed inhalers',
      'Avoid triggers',
      'Monitor air quality',
      'Stay indoors during high pollution',
      'Keep rescue inhaler nearby',
      'Follow asthma action plan'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Temperature extremes trigger asthma
      if (weather.temperature < 5 || weather.temperature > 30) {
        risk += 0.30
      } else if (weather.temperature < 10 || weather.temperature > 25) {
        risk += 0.20
      }
      
      // Very high humidity (>80%) or very low (<30%) problematic
      if (weather.humidity > 85 || weather.humidity < 25) {
        risk += 0.30
      } else if (weather.humidity > 75 || weather.humidity < 35) {
        risk += 0.20
      }
      
      // High wind speed can carry irritants
      if (weather.windSpeed !== undefined && weather.windSpeed > 25) {
        risk += 0.20
      }
      
      // Low pressure systems trigger symptoms
      if (weather.pressure !== undefined && weather.pressure < 1005) {
        risk += 0.20
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Dehydration & Heat Exhaustion',
    specialty: 'Emergency Medicine',
    doctors_required: 3,
    thresholds: {
      temperature_min: 32,
    },
    description: 'Condition caused by excessive fluid loss in hot weather',
    symptoms: [
      'Excessive thirst',
      'Dry mouth and skin',
      'Fatigue and weakness',
      'Dizziness',
      'Decreased urination',
      'Muscle cramps'
    ],
    prevention: [
      'Drink plenty of fluids',
      'Avoid alcohol and caffeine',
      'Wear light clothing',
      'Take breaks in cool areas',
      'Avoid strenuous activity in heat',
      'Monitor urine color'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // High temperatures (>32°C) increase fluid loss
      if (weather.temperature > 38) {
        risk += 0.45
      } else if (weather.temperature > 35) {
        risk += 0.35
      } else if (weather.temperature > 32) {
        risk += 0.25
      }
      
      // Low humidity (<40%) exacerbates dehydration through increased evaporation
      if (weather.humidity < 30 && weather.temperature > 32) {
        risk += 0.30
      } else if (weather.humidity < 40 && weather.temperature > 35) {
        risk += 0.20
      }
      
      // High UV index increases sun exposure risk
      if (weather.uvIndex !== undefined && weather.uvIndex > 8) {
        risk += 0.15
      }
      
      // Wind speed >15 km/h increases evaporation
      if (weather.windSpeed !== undefined && weather.windSpeed > 15 && weather.temperature > 35) {
        risk += 0.10
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Gastroenteritis',
    specialty: 'Gastroenterology',
    doctors_required: 4,
    thresholds: {
      temperature_min: 22,
      temperature_max: 38,
      humidity_min: 60,
    },
    description: 'Stomach and intestinal inflammation, common in warm, humid conditions',
    symptoms: [
      'Diarrhea',
      'Nausea and vomiting',
      'Abdominal cramps',
      'Fever',
      'Loss of appetite',
      'Dehydration'
    ],
    prevention: [
      'Wash hands thoroughly',
      'Drink clean, boiled water',
      'Avoid contaminated food',
      'Practice food safety',
      'Maintain hygiene',
      'Cook food properly'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Warm temperatures (22-38°C) promote bacterial growth in food
      if (weather.temperature >= 28 && weather.temperature <= 35) {
        risk += 0.35
      } else if (weather.temperature >= 22 && weather.temperature <= 38) {
        risk += 0.25
      }
      
      // High humidity (>60%) increases food spoilage rate
      if (weather.humidity > 75) {
        risk += 0.30
      } else if (weather.humidity > 60) {
        risk += 0.20
      }
      
      // Heavy rainfall contaminates water and food
      if (weather.rainfall > 10) {
        risk += 0.25
      } else if (weather.rainfall > 5) {
        risk += 0.15
      }
      
      // Perfect conditions for foodborne illness
      if (weather.temperature >= 25 && weather.humidity > 70 && weather.rainfall > 5) {
        risk = Math.min(risk + 0.15, 1.0)
      }
      
      return Math.min(risk, 1.0)
    }
  },
  {
    name: 'Skin Infections',
    specialty: 'Dermatology',
    doctors_required: 2,
    thresholds: {
      temperature_min: 25,
      humidity_min: 70,
    },
    description: 'Bacterial and fungal skin infections in hot, humid weather',
    symptoms: [
      'Redness and inflammation',
      'Itching and rash',
      'Pus-filled lesions',
      'Skin scaling',
      'Pain or tenderness',
      'Warmth in affected area'
    ],
    prevention: [
      'Keep skin clean and dry',
      'Wear breathable clothing',
      'Shower after sweating',
      'Use antifungal powder',
      'Avoid sharing personal items',
      'Treat cuts promptly'
    ],
    risk_calculator: (weather: WeatherData): number => {
      let risk = 0
      
      // Hot, humid conditions (>25°C, >70% humidity) ideal for microbes
      if (weather.temperature > 30 && weather.humidity > 80) {
        risk += 0.45
      } else if (weather.temperature > 25 && weather.humidity > 70) {
        risk += 0.35
      }
      
      // High dewpoint indicates moisture that supports fungal growth
      if (weather.dewPoint !== undefined && weather.dewPoint > 20) {
        risk += 0.25
      }
      
      // Light rain keeps skin damp
      if (weather.rainfall > 1 && weather.rainfall < 5) {
        risk += 0.15
      }
      
      // Low wind prevents skin drying
      if (weather.windSpeed !== undefined && weather.windSpeed < 5) {
        risk += 0.10
      }
      
      return Math.min(risk, 1.0)
    }
  }
]

/**
 * Predicts diseases based on current weather conditions
 * Enhanced with improved risk threshold and comprehensive logging
 * @param weather Current weather data with enhanced parameters
 * @returns Array of disease predictions with risk levels
 */
export function predictDiseases(weather: WeatherData): DiseasePrediction[] {
  console.log(`🔍 Predicting diseases for ${weather.city} based on enhanced weather data:`, {
    temperature: weather.temperature,
    humidity: weather.humidity,
    rainfall: weather.rainfall,
    windSpeed: weather.windSpeed,
    uvIndex: weather.uvIndex,
    pressure: weather.pressure,
    dewPoint: weather.dewPoint,
  })

  const predictions: DiseasePrediction[] = DISEASE_DEFINITIONS
    .map(disease => {
      const risk_level = disease.risk_calculator(weather)
      
      return {
        disease: disease.name,
        risk_level,
        required_doctors: Math.ceil(disease.doctors_required * risk_level),
        specialty: disease.specialty,
        description: disease.description,
        symptoms: disease.symptoms,
        prevention: disease.prevention,
      }
    })
    // Lower threshold to 0.25 to catch more potential risks
    .filter(prediction => prediction.risk_level > 0.25)
    // Sort by risk level (highest first)
    .sort((a, b) => b.risk_level - a.risk_level)

  console.log(`✅ Predicted ${predictions.length} diseases with significant risk (>25%) for ${weather.city}:`)
  predictions.forEach(p => {
    console.log(`   • ${p.disease}: ${(p.risk_level * 100).toFixed(0)}% risk - ${p.required_doctors} ${p.specialty} doctors`)
  })
  
  return predictions
}

/**
 * Categorizes risk level into human-readable categories
 * @param riskLevel Risk level (0-1)
 * @returns Risk category string
 */
export function getRiskCategory(riskLevel: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (riskLevel >= 0.8) return 'Critical'
  if (riskLevel >= 0.6) return 'High'
  if (riskLevel >= 0.4) return 'Medium'
  return 'Low'
}

/**
 * Gets color code for risk level (for UI visualization)
 * @param riskLevel Risk level (0-1)
 * @returns Tailwind color class
 */
export function getRiskColor(riskLevel: number): string {
  if (riskLevel >= 0.8) return 'text-red-600 dark:text-red-400'
  if (riskLevel >= 0.6) return 'text-orange-600 dark:text-orange-400'
  if (riskLevel >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

/**
 * Gets background color for risk level
 * @param riskLevel Risk level (0-1)
 * @returns Tailwind background color class
 */
export function getRiskBackgroundColor(riskLevel: number): string {
  if (riskLevel >= 0.8) return 'bg-red-100 dark:bg-red-900/20'
  if (riskLevel >= 0.6) return 'bg-orange-100 dark:bg-orange-900/20'
  if (riskLevel >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/20'
  return 'bg-green-100 dark:bg-green-900/20'
}

/**
 * Calculates total doctor requirements across all predictions
 * @param predictions Array of disease predictions
 * @returns Total number of doctors required
 */
export function calculateTotalDoctorRequirements(predictions: DiseasePrediction[]): number {
  return predictions.reduce((total, prediction) => total + prediction.required_doctors, 0)
}

/**
 * Groups predictions by specialty
 * @param predictions Array of disease predictions
 * @returns Map of specialty to doctor count
 */
export function groupPredictionsBySpecialty(
  predictions: DiseasePrediction[]
): Map<string, number> {
  const specialtyMap = new Map<string, number>()
  
  predictions.forEach(prediction => {
    const current = specialtyMap.get(prediction.specialty) || 0
    specialtyMap.set(prediction.specialty, current + prediction.required_doctors)
  })
  
  return specialtyMap
}

/**
 * Generates health advisory based on weather and disease predictions
 * @param weather Current weather data
 * @param predictions Disease predictions
 * @returns Health advisory message
 */
export function generateHealthAdvisory(
  weather: WeatherData,
  predictions: DiseasePrediction[]
): string {
  if (predictions.length === 0) {
    return 'Current weather conditions pose minimal health risks. Continue normal activities.'
  }
  
  const highestRisk = predictions[0]
  const advisory = [
    `Health Advisory for ${weather.city}:`,
    `Elevated risk of ${highestRisk.disease} (${(highestRisk.risk_level * 100).toFixed(0)}% risk level).`,
    `Primary symptoms to watch: ${highestRisk.symptoms.slice(0, 3).join(', ')}.`,
    `Recommended action: ${highestRisk.prevention[0]}`,
  ]
  
  return advisory.join(' ')
}
