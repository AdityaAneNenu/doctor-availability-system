/**
 * API Route: ML-Based Disease Prediction
 * Endpoint: /api/mlPredict
 * Method: POST
 * 
 * This endpoint uses TensorFlow.js neural network for disease prediction
 */

import { NextRequest, NextResponse } from 'next/server'
import { predictWithML, initializeMLModel, getMLModel } from '@/lib/mlModel'
import type { WeatherInput, DiseasePrediction, ModelMetrics } from '@/lib/mlModel'

interface MLPredictRequest {
  weather: WeatherInput
  initModel?: boolean // Set to true to train model before prediction
}

interface MLPredictResponse {
  success: boolean
  data?: {
    predictions: DiseasePrediction[]
    modelMetrics: ModelMetrics
    method: 'ML' | 'Rule-Based'
  }
  error?: string
  message: string
}

/**
 * POST handler - Predict diseases using ML model
 */
export async function POST(request: NextRequest) {
  try {
    const body: MLPredictRequest = await request.json()
    const { weather, initModel = false } = body

    if (!weather) {
      return NextResponse.json<MLPredictResponse>({
        success: false,
        error: 'Weather data is required',
        message: 'Please provide weather parameters'
      }, { status: 400 })
    }

    console.log('🧠 ML Prediction requested for weather:', weather)

    // Initialize model if requested or not trained
    const model = getMLModel()
    if (initModel || !model.isTrained()) {
      console.log('🔄 Training ML model...')
      await initializeMLModel(2000, 50) // 2000 samples, 50 epochs
    }

    // Make predictions
    const predictions = await predictWithML(weather)
    const metrics = model.getMetrics()

    console.log(`✅ ML Predictions generated: ${predictions.length} diseases`)

    return NextResponse.json<MLPredictResponse>({
      success: true,
      data: {
        predictions,
        modelMetrics: metrics,
        method: 'ML'
      },
      message: `Successfully predicted ${predictions.length} diseases using ML model`
    })

  } catch (error) {
    console.error('❌ Error in ML prediction:', error)
    
    return NextResponse.json<MLPredictResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to generate ML predictions'
    }, { status: 500 })
  }
}

/**
 * GET handler - Get ML model status and metrics
 */
export async function GET() {
  try {
    const model = getMLModel()
    const metrics = model.getMetrics()

    return NextResponse.json<MLPredictResponse>({
      success: true,
      data: {
        predictions: [],
        modelMetrics: metrics,
        method: metrics.trained ? 'ML' : 'Rule-Based'
      },
      message: metrics.trained 
        ? `ML model is trained with ${(metrics.accuracy * 100).toFixed(2)}% accuracy`
        : 'ML model not yet trained'
    })

  } catch (error) {
    console.error('❌ Error fetching model status:', error)
    
    return NextResponse.json<MLPredictResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch model status'
    }, { status: 500 })
  }
}
