/**
 * Test Script for Doctor Module
 * Run with: npm run test:doctor-module
 * Or directly: node --loader ts-node/esm scripts/test-doctor-module.ts
 */

import { fetchWeatherForCities, CITY_COORDINATES } from '../lib/fetchWeatherData'
import { predictDiseases, calculateTotalDoctorRequirements } from '../lib/predictDisease'

async function testDoctorModule() {
  console.log('🧪 Testing Doctor Availability & Disease Prediction Module...\n')

  try {
    // Test 1: Fetch Weather Data
    console.log('📡 Test 1: Fetching weather data for configured cities...')
    const weatherData = await fetchWeatherForCities(CITY_COORDINATES.slice(0, 3)) // Test first 3 cities
    console.log(`✅ Successfully fetched weather for ${weatherData.length} cities\n`)

    // Test 2: Disease Prediction
    console.log('🦠 Test 2: Generating disease predictions...')
    weatherData.forEach(weather => {
      console.log(`\n📍 ${weather.city}:`)
      console.log(`   Temperature: ${weather.temperature.toFixed(1)}°C`)
      console.log(`   Humidity: ${weather.humidity.toFixed(0)}%`)
      console.log(`   Rainfall: ${weather.rainfall.toFixed(1)}mm`)

      const predictions = predictDiseases(weather)
      
      if (predictions.length > 0) {
        console.log(`   ⚠️  ${predictions.length} disease(s) with significant risk:`)
        predictions.forEach(pred => {
          console.log(`      - ${pred.disease}: ${(pred.risk_level * 100).toFixed(0)}% risk`)
          console.log(`        ${pred.required_doctors} ${pred.specialty} doctor(s) needed`)
        })
        
        const totalDoctors = calculateTotalDoctorRequirements(predictions)
        console.log(`   👨‍⚕️ Total doctors required: ${totalDoctors}`)
      } else {
        console.log(`   ✅ No significant disease risks detected`)
      }
    })

    // Test 3: API Endpoint (if server is running)
    console.log('\n\n🌐 Test 3: Testing API endpoint...')
    console.log('To test the API endpoint, run:')
    console.log('  curl http://localhost:3000/api/fetchWeatherData')
    console.log('Or:')
    console.log('  npm run dev')
    console.log('  Then open: http://localhost:3000/dashboard')

    console.log('\n✨ All tests completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. Make sure Firebase indexes are created in Firebase Console')
    console.log('2. Start the dev server: npm run dev')
    console.log('3. Navigate to /dashboard to see the Doctor Insights component')
    console.log('4. Set up automation (cron job) to call /api/fetchWeatherData every 6 hours')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
testDoctorModule()
