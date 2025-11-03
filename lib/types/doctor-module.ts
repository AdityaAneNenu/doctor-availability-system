/**
 * TypeScript interfaces for Doctor Availability & Seasonal Disease Prediction Module
 * Created: 2025-10-24
 */

/**
 * Weather data from Open-Meteo API
 * Enhanced with additional parameters for better disease prediction
 */
export interface WeatherData {
  id?: string
  city: string
  temperature: number // Celsius
  humidity: number // Percentage (0-100)
  rainfall: number // Millimeters
  windSpeed?: number // km/h - affects disease spread
  uvIndex?: number // 0-11+ scale - affects skin conditions and heat-related illnesses
  pressure?: number // hPa - correlates with respiratory issues
  dewPoint?: number // Celsius - indicates moisture levels affecting mold/bacteria growth
  weatherCode?: number // WMO weather code - general condition indicator
  recorded_at?: string
  created_at?: string
}

/**
 * Disease prediction with risk assessment
 */
export interface DiseasePrediction {
  disease: string
  risk_level: number // 0.0 to 1.0
  required_doctors: number
  specialty: string
  description: string
  symptoms: string[]
  prevention: string[]
}

/**
 * Doctor requirements stored in database
 */
export interface DoctorRequirement {
  id?: string
  city: string
  predicted_disease: string
  risk_level: number | 'High' | 'Medium' | 'Low' | 'Minimal'
  required_doctors: number
  specialty: string
  generated_at?: string
  created_at?: string
  ml_probability?: number
  ml_confidence?: number
  prediction_method?: 'ML' | 'Rule-Based'
}

/**
 * Open-Meteo API response structure
 * Enhanced with additional weather parameters
 */
export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_weather?: {
    temperature: number
    windspeed: number
    winddirection: number
    weathercode: number
    is_day: number
    time: string
  }
  hourly?: {
    time: string[]
    temperature_2m: number[]
    relativehumidity_2m: number[]
    precipitation: number[]
    windspeed_10m?: number[]
    pressure_msl?: number[]
    dewpoint_2m?: number[]
    uv_index?: number[]
  }
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

/**
 * Weather fetch configuration
 */
export interface WeatherFetchConfig {
  latitude: number
  longitude: number
  city: string
  hourly?: string[]
  daily?: string[]
  timezone?: string
}

/**
 * Disease risk thresholds - Enhanced with more parameters
 */
export interface DiseaseThresholds {
  temperature_min?: number
  temperature_max?: number
  humidity_min?: number
  humidity_max?: number
  rainfall_min?: number
  rainfall_max?: number
  windSpeed_min?: number
  windSpeed_max?: number
  uvIndex_min?: number
  uvIndex_max?: number
  pressure_min?: number
  pressure_max?: number
}

/**
 * Disease definition with prediction rules
 */
export interface DiseaseDefinition {
  name: string
  specialty: string
  doctors_required: number
  thresholds: DiseaseThresholds
  description: string
  symptoms: string[]
  prevention: string[]
  risk_calculator: (weather: WeatherData) => number
}

/**
 * Dashboard insights summary
 */
export interface DoctorInsightsSummary {
  city: string
  current_weather: WeatherData | null
  disease_predictions: DiseasePrediction[]
  total_doctors_required: number
  last_updated: string
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * City coordinates for weather fetching
 */
export interface CityCoordinates {
  name: string
  latitude: number
  longitude: number
  country?: string
  state?: string
}

/**
 * Weather statistics for analytics
 */
export interface WeatherStats {
  city: string
  avg_temperature: number
  avg_humidity: number
  total_rainfall: number
  data_points: number
  period_start: string
  period_end: string
}
