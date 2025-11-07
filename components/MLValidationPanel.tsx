'use client'

/**
 * ML Model Validation Component
 * Trains ML model on government data and compares accuracy with rule-based system
 */

import { useState } from 'react'
import type { AccuracyComparison } from '@/lib/govtDataMLModel'

interface TrainingMetrics {
  epochs: number
  loss: string
  mae: string
  accuracy: string
  training_time: string
  data_points: number
}

interface OverallStatistics {
  total_comparisons: number
  avg_ml_accuracy: string
  avg_rule_based_accuracy: string
  ml_wins: number
  rule_based_wins: number
  ties: number
  winner: string
}

export default function MLValidationPanel() {
  const [isTraining, setIsTraining] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isTrained, setIsTrained] = useState(false)
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null)
  const [pincode, setPincode] = useState('')
  const [comparison, setComparison] = useState<AccuracyComparison | null>(null)
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(null)
  const [allComparisons, setAllComparisons] = useState<AccuracyComparison[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleTrain = async () => {
    setIsTraining(true)
    setError(null)
    
    try {
      const response = await fetch('/api/validateMLModel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'train' })
      })

      const data = await response.json()

      if (data.success) {
        setTrainingMetrics(data.training_metrics)
        setIsTrained(true)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed')
    } finally {
      setIsTraining(false)
    }
  }

  const handleValidate = async () => {
    if (!pincode) {
      setError('Please enter a pincode')
      return
    }

    setIsValidating(true)
    setError(null)
    setComparison(null)

    try {
      const response = await fetch('/api/validateMLModel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', pincode })
      })

      const data = await response.json()

      if (data.success) {
        setComparison(data.comparison)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const handleValidateAll = async () => {
    setIsValidating(true)
    setError(null)
    setOverallStats(null)
    setAllComparisons([])

    try {
      const response = await fetch('/api/validateMLModel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate-all' })
      })

      const data = await response.json()

      if (data.success) {
        setOverallStats(data.overall_statistics)
        setAllComparisons(data.detailed_comparisons)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Training Section */}
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-xl font-bold mb-2">Step 1: Train ML Model</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Train a neural network on 15 government health records to predict doctor requirements
        </p>
        
        <button
          onClick={handleTrain}
          disabled={isTraining || isTrained}
          className={`px-6 py-3 rounded-lg font-semibold ${
            isTrained
              ? 'bg-green-600 text-white cursor-default'
              : isTraining
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isTraining ? (
            <>
              <span className="animate-spin inline-block mr-2">⏳</span>
              Training Model...
            </>
          ) : isTrained ? (
            <>
              <span className="mr-2">✅</span>
              Model Trained Successfully
            </>
          ) : (
            <>
              <span className="mr-2">🎓</span>
              Train Model on Government Data
            </>
          )}
        </button>

        {trainingMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{trainingMetrics.accuracy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Training Time</p>
              <p className="text-2xl font-bold">{trainingMetrics.training_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold">{trainingMetrics.data_points}</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Section */}
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-xl font-bold mb-2">Step 2: Validate Accuracy</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Compare ML model predictions with rule-based system against government ground truth
        </p>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter pincode (e.g., 560001, 400001)"
            value={pincode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPincode(e.target.value)}
            disabled={!isTrained || isValidating}
            className="flex-1 px-4 py-2 border rounded-lg disabled:opacity-50"
          />
          <button
            onClick={handleValidate}
            disabled={!isTrained || isValidating || !pincode}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        </div>

        <button
          onClick={handleValidateAll}
          disabled={!isTrained || isValidating}
          className="w-full px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Validating All...' : 'Validate All Data Points'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Single Comparison Result */}
        {comparison && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold">
              Accuracy Comparison: {comparison.city}, {comparison.state}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left p-3">System</th>
                    <th className="text-center p-3">Predicted Doctors</th>
                    <th className="text-center p-3">Error</th>
                    <th className="text-center p-3">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-green-50 dark:bg-green-950">
                    <td className="p-3 font-medium text-green-700">✓ Government Data (Ground Truth)</td>
                    <td className="text-center p-3 font-bold text-green-700">{comparison.govt_actual_doctors}</td>
                    <td className="text-center p-3 text-green-700">0</td>
                    <td className="text-center p-3 text-green-700 font-bold">100.00%</td>
                  </tr>
                  <tr className={`border-b ${comparison.better_system === 'ML Model' ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                    <td className="p-3 font-medium">🤖 ML Model</td>
                    <td className="text-center p-3 font-semibold">{comparison.ml_predicted_doctors}</td>
                    <td className="text-center p-3">{comparison.ml_error}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded ${
                        comparison.ml_accuracy_percent >= 90 ? 'bg-green-600 text-white' :
                        comparison.ml_accuracy_percent >= 75 ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {comparison.ml_accuracy_percent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                  <tr className={comparison.better_system === 'Rule-Based' ? 'bg-purple-50 dark:bg-purple-950' : ''}>
                    <td className="p-3 font-medium">⚙️ Rule-Based System</td>
                    <td className="text-center p-3 font-semibold">{comparison.rule_based_doctors}</td>
                    <td className="text-center p-3">{comparison.rule_based_error}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded ${
                        comparison.rule_based_accuracy_percent >= 90 ? 'bg-green-600 text-white' :
                        comparison.rule_based_accuracy_percent >= 75 ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {comparison.rule_based_accuracy_percent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
              <p><strong>Winner:</strong> {comparison.better_system}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Government data shows {comparison.govt_disease_cases} total disease cases 
                requiring {comparison.govt_actual_doctors} doctors based on actual healthcare records.
              </p>
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        {overallStats && (
          <div className="mt-6 space-y-4">
            <h4 className="text-xl font-bold">Overall Validation Results</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-3xl font-bold">{overallStats.total_comparisons}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">ML Accuracy</p>
                <p className="text-3xl font-bold text-blue-600">{overallStats.avg_ml_accuracy}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Rule-Based Accuracy</p>
                <p className="text-3xl font-bold text-purple-600">{overallStats.avg_rule_based_accuracy}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Winner</p>
                <p className="text-2xl font-bold">
                  {overallStats.winner === 'ML Model' ? '🤖 ML' : 
                   overallStats.winner === 'Rule-Based System' ? '⚙️ Rule' : 
                   '🤝 Tie'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b">
                  <tr>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-center">Govt Truth</th>
                    <th className="p-2 text-center">ML Pred</th>
                    <th className="p-2 text-center">Rule Pred</th>
                    <th className="p-2 text-center">ML Acc</th>
                    <th className="p-2 text-center">Rule Acc</th>
                    <th className="p-2 text-center">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {allComparisons.map((comp, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="p-2 font-medium">{comp.city}</td>
                      <td className="p-2 text-center">{comp.govt_actual_doctors}</td>
                      <td className="p-2 text-center">{comp.ml_predicted_doctors}</td>
                      <td className="p-2 text-center">{comp.rule_based_doctors}</td>
                      <td className="p-2 text-center">
                        <span className={
                          comp.ml_accuracy_percent >= 90 ? 'text-green-600 font-semibold' :
                          comp.ml_accuracy_percent >= 75 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {comp.ml_accuracy_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={
                          comp.rule_based_accuracy_percent >= 90 ? 'text-green-600 font-semibold' :
                          comp.rule_based_accuracy_percent >= 75 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {comp.rule_based_accuracy_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {comp.better_system === 'ML Model' ? '🤖' : 
                         comp.better_system === 'Rule-Based' ? '⚙️' : '🤝'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
