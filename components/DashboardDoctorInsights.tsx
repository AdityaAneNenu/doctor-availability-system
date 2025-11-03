/**
 * Dashboard Doctor Insights Component
 * Displays weather data, disease predictions, and doctor requirements based on PIN code
 */

'use client'

import { useState } from 'react'
import { 
  Cloud, 
  Droplets, 
  ThermometerSun, 
  Activity, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Clock,
  Stethoscope,
  MapPin,
  Loader2,
  Shield
} from 'lucide-react'
import { analyzeDiseaseByPinCode } from '@/lib/pinCodeDiseaseAnalysis'
import type { WeatherData, DiseasePrediction } from '@/lib/types/doctor-module'

interface DoctorInsightsProps {
  onPinCodeAnalyzed?: (pinCode: string, cityName: string) => void
}

interface AnalysisResult {
  location: {
    pincode: string
    city: string
    district: string
    state: string
  }
  weather: WeatherData
  diseases: DiseasePrediction[]
  totalDoctorsRequired: number
}

export default function DashboardDoctorInsights({ onPinCodeAnalyzed }: DoctorInsightsProps) {
  const [pinCode, setPinCode] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const validatePinCode = (pin: string): boolean => {
    if (!pin) {
      setError('PIN code is required')
      return false
    }
    if (!/^\d{6}$/.test(pin)) {
      setError('Please enter a valid 6-digit PIN code')
      return false
    }
    setError('')
    return true
  }

  const handleAnalyze = async () => {
    if (!validatePinCode(pinCode)) return

    setAnalyzing(true)
    setError('')

    try {
      const analysis = await analyzeDiseaseByPinCode(pinCode)

      if (!analysis || !analysis.location || !analysis.weather) {
        throw new Error('Could not analyze the area. Please check the PIN code.')
      }

      setResult({
        location: analysis.location,
        weather: analysis.weather,
        diseases: analysis.diseases,
        totalDoctorsRequired: analysis.totalDoctorsRequired
      })
      setLastUpdated(new Date())
      
      // Notify parent component
      if (onPinCodeAnalyzed) {
        onPinCodeAnalyzed(pinCode, analysis.location.city)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze area')
      setResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const getRiskColor = (level: number) => {
    if (level >= 0.6) return 'text-red-600 dark:text-red-400'
    if (level >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getRiskBg = (level: number) => {
    if (level >= 0.6) return 'bg-red-100 dark:bg-red-900/20'
    if (level >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-green-100 dark:bg-green-900/20'
  }

  const getRiskBarColor = (level: number) => {
    if (level >= 0.8) return 'bg-red-600'
    if (level >= 0.6) return 'bg-orange-600'
    if (level >= 0.4) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  const getRiskIcon = (level: number) => {
    if (level >= 0.6) return '🔴'
    if (level >= 0.4) return '🟡'
    return '🟢'
  }

  const getRiskCategory = (level: number) => {
    if (level >= 0.6) return 'High'
    if (level >= 0.4) return 'Medium'
    return 'Low'
  }

  // Calculate totals
  const highRiskCount = result?.diseases.filter(d => d.risk_level >= 0.6).length || 0
  const mediumRiskCount = result?.diseases.filter(d => d.risk_level >= 0.4 && d.risk_level < 0.6).length || 0
  const lowRiskCount = result?.diseases.filter(d => d.risk_level < 0.4).length || 0

  // Group by specialty
  const specialtyMap = new Map<string, number>()
  result?.diseases.forEach(d => {
    specialtyMap.set(d.specialty, (specialtyMap.get(d.specialty) || 0) + d.required_doctors)
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with PIN Code Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Doctor Availability Insights</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">AI-Powered Disease Prediction</p>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <div className="flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Last updated: </span>
                <span className="sm:hidden">Updated: </span>
                <span className="truncate">{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* PIN Code Input */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Enter PIN Code <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={pinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setPinCode(value)
                if (error) setError('')
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 560001"
              maxLength={6}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              disabled={analyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !pinCode}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm whitespace-nowrap"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="text-sm sm:text-base">Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Analyze Area</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Location & Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">City:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white text-right truncate">{result.location.city}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">District:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white text-right truncate">{result.location.district}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">State:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white text-right truncate">{result.location.state}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">PIN Code:</span>
                  <span className="text-sm sm:text-base font-mono font-bold text-gray-900 dark:text-white">{result.location.pincode}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <Cloud className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Current Weather</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
                  <ThermometerSun className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{result.weather.temperature.toFixed(1)}°C</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Temperature</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <Droplets className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{result.weather.humidity.toFixed(0)}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Humidity</div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 sm:p-4">
                  <Cloud className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{result.weather.rainfall.toFixed(1)}mm</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Rainfall</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{result.totalDoctorsRequired}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Total Doctors Needed</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{highRiskCount}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">High Risk Diseases</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumRiskCount}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Medium Risk</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{lowRiskCount}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">Low Risk</p>
            </div>
          </div>

          {/* Disease Predictions */}
          {result.diseases.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>Disease Risk Predictions</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {result.diseases.map((disease, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <span className="text-lg sm:text-xl flex-shrink-0">{getRiskIcon(disease.risk_level)}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg leading-tight">{disease.disease}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Specialty: {disease.specialty}</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRiskBg(disease.risk_level)} ${getRiskColor(disease.risk_level)}`}>
                        {getRiskCategory(disease.risk_level)} Risk
                      </span>
                    </div>
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                        <span className={`text-xs sm:text-sm font-medium ${getRiskColor(disease.risk_level)}`}>
                          {(disease.risk_level * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${getRiskBarColor(disease.risk_level)}`}
                          style={{ width: `${disease.risk_level * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="font-medium">{disease.required_doctors} doctors recommended</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 text-center">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-sm sm:text-base font-semibold text-green-900 dark:text-green-300 mb-1 sm:mb-2">No Significant Disease Risks Detected</h3>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                Current weather conditions pose minimal health risks for {result.location.city}
              </p>
            </div>
          )}

          {/* Specialty Breakdown */}
          {specialtyMap.size > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Doctor Requirements by Specialty</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {Array.from(specialtyMap.entries()).map(([specialty, count]) => (
                  <div key={specialty} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg gap-2">
                    <span className="text-xs sm:text-sm md:text-base text-gray-900 dark:text-white font-medium truncate">{specialty}</span>
                    <span className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{count} doctors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!result && !analyzing && (
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 shadow-sm text-center">
          <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">Enter a PIN Code to Get Started</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            We&apos;ll analyze weather conditions and predict disease risks for your area
          </p>
        </div>
      )}
    </div>
  )
}
