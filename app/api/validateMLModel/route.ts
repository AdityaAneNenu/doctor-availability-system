/**
 * API Route: ML Model Validation
 * Trains ML model on government data and validates accuracy
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGovtMLModel, type AccuracyComparison } from '@/lib/govtDataMLModel'
import { GOVT_HEALTH_DATASET, getGovtDataByPincode } from '@/lib/govtHealthDataset'
import { analyzeDiseaseByPinCode } from '@/lib/pinCodeDiseaseAnalysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, pincode, month } = body

    if (action === 'train') {
      // Train the ML model
      console.log('🎓 Training ML model on government health data...')
      
      const model = getGovtMLModel()
      const result = await model.train()

      return NextResponse.json({
        success: result.success,
        message: result.message,
        training_metrics: {
          epochs: result.epochs_trained,
          loss: result.final_loss.toFixed(4),
          mae: result.final_mae.toFixed(4),
          accuracy: `${result.model_accuracy_percent.toFixed(2)}%`,
          training_time: `${result.training_time_seconds.toFixed(2)}s`,
          data_points: result.data_points_used
        }
      })
    }

    if (action === 'validate') {
      // Validate model accuracy for a specific pincode
      if (!pincode) {
        return NextResponse.json(
          { success: false, message: 'Pincode is required for validation' },
          { status: 400 }
        )
      }

      const model = getGovtMLModel()
      
      if (!model.isModelTrained()) {
        return NextResponse.json(
          { success: false, message: 'Model not trained. Please train the model first.' },
          { status: 400 }
        )
      }

      // Get government data for this pincode
      const govtData = getGovtDataByPincode(pincode, month)
      if (!govtData) {
        return NextResponse.json(
          { 
            success: false, 
            message: `No government data found for pincode ${pincode}. Available pincodes: ${GOVT_HEALTH_DATASET.map(r => r.pincode).filter(Boolean).join(', ')}` 
          },
          { status: 404 }
        )
      }

      // Get rule-based system prediction
      console.log(`🔍 Analyzing pincode ${pincode} with rule-based system...`)
      const ruleBasedResult = await analyzeDiseaseByPinCode(pincode)
      
      if (!ruleBasedResult || !ruleBasedResult.diseases) {
        return NextResponse.json(
          { success: false, message: `Rule-based analysis failed for pincode ${pincode}` },
          { status: 400 }
        )
      }

      const totalRuleBasedDoctors = ruleBasedResult.diseases.reduce(
        (sum, disease) => sum + disease.required_doctors,
        0
      )

      // Compare accuracy
      console.log(`📊 Comparing ML vs Rule-Based predictions...`)
      const comparison = await model.compareAccuracy(govtData, totalRuleBasedDoctors)

      return NextResponse.json({
        success: true,
        comparison,
        location: {
          city: govtData.district,
          state: govtData.state,
          pincode: govtData.pincode
        },
        weather: {
          temperature: govtData.temperature_avg,
          humidity: govtData.humidity_avg,
          rainfall: govtData.rainfall_mm,
          month: govtData.month
        }
      })
    }

    if (action === 'validate-all') {
      // Validate model accuracy across all government data points
      const model = getGovtMLModel()
      
      if (!model.isModelTrained()) {
        return NextResponse.json(
          { success: false, message: 'Model not trained. Please train the model first.' },
          { status: 400 }
        )
      }

      console.log(`🔍 Validating model accuracy across ${GOVT_HEALTH_DATASET.length} data points...`)
      
      const comparisons: AccuracyComparison[] = []
      
      for (const govtData of GOVT_HEALTH_DATASET) {
        // Get rule-based prediction
        const pincode = govtData.pincode || `${govtData.district}_${govtData.state}`
        const ruleBasedResult = await analyzeDiseaseByPinCode(pincode)
        
        const totalRuleBasedDoctors = ruleBasedResult && ruleBasedResult.diseases
          ? ruleBasedResult.diseases.reduce((sum, disease) => sum + disease.required_doctors, 0)
          : govtData.population_thousands // Fallback

        // Compare
        const comparison = await model.compareAccuracy(govtData, totalRuleBasedDoctors)
        comparisons.push(comparison)
      }

      // Calculate overall statistics
      const avgMLAccuracy = comparisons.reduce((sum, c) => sum + c.ml_accuracy_percent, 0) / comparisons.length
      const avgRuleBasedAccuracy = comparisons.reduce((sum, c) => sum + c.rule_based_accuracy_percent, 0) / comparisons.length
      
      const mlWins = comparisons.filter(c => c.better_system === 'ML Model').length
      const ruleBasedWins = comparisons.filter(c => c.better_system === 'Rule-Based').length
      const ties = comparisons.filter(c => c.better_system === 'Tie').length

      return NextResponse.json({
        success: true,
        overall_statistics: {
          total_comparisons: comparisons.length,
          avg_ml_accuracy: `${avgMLAccuracy.toFixed(2)}%`,
          avg_rule_based_accuracy: `${avgRuleBasedAccuracy.toFixed(2)}%`,
          ml_wins: mlWins,
          rule_based_wins: ruleBasedWins,
          ties: ties,
          winner: avgMLAccuracy > avgRuleBasedAccuracy ? 'ML Model' : 
                 avgRuleBasedAccuracy > avgMLAccuracy ? 'Rule-Based System' : 'Tie'
        },
        detailed_comparisons: comparisons,
        summary: `ML Model: ${avgMLAccuracy.toFixed(1)}% accurate | Rule-Based: ${avgRuleBasedAccuracy.toFixed(1)}% accurate`
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Use "train", "validate", or "validate-all"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ ML Validation API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

// GET: Get model status
export async function GET() {
  try {
    const model = getGovtMLModel()
    const isTrained = model.isModelTrained()

    return NextResponse.json({
      success: true,
      model_trained: isTrained,
      dataset_size: GOVT_HEALTH_DATASET.length,
      available_pincodes: GOVT_HEALTH_DATASET.map(r => ({
        pincode: r.pincode,
        city: r.district,
        state: r.state
      })),
      message: isTrained 
        ? 'Model is trained and ready for validation' 
        : 'Model not trained. Send POST request with action="train" to train the model.'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
