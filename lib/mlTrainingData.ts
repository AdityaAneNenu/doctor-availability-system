/**
 * ML Training Data Generator
 * Generates synthetic training data based on medical research patterns
 * for disease prediction model training
 */

export interface TrainingDataPoint {
  // Input features (weather parameters)
  temperature: number
  humidity: number
  rainfall: number
  wind_speed: number
  uv_index: number
  pressure: number
  dew_point: number
  weather_code: number

  // Output labels (disease probabilities)
  dengue: number
  malaria: number
  influenza: number
  typhoid: number
  heat_stroke: number
  respiratory_infection: number
  pneumonia: number
  allergic_rhinitis: number
  asthma: number
  dehydration: number
  gastroenteritis: number
  skin_infection: number
}

/**
 * Generate synthetic training data based on medical research
 * This simulates historical data that would come from real outbreak records
 */
export function generateTrainingData(numSamples: number = 2000): TrainingDataPoint[] {
  const data: TrainingDataPoint[] = []

  for (let i = 0; i < numSamples; i++) {
    // Generate random weather parameters within realistic ranges
    const temp = Math.random() * 35 + 5 // 5-40°C
    const humidity = Math.random() * 60 + 30 // 30-90%
    const rainfall = Math.random() * 50 // 0-50mm
    const windSpeed = Math.random() * 40 // 0-40 km/h
    const uvIndex = Math.random() * 11 // 0-11
    const pressure = Math.random() * 60 + 980 // 980-1040 hPa
    const dewPoint = temp - (100 - humidity) / 5 // Calculate dew point
    const weatherCode = Math.floor(Math.random() * 100) // 0-99

    // Calculate disease probabilities based on medical research patterns
    const dengue = calculateDengueRisk(temp, humidity, rainfall, windSpeed)
    const malaria = calculateMalariaRisk(temp, humidity, rainfall, windSpeed)
    const influenza = calculateInfluenzaRisk(temp, humidity, uvIndex)
    const typhoid = calculateTyphoidRisk(temp, rainfall, humidity)
    const heatStroke = calculateHeatStrokeRisk(temp, uvIndex, windSpeed)
    const respiratoryInfection = calculateRespiratoryRisk(temp, humidity, windSpeed)
    const pneumonia = calculatePneumoniaRisk(temp, humidity, pressure)
    const allergicRhinitis = calculateAllergicRhinitisRisk(temp, windSpeed, humidity)
    const asthma = calculateAsthmaRisk(pressure, humidity, temp)
    const dehydration = calculateDehydrationRisk(temp, uvIndex, humidity)
    const gastroenteritis = calculateGastroenteritisRisk(temp, humidity)
    const skinInfection = calculateSkinInfectionRisk(temp, humidity)

    data.push({
      temperature: temp,
      humidity: humidity,
      rainfall: rainfall,
      wind_speed: windSpeed,
      uv_index: uvIndex,
      pressure: pressure,
      dew_point: dewPoint,
      weather_code: weatherCode,
      dengue: dengue / 100,
      malaria: malaria / 100,
      influenza: influenza / 100,
      typhoid: typhoid / 100,
      heat_stroke: heatStroke / 100,
      respiratory_infection: respiratoryInfection / 100,
      pneumonia: pneumonia / 100,
      allergic_rhinitis: allergicRhinitis / 100,
      asthma: asthma / 100,
      dehydration: dehydration / 100,
      gastroenteritis: gastroenteritis / 100,
      skin_infection: skinInfection / 100
    })
  }

  return data
}

// Disease risk calculation functions based on medical research

function calculateDengueRisk(temp: number, humidity: number, rainfall: number, windSpeed: number): number {
  let risk = 0
  if (temp >= 25 && temp <= 30) risk += 35
  else if (temp >= 20 && temp < 35) risk += 15
  if (humidity > 80) risk += 30
  else if (humidity > 60) risk += 15
  if (rainfall > 5 && rainfall < 20) risk += 25
  else if (rainfall >= 20) risk += 10
  if (windSpeed < 15) risk += 10
  if (temp >= 25 && temp <= 30 && humidity > 80 && rainfall > 5) risk += 15
  return Math.min(risk + (Math.random() * 10 - 5), 100) // Add noise
}

function calculateMalariaRisk(temp: number, humidity: number, rainfall: number, windSpeed: number): number {
  let risk = 0
  if (temp >= 20 && temp <= 30) risk += 30
  if (humidity > 70) risk += 25
  if (rainfall > 10) risk += 30
  if (windSpeed < 15) risk += 15
  if (temp >= 20 && temp <= 30 && humidity > 70 && rainfall > 10) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateInfluenzaRisk(temp: number, humidity: number, uvIndex: number): number {
  let risk = 0
  if (temp < 15) risk += 35
  else if (temp < 20) risk += 20
  if (humidity < 50) risk += 30
  else if (humidity < 60) risk += 15
  if (uvIndex < 3) risk += 20
  if (temp < 15 && humidity < 50) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateTyphoidRisk(temp: number, rainfall: number, humidity: number): number {
  let risk = 0
  if (temp > 25) risk += 25
  if (rainfall > 20) risk += 35
  if (humidity > 70) risk += 20
  if (temp > 25 && rainfall > 20) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateHeatStrokeRisk(temp: number, uvIndex: number, windSpeed: number): number {
  let risk = 0
  if (temp > 35) risk += 40
  else if (temp > 30) risk += 20
  if (uvIndex > 8) risk += 30
  else if (uvIndex > 6) risk += 15
  if (windSpeed < 10) risk += 15
  if (temp > 35 && uvIndex > 8) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateRespiratoryRisk(temp: number, humidity: number, windSpeed: number): number {
  let risk = 0
  if (temp >= 10 && temp <= 20) risk += 25
  if (humidity >= 40 && humidity <= 70) risk += 25
  if (windSpeed > 20) risk += 25
  if (temp >= 10 && temp <= 20 && humidity >= 40 && humidity <= 70) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculatePneumoniaRisk(temp: number, humidity: number, pressure: number): number {
  let risk = 0
  if (temp < 15) risk += 30
  if (humidity > 60) risk += 25
  if (pressure < 1000) risk += 20
  if (temp < 15 && humidity > 60) risk += 25
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateAllergicRhinitisRisk(temp: number, windSpeed: number, humidity: number): number {
  let risk = 0
  if (temp >= 15 && temp <= 25) risk += 30
  if (windSpeed > 20) risk += 35
  if (humidity >= 40 && humidity <= 60) risk += 20
  if (temp >= 15 && temp <= 25 && windSpeed > 20) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateAsthmaRisk(pressure: number, humidity: number, temp: number): number {
  let risk = 0
  if (pressure < 1000 || pressure > 1020) risk += 30
  if (humidity < 30 || humidity > 80) risk += 30
  if (temp < 10 || temp > 30) risk += 25
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateDehydrationRisk(temp: number, uvIndex: number, humidity: number): number {
  let risk = 0
  if (temp > 30) risk += 35
  if (uvIndex > 7) risk += 30
  if (humidity < 40) risk += 20
  if (temp > 30 && uvIndex > 7) risk += 20
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateGastroenteritisRisk(temp: number, humidity: number): number {
  let risk = 0
  if (temp > 28) risk += 35
  if (humidity > 75) risk += 30
  if (temp > 28 && humidity > 75) risk += 25
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

function calculateSkinInfectionRisk(temp: number, humidity: number): number {
  let risk = 0
  if (temp > 25) risk += 30
  if (humidity > 80) risk += 35
  if (temp > 25 && humidity > 80) risk += 25
  return Math.min(risk + (Math.random() * 10 - 5), 100)
}

/**
 * Split data into training and testing sets
 */
export function splitData(data: TrainingDataPoint[], testRatio: number = 0.2) {
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  const splitIndex = Math.floor(shuffled.length * (1 - testRatio))
  
  return {
    training: shuffled.slice(0, splitIndex),
    testing: shuffled.slice(splitIndex)
  }
}
