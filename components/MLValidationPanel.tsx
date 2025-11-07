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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Step 1: Train ML Model</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Train a neural network on 15 government health records to predict doctor requirements
        </p>
        
        <button
          onClick={handleTrain}
          disabled={isTraining || isTrained}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isTrained
              ? 'bg-green-600 text-white cursor-default'
              : isTraining
              ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
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
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{trainingMetrics.accuracy}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Training Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trainingMetrics.training_time}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trainingMetrics.data_points}</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Step 2: Validate Accuracy</h3>
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
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            onClick={handleValidate}
            disabled={!isTrained || isValidating || !pincode}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        </div>

        <button
          onClick={handleValidateAll}
          disabled={!isTrained || isValidating}
          className="w-full px-6 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isValidating ? 'Validating All...' : 'Validate All Data Points'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Single Comparison Result */}
        {comparison && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accuracy Comparison: {comparison.city}, {comparison.state}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left p-3 text-gray-900 dark:text-white">System</th>
                    <th className="text-center p-3 text-gray-900 dark:text-white">Predicted Doctors</th>
                    <th className="text-center p-3 text-gray-900 dark:text-white">Error</th>
                    <th className="text-center p-3 text-gray-900 dark:text-white">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-950/20">
                    <td className="p-3 font-medium text-green-700 dark:text-green-400">✓ Government Data (Ground Truth)</td>
                    <td className="text-center p-3 font-bold text-green-700 dark:text-green-400">{comparison.govt_actual_doctors}</td>
                    <td className="text-center p-3 text-green-700 dark:text-green-400">0</td>
                    <td className="text-center p-3 text-green-700 dark:text-green-400 font-bold">100.00%</td>
                  </tr>
                  <tr className={`border-b border-gray-200 dark:border-gray-700 ${comparison.better_system === 'ML Model' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">🤖 ML Model</td>
                    <td className="text-center p-3 font-semibold text-gray-900 dark:text-white">{comparison.ml_predicted_doctors}</td>
                    <td className="text-center p-3 text-gray-700 dark:text-gray-300">{comparison.ml_error}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded font-semibold ${
                        comparison.ml_accuracy_percent >= 90 ? 'bg-green-600 text-white' :
                        comparison.ml_accuracy_percent >= 75 ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {comparison.ml_accuracy_percent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                  <tr className={`border-b border-gray-200 dark:border-gray-700 ${comparison.better_system === 'Rule-Based' ? 'bg-purple-50 dark:bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">⚙️ Rule-Based System</td>
                    <td className="text-center p-3 font-semibold text-gray-900 dark:text-white">{comparison.rule_based_doctors}</td>
                    <td className="text-center p-3 text-gray-700 dark:text-gray-300">{comparison.rule_based_error}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded font-semibold ${
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

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white"><strong>Winner:</strong> <span className="text-blue-600 dark:text-blue-400">{comparison.better_system}</span></p>
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
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Overall Validation Results</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.total_comparisons}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">ML Accuracy</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallStats.avg_ml_accuracy}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rule-Based Accuracy</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{overallStats.avg_rule_based_accuracy}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Winner</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.winner === 'ML Model' ? '🤖 ML' : 
                   overallStats.winner === 'Rule-Based System' ? '⚙️ Rule' : 
                   '🤝 Tie'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-2 text-left text-gray-900 dark:text-white">Location</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">Govt Truth</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">ML Pred</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">Rule Pred</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">ML Acc</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">Rule Acc</th>
                    <th className="p-2 text-center text-gray-900 dark:text-white">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {allComparisons.map((comp, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2 font-medium text-gray-900 dark:text-white">{comp.city}</td>
                      <td className="p-2 text-center text-gray-900 dark:text-white">{comp.govt_actual_doctors}</td>
                      <td className="p-2 text-center text-gray-900 dark:text-white">{comp.ml_predicted_doctors}</td>
                      <td className="p-2 text-center text-gray-900 dark:text-white">{comp.rule_based_doctors}</td>
                      <td className="p-2 text-center">
                        <span className={
                          comp.ml_accuracy_percent >= 90 ? 'text-green-600 dark:text-green-400 font-semibold' :
                          comp.ml_accuracy_percent >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }>
                          {comp.ml_accuracy_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={
                          comp.rule_based_accuracy_percent >= 90 ? 'text-green-600 dark:text-green-400 font-semibold' :
                          comp.rule_based_accuracy_percent >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
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
