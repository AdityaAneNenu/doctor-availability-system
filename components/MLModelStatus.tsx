'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface ModelMetrics {
  accuracy: number
  loss: number
  trained: boolean
  trainingTime: number
  totalSamples: number
  testAccuracy: number
}

export default function MLModelStatus() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeModel = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/mlPredict')
      const data = await response.json()
      
      console.log('ML Model Status:', data)
      
      if (data.success && data.data.modelMetrics) {
        setMetrics(data.data.modelMetrics)
        
        // Auto-train if not trained
        if (!data.data.modelMetrics.trained) {
          console.log('🔄 Auto-training ML model...')
          setLoading(false) // Stop loading before training
          await trainModel()
        } else {
          setLoading(false)
        }
      } else {
        setError(data.error || 'Failed to load model')
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch model status:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeModel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trainModel = async () => {
    try {
      setTraining(true)
      setError(null)
      
      console.log('🧠 Starting ML model training...')
      
      const response = await fetch('/api/mlPredict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather: {
            temperature: 28,
            humidity: 80,
            rainfall: 10,
            wind_speed: 12,
            uv_index: 6,
            pressure: 1013,
            dew_point: 24,
            weather_code: 61
          },
          initModel: true
        })
      })
      
      const data = await response.json()
      
      console.log('Training response:', data)
      
      if (data.success && data.data.modelMetrics) {
        setMetrics(data.data.modelMetrics)
        console.log('✅ Model trained successfully!', data.data.modelMetrics)
      } else {
        setError(data.error || 'Training failed')
      }
    } catch (error) {
      console.error('Failed to train model:', error)
      setError(error instanceof Error ? error.message : 'Training error')
    } finally {
      setTraining(false)
    }
  }

  if (loading || training) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Loader className="w-12 h-12 animate-spin text-purple-500" />
            <Brain className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {training ? 'Training ML Model...' : 'Loading ML Model...'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {training 
                ? 'Training neural network with 2000 samples over 50 epochs. This may take 30-60 seconds.' 
                : 'Checking model status...'}
            </p>
            {training && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 max-w-md mx-auto">
                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Loading TensorFlow.js...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                    <span>Generating 2000 training samples...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                    <span>Training neural network (50 epochs)...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ML Model Status
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              TensorFlow.js Neural Network
            </p>
          </div>
        </div>
        
        {metrics?.trained ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Active
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Not Trained
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Error Loading ML Model
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {metrics?.trained ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Training Accuracy */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Training Accuracy
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(metrics.accuracy * 100).toFixed(2)}%
              </div>
              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${metrics.accuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Test Accuracy */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Test Accuracy
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(metrics.testAccuracy * 100).toFixed(2)}%
              </div>
              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${metrics.testAccuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Loss */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Model Loss
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.loss.toFixed(4)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lower is better
              </div>
            </div>

            {/* Training Samples */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Training Samples
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.totalSamples.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(metrics.trainingTime / 1000).toFixed(1)}s training time
              </div>
            </div>
          </div>

          {/* Model Architecture Info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Neural Network Architecture
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Input Layer:</span>
                <span className="font-mono text-gray-900 dark:text-white">8 features (weather parameters)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hidden Layers:</span>
                <span className="font-mono text-gray-900 dark:text-white">32 → 64 → 48 → 32 neurons</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Output Layer:</span>
                <span className="font-mono text-gray-900 dark:text-white">12 diseases (sigmoid activation)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Optimizer:</span>
                <span className="font-mono text-gray-900 dark:text-white">Adam (lr=0.001)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Loss Function:</span>
                <span className="font-mono text-gray-900 dark:text-white">Binary Crossentropy</span>
              </div>
            </div>
          </div>

          {/* Retrain Button */}
          <button
            onClick={trainModel}
            disabled={training}
            className="mt-4 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {training ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Retraining Model...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Retrain Model</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ML model is not yet trained. Train the model to start making AI-powered predictions.
          </p>
          <button
            onClick={trainModel}
            disabled={training}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {training ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Training Model...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Train ML Model Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
