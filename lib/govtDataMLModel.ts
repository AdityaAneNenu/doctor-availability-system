/**
 * Government Health Data ML Model
 * Trains a neural network on real government health data
 * Compares predictions with rule-based system for accuracy validation
 */

import * as tf from '@tensorflow/tfjs'
import type { GovtHealthRecord } from './govtHealthDataset'
import { GOVT_HEALTH_DATASET, calculateDoctorRequirementFromGovtData } from './govtHealthDataset'

export interface MLModelPrediction {
  predicted_doctors: number
  confidence: number
}

export interface AccuracyComparison {
  pincode: string
  city: string
  state: string
  
  // Weather conditions
  temperature: number
  humidity: number
  rainfall: number
  
  // Government data (ground truth)
  govt_actual_doctors: number
  govt_disease_cases: number
  
  // ML Model prediction
  ml_predicted_doctors: number
  ml_confidence: number
  
  // Rule-based system prediction
  rule_based_doctors: number
  
  // Accuracy metrics
  ml_accuracy_percent: number
  rule_based_accuracy_percent: number
  ml_error: number
  rule_based_error: number
  
  // Winner
  better_system: 'ML Model' | 'Rule-Based' | 'Tie'
}

export interface ModelTrainingResult {
  success: boolean
  epochs_trained: number
  final_loss: number
  final_mae: number
  training_time_seconds: number
  data_points_used: number
  model_accuracy_percent: number
  message: string
}

/**
 * Government Health Data ML Model Class
 */
export class GovtHealthMLModel {
  private model: tf.LayersModel | null = null
  private inputMean: tf.Tensor | null = null
  private inputStd: tf.Tensor | null = null
  private outputMean: number = 0
  private outputStd: number = 1
  private isTrained: boolean = false

  /**
   * Build the neural network architecture
   */
  private buildModel(): tf.LayersModel {
    const model = tf.sequential()

    // Input layer: 10 features
    model.add(tf.layers.dense({
      inputShape: [10],
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }))

    // Hidden layer 1
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }))

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.2 }))

    // Hidden layer 2
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }))

    // Hidden layer 3
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }))

    // Output layer: predicts number of doctors required
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear' // Regression output
    }))

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  /**
   * Prepare training data from government dataset
   */
  private prepareTrainingData(): {
    X: tf.Tensor2D
    y: tf.Tensor2D
    records: GovtHealthRecord[]
  } {
    const records = GOVT_HEALTH_DATASET

    // Extract features
    const features: number[][] = []
    const labels: number[] = []

    for (const record of records) {
      // Input features (10 features)
      features.push([
        record.temperature_avg,
        record.humidity_avg,
        record.rainfall_mm,
        record.month,
        record.population_thousands,
        record.dengue_cases,
        record.malaria_cases,
        record.typhoid_cases,
        record.influenza_cases,
        record.respiratory_infections + record.gastroenteritis_cases
      ])

      // Output label: actual doctors required based on government data
      labels.push(calculateDoctorRequirementFromGovtData(record))
    }

    // Convert to tensors
    const X = tf.tensor2d(features)
    const y = tf.tensor2d(labels, [labels.length, 1])

    return { X, y, records }
  }

  /**
   * Normalize data for better training
   */
  private normalizeData(X: tf.Tensor2D, y: tf.Tensor2D): {
    X_normalized: tf.Tensor2D
    y_normalized: tf.Tensor2D
  } {
    // Normalize inputs (Z-score normalization)
    const { mean: inputMean, variance: inputVariance } = tf.moments(X, 0)
    const inputStd = tf.sqrt(inputVariance)
    
    this.inputMean = inputMean
    this.inputStd = inputStd

    const X_normalized = X.sub(inputMean).div(inputStd.add(1e-7)) as tf.Tensor2D

    // Normalize outputs
    const yArray = Array.from(y.dataSync())
    this.outputMean = yArray.reduce((a, b) => a + b) / yArray.length
    this.outputStd = Math.sqrt(
      yArray.reduce((sum, val) => sum + Math.pow(val - this.outputMean, 2), 0) / yArray.length
    )

    const y_normalized = y.sub(this.outputMean).div(this.outputStd + 1e-7) as tf.Tensor2D

    return { X_normalized, y_normalized }
  }

  /**
   * Train the ML model on government health data
   */
  async train(): Promise<ModelTrainingResult> {
    const startTime = Date.now()

    try {
      console.log('🚀 Starting ML Model Training on Government Health Data...')

      // Prepare data
      const { X, y, records } = this.prepareTrainingData()
      console.log(`📊 Training with ${records.length} government data records`)

      // Normalize data
      const { X_normalized, y_normalized } = this.normalizeData(X, y)

      // Build model
      this.model = this.buildModel()
      console.log('✅ Model architecture built')

      // Train model
      const epochs = 100
      const batchSize = 8
      const validationSplit = 0.2

      console.log(`🎯 Training for ${epochs} epochs...`)

      const history = await this.model.fit(X_normalized, y_normalized, {
        epochs,
        batchSize,
        validationSplit,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(
                `Epoch ${epoch + 1}/${epochs} - Loss: ${logs?.loss.toFixed(4)} - MAE: ${logs?.mae.toFixed(4)}`
              )
            }
          }
        }
      })

      // Get final metrics
      const finalLoss = history.history.loss[history.history.loss.length - 1] as number
      const finalMAE = history.history.mae[history.history.mae.length - 1] as number

      // Calculate accuracy (100% - percentage error)
      const avgActual = this.outputMean
      const accuracy = Math.max(0, 100 - (finalMAE / avgActual) * 100)

      const trainingTime = (Date.now() - startTime) / 1000

      this.isTrained = true

      // Cleanup tensors
      X.dispose()
      y.dispose()
      X_normalized.dispose()
      y_normalized.dispose()

      console.log('✅ Model training completed successfully!')
      console.log(`📈 Final Loss: ${finalLoss.toFixed(4)}`)
      console.log(`📉 Final MAE: ${finalMAE.toFixed(4)}`)
      console.log(`🎯 Model Accuracy: ${accuracy.toFixed(2)}%`)
      console.log(`⏱️ Training Time: ${trainingTime.toFixed(2)} seconds`)

      return {
        success: true,
        epochs_trained: epochs,
        final_loss: finalLoss,
        final_mae: finalMAE,
        training_time_seconds: trainingTime,
        data_points_used: records.length,
        model_accuracy_percent: accuracy,
        message: `Model trained successfully on ${records.length} government health records with ${accuracy.toFixed(2)}% accuracy`
      }
    } catch (error) {
      console.error('❌ Error during model training:', error)
      return {
        success: false,
        epochs_trained: 0,
        final_loss: 0,
        final_mae: 0,
        training_time_seconds: 0,
        data_points_used: 0,
        model_accuracy_percent: 0,
        message: `Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Predict doctor requirements using ML model
   */
  async predict(input: {
    temperature: number
    humidity: number
    rainfall: number
    month: number
    population_thousands: number
    dengue_cases: number
    malaria_cases: number
    typhoid_cases: number
    influenza_cases: number
    other_cases: number
  }): Promise<MLModelPrediction> {
    if (!this.isTrained || !this.model || !this.inputMean || !this.inputStd) {
      throw new Error('Model not trained. Please train the model first.')
    }

    return tf.tidy(() => {
      // Prepare input features
      const inputArray = [
        input.temperature,
        input.humidity,
        input.rainfall,
        input.month,
        input.population_thousands,
        input.dengue_cases,
        input.malaria_cases,
        input.typhoid_cases,
        input.influenza_cases,
        input.other_cases
      ]

      // Convert to tensor and normalize
      const X = tf.tensor2d([inputArray])
      const X_normalized = X.sub(this.inputMean!).div(this.inputStd!.add(1e-7))

      // Predict
      const prediction_normalized = this.model!.predict(X_normalized) as tf.Tensor
      const prediction = prediction_normalized.mul(this.outputStd).add(this.outputMean)

      const predicted_value = Math.max(0, Math.round(prediction.dataSync()[0]))
      
      // Calculate confidence (inverse of normalized prediction std)
      const confidence = Math.min(0.95, Math.max(0.6, 1 - Math.abs(prediction_normalized.dataSync()[0]) * 0.1))

      return {
        predicted_doctors: predicted_value,
        confidence: confidence
      }
    })
  }

  /**
   * Compare ML model predictions with rule-based system
   */
  async compareAccuracy(
    govtRecord: GovtHealthRecord,
    ruleBasedDoctors: number
  ): Promise<AccuracyComparison> {
    // Get ground truth from government data
    const actualDoctors = calculateDoctorRequirementFromGovtData(govtRecord)

    // Get ML prediction
    const mlPrediction = await this.predict({
      temperature: govtRecord.temperature_avg,
      humidity: govtRecord.humidity_avg,
      rainfall: govtRecord.rainfall_mm,
      month: govtRecord.month,
      population_thousands: govtRecord.population_thousands,
      dengue_cases: govtRecord.dengue_cases,
      malaria_cases: govtRecord.malaria_cases,
      typhoid_cases: govtRecord.typhoid_cases,
      influenza_cases: govtRecord.influenza_cases,
      other_cases: govtRecord.respiratory_infections + govtRecord.gastroenteritis_cases
    })

    // Calculate errors
    const mlError = Math.abs(mlPrediction.predicted_doctors - actualDoctors)
    const ruleBasedError = Math.abs(ruleBasedDoctors - actualDoctors)

    // Calculate accuracies (percentage)
    const mlAccuracy = Math.max(0, 100 - (mlError / actualDoctors) * 100)
    const ruleBasedAccuracy = Math.max(0, 100 - (ruleBasedError / actualDoctors) * 100)

    // Determine winner
    let betterSystem: 'ML Model' | 'Rule-Based' | 'Tie'
    if (Math.abs(mlAccuracy - ruleBasedAccuracy) < 2) {
      betterSystem = 'Tie'
    } else if (mlAccuracy > ruleBasedAccuracy) {
      betterSystem = 'ML Model'
    } else {
      betterSystem = 'Rule-Based'
    }

    const totalCases = govtRecord.dengue_cases + govtRecord.malaria_cases +
                       govtRecord.typhoid_cases + govtRecord.influenza_cases +
                       govtRecord.respiratory_infections + govtRecord.gastroenteritis_cases

    return {
      pincode: govtRecord.pincode || 'N/A',
      city: govtRecord.district,
      state: govtRecord.state,
      temperature: govtRecord.temperature_avg,
      humidity: govtRecord.humidity_avg,
      rainfall: govtRecord.rainfall_mm,
      govt_actual_doctors: actualDoctors,
      govt_disease_cases: totalCases,
      ml_predicted_doctors: mlPrediction.predicted_doctors,
      ml_confidence: mlPrediction.confidence,
      rule_based_doctors: ruleBasedDoctors,
      ml_accuracy_percent: mlAccuracy,
      rule_based_accuracy_percent: ruleBasedAccuracy,
      ml_error: mlError,
      rule_based_error: ruleBasedError,
      better_system: betterSystem
    }
  }

  /**
   * Check if model is trained
   */
  isModelTrained(): boolean {
    return this.isTrained
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
    }
    if (this.inputMean) {
      this.inputMean.dispose()
    }
    if (this.inputStd) {
      this.inputStd.dispose()
    }
    this.isTrained = false
  }
}

// Singleton instance
let modelInstance: GovtHealthMLModel | null = null

/**
 * Get the global ML model instance
 */
export function getGovtMLModel(): GovtHealthMLModel {
  if (!modelInstance) {
    modelInstance = new GovtHealthMLModel()
  }
  return modelInstance
}

/**
 * Train the model (one-time setup)
 */
export async function trainGovtMLModel(): Promise<ModelTrainingResult> {
  const model = getGovtMLModel()
  return await model.train()
}

/**
 * Predict using trained model
 */
export async function predictWithGovtML(
  input: Parameters<GovtHealthMLModel['predict']>[0]
): Promise<MLModelPrediction> {
  const model = getGovtMLModel()
  
  if (!model.isModelTrained()) {
    throw new Error('Model not trained. Train the model first using trainGovtMLModel()')
  }
  
  return await model.predict(input)
}
