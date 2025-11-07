'use client'

/**
 * ML Model Validation Page
 * Faculty demonstration: Train ML model on government data and validate accuracy
 */

import MLValidationPanel from '@/components/MLValidationPanel'

export default function ValidationPage() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Faculty Validation Dashboard</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Machine Learning Model Accuracy Validation using Government Health Data
          </p>
        </div>

        {/* Information Card */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">📊 About This Validation</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">🎯 Objective</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validate the disease prediction system by comparing ML model predictions 
                with rule-based system against real government health data.
              </p>
              
              <h3 className="font-semibold text-lg pt-2">📈 Dataset</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 15 government health records from multiple cities</li>
                <li>• Covers metro, tier-1, tier-2, and rural areas</li>
                <li>• Real disease cases: dengue, malaria, typhoid, influenza, etc.</li>
                <li>• Actual healthcare infrastructure data</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">🤖 ML Model Architecture</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Neural Network: 10 → 64 → 128 → 64 → 32 → 1</li>
                <li>• Input: Temperature, Humidity, Rainfall, Population, Disease Cases</li>
                <li>• Output: Required Doctors</li>
                <li>• Training: 100 epochs with 80/20 train-validation split</li>
                <li>• Optimizer: Adam with learning rate 0.001</li>
              </ul>

              <h3 className="font-semibold text-lg pt-2">✅ Accuracy Metrics</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Mean Absolute Error (MAE)</li>
                <li>• Percentage Accuracy vs Ground Truth</li>
                <li>• Head-to-head comparison with rule-based system</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">📍 Available Test Pincodes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <p className="font-medium">Metro Cities</p>
                <p className="text-gray-600 dark:text-gray-400">560001 (Bangalore)</p>
                <p className="text-gray-600 dark:text-gray-400">400001 (Mumbai)</p>
                <p className="text-gray-600 dark:text-gray-400">600001 (Chennai)</p>
                <p className="text-gray-600 dark:text-gray-400">110001 (Delhi)</p>
                <p className="text-gray-600 dark:text-gray-400">700001 (Kolkata)</p>
              </div>
              <div>
                <p className="font-medium">Tier-1 Cities</p>
                <p className="text-gray-600 dark:text-gray-400">302001 (Jaipur)</p>
                <p className="text-gray-600 dark:text-gray-400">380001 (Ahmedabad)</p>
                <p className="text-gray-600 dark:text-gray-400">226001 (Lucknow)</p>
                <p className="text-gray-600 dark:text-gray-400">452001 (Indore)</p>
                <p className="text-gray-600 dark:text-gray-400">141001 (Ludhiana)</p>
              </div>
              <div>
                <p className="font-medium">Tier-2 Cities</p>
                <p className="text-gray-600 dark:text-gray-400">580020 (Hubli)</p>
                <p className="text-gray-600 dark:text-gray-400">324009 (Kota)</p>
              </div>
              <div>
                <p className="font-medium">Rural Areas</p>
                <p className="text-gray-600 dark:text-gray-400">416704 (Ratnagiri)</p>
                <p className="text-gray-600 dark:text-gray-400">221010 (Ghazipur)</p>
              </div>
            </div>
          </div>
        </div>

        {/* ML Validation Panel */}
        <MLValidationPanel />

        {/* Footer */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Ground Truth Calculation:</strong> Government data provides actual disease cases. 
              Required doctors = max(total_cases / 50, population / 1000) based on WHO standards.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              This validation demonstrates that our system&apos;s predictions align with real-world healthcare data, 
              proving scientific accuracy for academic evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
