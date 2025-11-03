'use client'

import { useState } from 'react'

interface DoctorRequirement {
  specialty: string
  count: number
  reason: string
}

interface QuickRiskData {
  hasRisk: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'none'
  diseases: string[]
  doctorsNeeded: number
  recommendation: string
}

interface FullAnalysisData {
  location: {
    pincode: string
    city: string
    state: string
    district: string
  } | null
  weather: {
    temperature: number
    humidity: number
    rainfall: number
  } | null
  diseases: Array<{
    name: string
    severity: string
    probability: number
  }>
  doctorRequirements: DoctorRequirement[]
  totalDoctorsRequired: number
  summary: string
}

export default function PinCodeDiseaseRisk() {
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quickData, setQuickData] = useState<QuickRiskData | null>(null)
  const [fullData, setFullData] = useState<FullAnalysisData | null>(null)
  const [analysisType, setAnalysisType] = useState<'quick' | 'full'>('quick')

  const analyzePin = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit PIN code')
      return
    }

    setLoading(true)
    setError('')
    setQuickData(null)
    setFullData(null)

    try {
      const response = await fetch('/api/analyzePinCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode, type: analysisType })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || 'Failed to analyze PIN code')
        return
      }

      if (analysisType === 'quick') {
        setQuickData(result.data)
      } else {
        setFullData(result.data)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        📍 Area Disease Risk Analysis
      </h2>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Enter PIN Code
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="e.g., 560001"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              maxLength={6}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value as 'quick' | 'full')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="quick">Quick Risk Check</option>
              <option value="full">Full Analysis</option>
            </select>
          </div>
        </div>

        <button
          onClick={analyzePin}
          disabled={loading || pincode.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? '🔄 Analyzing...' : '🔍 Analyze Disease Risk'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Quick Risk Display */}
      {quickData && (
        <div className="space-y-4">
          <div className={`p-6 rounded-lg border-2 ${getRiskColor(quickData.riskLevel)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Risk Level: {quickData.riskLevel.toUpperCase()}
              </h3>
              <span className="text-3xl">
                {quickData.riskLevel === 'high' ? '🔴' : 
                 quickData.riskLevel === 'medium' ? '🟡' : 
                 quickData.riskLevel === 'low' ? '🟢' : '⚪'}
              </span>
            </div>

            {quickData.hasRisk ? (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Potential Diseases:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickData.diseases.map((disease, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/50 dark:bg-gray-900/50 rounded-full text-sm">
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Doctors Required:</h4>
                  <p className="text-2xl font-bold">{quickData.doctorsNeeded} specialists</p>
                </div>

                <div className="p-4 bg-white/30 dark:bg-gray-900/30 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Recommendation:</h4>
                  <p>{quickData.recommendation}</p>
                </div>
              </>
            ) : (
              <p className="text-lg">✅ No significant disease risk detected in this area.</p>
            )}
          </div>
        </div>
      )}

      {/* Full Analysis Display */}
      {fullData && (
        <div className="space-y-6">
          {/* Location Info */}
          {fullData.location && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">📍 Location</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {fullData.location.city}, {fullData.location.district}, {fullData.location.state}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">PIN: {fullData.location.pincode}</p>
            </div>
          )}

          {/* Weather Info */}
          {fullData.weather && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">🌤️ Current Weather</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{fullData.weather.temperature}°C</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{fullData.weather.humidity}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rainfall</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{fullData.weather.rainfall}mm</p>
                </div>
              </div>
            </div>
          )}

          {/* Disease Predictions */}
          {fullData.diseases.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">🦠 Disease Predictions</h3>
              <div className="space-y-2">
                {fullData.diseases.map((disease, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-900 dark:text-white">{disease.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        disease.severity === 'High' ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        disease.severity === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {disease.severity}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{disease.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Requirements */}
          {fullData.doctorRequirements.length > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">👨‍⚕️ Doctor Requirements</h3>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {fullData.totalDoctorsRequired} Total
                </span>
              </div>
              <div className="space-y-3">
                {fullData.doctorRequirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{req.specialty}</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{req.count}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{req.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">📊 Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{fullData.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
