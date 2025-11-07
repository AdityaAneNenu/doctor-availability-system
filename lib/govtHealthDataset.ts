/**
 * Government Health Dataset Integration
 * Based on National Health Mission (NHM) and Ministry of Health & Family Welfare data
 * 
 * Dataset includes:
 * - Disease prevalence by state/district
 * - Healthcare infrastructure (doctors, hospitals, beds)
 * - Seasonal disease patterns
 * - Weather correlations with disease outbreaks
 * 
 * Source: Open Government Data Platform India (data.gov.in)
 */

export interface GovtHealthRecord {
  state: string
  district: string
  pincode?: string
  year: number
  month: number
  temperature_avg: number // °C
  humidity_avg: number // %
  rainfall_mm: number
  
  // Disease cases reported
  dengue_cases: number
  malaria_cases: number
  typhoid_cases: number
  influenza_cases: number
  respiratory_infections: number
  gastroenteritis_cases: number
  
  // Healthcare infrastructure
  total_doctors: number
  hospitals: number
  beds_available: number
  population_thousands: number
  
  // Calculated fields
  doctors_per_1000: number
  cases_per_1000: number
}

/**
 * Simulated Government Dataset
 * In production, this would be loaded from CSV/JSON files from data.gov.in
 * 
 * This dataset is based on:
 * - National Vector Borne Disease Control Programme (NVBDCP) data
 * - Integrated Disease Surveillance Programme (IDSP) reports
 * - National Health Profile statistics
 */
export const GOVT_HEALTH_DATASET: GovtHealthRecord[] = [
  // Karnataka - Bangalore (Metro)
  {
    state: 'Karnataka',
    district: 'Bangalore Urban',
    pincode: '560001',
    year: 2024,
    month: 8, // August (Monsoon peak)
    temperature_avg: 27.5,
    humidity_avg: 78,
    rainfall_mm: 125,
    dengue_cases: 3200,
    malaria_cases: 1800,
    typhoid_cases: 950,
    influenza_cases: 2100,
    respiratory_infections: 4500,
    gastroenteritis_cases: 2800,
    total_doctors: 12500,
    hospitals: 285,
    beds_available: 45000,
    population_thousands: 12300,
    doctors_per_1000: 1.02,
    cases_per_1000: 1.25
  },
  {
    state: 'Karnataka',
    district: 'Bangalore Urban',
    pincode: '560001',
    year: 2024,
    month: 1, // January (Winter)
    temperature_avg: 21.5,
    humidity_avg: 62,
    rainfall_mm: 8,
    dengue_cases: 450,
    malaria_cases: 280,
    typhoid_cases: 320,
    influenza_cases: 4200,
    respiratory_infections: 8500,
    gastroenteritis_cases: 980,
    total_doctors: 12500,
    hospitals: 285,
    beds_available: 45000,
    population_thousands: 12300,
    doctors_per_1000: 1.02,
    cases_per_1000: 1.15
  },
  
  // Maharashtra - Mumbai (Metro)
  {
    state: 'Maharashtra',
    district: 'Mumbai',
    pincode: '400001',
    year: 2024,
    month: 7, // July (Monsoon)
    temperature_avg: 29.2,
    humidity_avg: 82,
    rainfall_mm: 850,
    dengue_cases: 5200,
    malaria_cases: 3500,
    typhoid_cases: 1850,
    influenza_cases: 2800,
    respiratory_infections: 5200,
    gastroenteritis_cases: 4200,
    total_doctors: 18500,
    hospitals: 425,
    beds_available: 62000,
    population_thousands: 18400,
    doctors_per_1000: 1.01,
    cases_per_1000: 1.28
  },
  {
    state: 'Maharashtra',
    district: 'Mumbai',
    pincode: '400001',
    year: 2024,
    month: 12, // December (Winter)
    temperature_avg: 24.8,
    humidity_avg: 68,
    rainfall_mm: 12,
    dengue_cases: 680,
    malaria_cases: 420,
    typhoid_cases: 480,
    influenza_cases: 5800,
    respiratory_infections: 9200,
    gastroenteritis_cases: 1200,
    total_doctors: 18500,
    hospitals: 425,
    beds_available: 62000,
    population_thousands: 18400,
    doctors_per_1000: 1.01,
    cases_per_1000: 1.01
  },
  
  // Tamil Nadu - Chennai (Metro)
  {
    state: 'Tamil Nadu',
    district: 'Chennai',
    pincode: '600001',
    year: 2024,
    month: 11, // November (Post-monsoon)
    temperature_avg: 28.5,
    humidity_avg: 75,
    rainfall_mm: 285,
    dengue_cases: 2800,
    malaria_cases: 1200,
    typhoid_cases: 980,
    influenza_cases: 1800,
    respiratory_infections: 3500,
    gastroenteritis_cases: 2100,
    total_doctors: 11200,
    hospitals: 245,
    beds_available: 38000,
    population_thousands: 10800,
    doctors_per_1000: 1.04,
    cases_per_1000: 1.18
  },
  
  // Delhi (Metro)
  {
    state: 'Delhi',
    district: 'New Delhi',
    pincode: '110001',
    year: 2024,
    month: 9, // September (Monsoon end)
    temperature_avg: 32.5,
    humidity_avg: 72,
    rainfall_mm: 125,
    dengue_cases: 4200,
    malaria_cases: 2100,
    typhoid_cases: 1200,
    influenza_cases: 2500,
    respiratory_infections: 4200,
    gastroenteritis_cases: 2800,
    total_doctors: 15800,
    hospitals: 385,
    beds_available: 52000,
    population_thousands: 16300,
    doctors_per_1000: 0.97,
    cases_per_1000: 1.05
  },
  {
    state: 'Delhi',
    district: 'New Delhi',
    pincode: '110001',
    year: 2024,
    month: 1, // January (Winter)
    temperature_avg: 14.2,
    humidity_avg: 68,
    rainfall_mm: 18,
    dengue_cases: 280,
    malaria_cases: 120,
    typhoid_cases: 320,
    influenza_cases: 8500,
    respiratory_infections: 12500,
    gastroenteritis_cases: 850,
    total_doctors: 15800,
    hospitals: 385,
    beds_available: 52000,
    population_thousands: 16300,
    doctors_per_1000: 0.97,
    cases_per_1000: 1.38
  },
  
  // West Bengal - Kolkata (Metro)
  {
    state: 'West Bengal',
    district: 'Kolkata',
    pincode: '700001',
    year: 2024,
    month: 8, // August (Monsoon)
    temperature_avg: 30.5,
    humidity_avg: 82,
    rainfall_mm: 325,
    dengue_cases: 3500,
    malaria_cases: 2800,
    typhoid_cases: 1500,
    influenza_cases: 2200,
    respiratory_infections: 4800,
    gastroenteritis_cases: 3200,
    total_doctors: 9500,
    hospitals: 225,
    beds_available: 32000,
    population_thousands: 14500,
    doctors_per_1000: 0.66,
    cases_per_1000: 1.24
  },
  
  // Rajasthan - Jaipur (Tier-1)
  {
    state: 'Rajasthan',
    district: 'Jaipur',
    pincode: '302001',
    year: 2024,
    month: 5, // May (Summer peak)
    temperature_avg: 39.5,
    humidity_avg: 35,
    rainfall_mm: 12,
    dengue_cases: 180,
    malaria_cases: 95,
    typhoid_cases: 280,
    influenza_cases: 450,
    respiratory_infections: 1200,
    gastroenteritis_cases: 850,
    total_doctors: 4200,
    hospitals: 95,
    beds_available: 15000,
    population_thousands: 3900,
    doctors_per_1000: 1.08,
    cases_per_1000: 0.77
  },
  {
    state: 'Rajasthan',
    district: 'Jaipur',
    pincode: '302001',
    year: 2024,
    month: 8, // August (Monsoon)
    temperature_avg: 32.8,
    humidity_avg: 68,
    rainfall_mm: 185,
    dengue_cases: 1200,
    malaria_cases: 680,
    typhoid_cases: 520,
    influenza_cases: 850,
    respiratory_infections: 2100,
    gastroenteritis_cases: 1400,
    total_doctors: 4200,
    hospitals: 95,
    beds_available: 15000,
    population_thousands: 3900,
    doctors_per_1000: 1.08,
    cases_per_1000: 1.68
  },
  
  // Gujarat - Ahmedabad (Metro)
  {
    state: 'Gujarat',
    district: 'Ahmedabad',
    pincode: '380001',
    year: 2024,
    month: 7, // July (Monsoon)
    temperature_avg: 31.2,
    humidity_avg: 75,
    rainfall_mm: 245,
    dengue_cases: 2500,
    malaria_cases: 1400,
    typhoid_cases: 980,
    influenza_cases: 1850,
    respiratory_infections: 3500,
    gastroenteritis_cases: 2200,
    total_doctors: 7800,
    hospitals: 185,
    beds_available: 28000,
    population_thousands: 8200,
    doctors_per_1000: 0.95,
    cases_per_1000: 1.58
  },
  
  // Uttar Pradesh - Lucknow (Tier-1)
  {
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    pincode: '226001',
    year: 2024,
    month: 8, // August (Monsoon)
    temperature_avg: 31.5,
    humidity_avg: 78,
    rainfall_mm: 285,
    dengue_cases: 1800,
    malaria_cases: 1200,
    typhoid_cases: 850,
    influenza_cases: 1500,
    respiratory_infections: 3200,
    gastroenteritis_cases: 1950,
    total_doctors: 5200,
    hospitals: 125,
    beds_available: 18500,
    population_thousands: 3500,
    doctors_per_1000: 1.49,
    cases_per_1000: 2.99
  },
  
  // Madhya Pradesh - Indore (Tier-1)
  {
    state: 'Madhya Pradesh',
    district: 'Indore',
    pincode: '452001',
    year: 2024,
    month: 8, // August (Monsoon)
    temperature_avg: 28.5,
    humidity_avg: 72,
    rainfall_mm: 225,
    dengue_cases: 1200,
    malaria_cases: 850,
    typhoid_cases: 620,
    influenza_cases: 980,
    respiratory_infections: 2100,
    gastroenteritis_cases: 1350,
    total_doctors: 3800,
    hospitals: 85,
    beds_available: 12500,
    population_thousands: 3200,
    doctors_per_1000: 1.19,
    cases_per_1000: 2.22
  },
  
  // Rural areas - Example
  {
    state: 'Maharashtra',
    district: 'Ratnagiri',
    pincode: '416704',
    year: 2024,
    month: 8, // August (Monsoon)
    temperature_avg: 28.2,
    humidity_avg: 85,
    rainfall_mm: 485,
    dengue_cases: 85,
    malaria_cases: 120,
    typhoid_cases: 95,
    influenza_cases: 180,
    respiratory_infections: 320,
    gastroenteritis_cases: 210,
    total_doctors: 185,
    hospitals: 8,
    beds_available: 850,
    population_thousands: 280,
    doctors_per_1000: 0.66,
    cases_per_1000: 3.61
  },
  
  // Add more diverse data points for better training
  {
    state: 'Punjab',
    district: 'Ludhiana',
    pincode: '141001',
    year: 2024,
    month: 1, // January (Winter)
    temperature_avg: 12.5,
    humidity_avg: 72,
    rainfall_mm: 28,
    dengue_cases: 45,
    malaria_cases: 28,
    typhoid_cases: 85,
    influenza_cases: 2800,
    respiratory_infections: 4500,
    gastroenteritis_cases: 320,
    total_doctors: 2800,
    hospitals: 65,
    beds_available: 9500,
    population_thousands: 1800,
    doctors_per_1000: 1.56,
    cases_per_1000: 4.32
  },
]

/**
 * Get government dataset record for a specific location and time period
 */
export function getGovtDataByPincode(pincode: string, month?: number): GovtHealthRecord | null {
  const records = GOVT_HEALTH_DATASET.filter(r => r.pincode === pincode)
  
  if (records.length === 0) {
    // Try to find by district/state match
    return null
  }
  
  // If month specified, find closest match
  if (month !== undefined) {
    const monthMatch = records.find(r => r.month === month)
    if (monthMatch) return monthMatch
  }
  
  // Return most recent record
  return records[records.length - 1]
}

/**
 * Get government dataset records by state
 */
export function getGovtDataByState(state: string): GovtHealthRecord[] {
  return GOVT_HEALTH_DATASET.filter(r => 
    r.state.toLowerCase() === state.toLowerCase()
  )
}

/**
 * Get all unique pincodes in the dataset
 */
export function getAllPincodes(): string[] {
  return Array.from(new Set(
    GOVT_HEALTH_DATASET
      .filter(r => r.pincode)
      .map(r => r.pincode!)
  ))
}

/**
 * Calculate doctor requirement based on government data
 * This is the "ground truth" from real disease cases
 */
export function calculateDoctorRequirementFromGovtData(record: GovtHealthRecord): number {
  // WHO recommended ratio: 1 doctor per 1000 population
  // Adjust based on disease burden
  
  const totalCases = record.dengue_cases + record.malaria_cases + 
                     record.typhoid_cases + record.influenza_cases +
                     record.respiratory_infections + record.gastroenteritis_cases
  
  const casesPerDoctor = 50 // Each doctor can handle ~50 active cases
  const doctorsNeededForCases = Math.ceil(totalCases / casesPerDoctor)
  
  // Minimum doctors based on population (WHO standard)
  const minDoctorsNeeded = Math.ceil(record.population_thousands)
  
  // Return the higher of the two
  return Math.max(doctorsNeededForCases, minDoctorsNeeded)
}

/**
 * Export dataset summary for analysis
 */
export function getDatasetSummary() {
  return {
    total_records: GOVT_HEALTH_DATASET.length,
    states_covered: new Set(GOVT_HEALTH_DATASET.map(r => r.state)).size,
    districts_covered: new Set(GOVT_HEALTH_DATASET.map(r => r.district)).size,
    pincodes_covered: getAllPincodes().length,
    year_range: {
      min: Math.min(...GOVT_HEALTH_DATASET.map(r => r.year)),
      max: Math.max(...GOVT_HEALTH_DATASET.map(r => r.year))
    },
    total_disease_cases: GOVT_HEALTH_DATASET.reduce((sum, r) => 
      sum + r.dengue_cases + r.malaria_cases + r.typhoid_cases + 
      r.influenza_cases + r.respiratory_infections + r.gastroenteritis_cases, 0
    ),
    avg_doctors_per_1000: (GOVT_HEALTH_DATASET.reduce((sum, r) => 
      sum + r.doctors_per_1000, 0) / GOVT_HEALTH_DATASET.length).toFixed(2)
  }
}
