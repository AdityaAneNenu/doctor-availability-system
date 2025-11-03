/**
 * Script to generate 30+ days of realistic hospital admission data
 * This creates synthetic data for testing the ML model
 * 
 * To use: Copy the JSON output and manually import to Firestore
 * Or use the browser console method in seedAdmissionData.ts
 */

interface AdmissionData {
  date: string;
  hospital_id: string;
  total_admissions: number;
  emergency_admissions: number;
  opd_admissions: number;
  scheduled_admissions: number;
  day_of_week: number;
  is_weekend: boolean;
  is_holiday: boolean;
  notes: string;
  created_at: string;
}

// Generate realistic admission data
function generateAdmissionData(daysBack: number = 60): AdmissionData[] {
  const data: AdmissionData[] = [];
  const today = new Date('2025-11-02'); // Current date
  
  // Public holidays in 2025 (India - adjust as needed)
  const holidays = [
    '2025-01-26', // Republic Day
    '2025-03-14', // Holi
    '2025-03-31', // Eid
    '2025-04-10', // Mahavir Jayanti
    '2025-04-14', // Ambedkar Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Labour Day
    '2025-05-12', // Buddha Purnima
    '2025-08-15', // Independence Day
    '2025-08-16', // Janmashtami
    '2025-09-05', // Ganesh Chaturthi
    '2025-10-02', // Gandhi Jayanti
    '2025-10-21', // Dussehra
    '2025-10-24', // Diwali
  ];

  for (let i = daysBack; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateStr);
    
    // Base admission patterns
    let baseTotal = 85; // Average daily admissions
    
    // Monday surge (more admissions after weekend)
    if (dayOfWeek === 1) baseTotal += 25;
    
    // Weekend reduction
    if (isWeekend) baseTotal -= 30;
    
    // Holiday reduction
    if (isHoliday) baseTotal -= 40;
    
    // Friday slight increase
    if (dayOfWeek === 5) baseTotal += 10;
    
    // Add monthly trend (seasonal variation)
    const month = date.getMonth();
    if (month >= 5 && month <= 8) { // Monsoon season (June-Sep)
      baseTotal += 15; // More admissions due to seasonal diseases
    }
    if (month === 11 || month === 0 || month === 1) { // Winter (Dec-Feb)
      baseTotal += 10; // Flu season
    }
    
    // Add random variation (-10 to +10)
    const randomVariation = Math.floor(Math.random() * 21) - 10;
    const totalAdmissions = Math.max(20, baseTotal + randomVariation);
    
    // Split admissions by type (realistic percentages)
    const emergencyPct = 0.30 + (Math.random() * 0.10 - 0.05); // 30% ± 5%
    const opdPct = 0.45 + (Math.random() * 0.10 - 0.05);       // 45% ± 5%
    const scheduledPct = 1 - emergencyPct - opdPct;            // Remaining
    
    const emergencyAdmissions = Math.round(totalAdmissions * emergencyPct);
    const opdAdmissions = Math.round(totalAdmissions * opdPct);
    const scheduledAdmissions = totalAdmissions - emergencyAdmissions - opdAdmissions;
    
    // Generate contextual notes
    let notes = '';
    if (dayOfWeek === 1) notes = 'Monday surge - post-weekend cases';
    if (isWeekend) notes = 'Weekend - reduced scheduled procedures';
    if (isHoliday) notes = `Public holiday - minimal staff, emergency only`;
    if (totalAdmissions > 100) notes = 'High admission day - possible outbreak or accident cases';
    
    data.push({
      date: dateStr,
      hospital_id: 'default',
      total_admissions: totalAdmissions,
      emergency_admissions: emergencyAdmissions,
      opd_admissions: opdAdmissions,
      scheduled_admissions: scheduledAdmissions,
      day_of_week: (dayOfWeek + 6) % 7, // Convert to 0=Mon, 6=Sun
      is_weekend: isWeekend,
      is_holiday: isHoliday,
      notes: notes,
      created_at: new Date().toISOString(),
    });
  }
  
  return data;
}

// Generate data
const admissionData = generateAdmissionData(60); // 60 days of data

// Output as JSON for import
console.log('Generated Admission Data:');
console.log(JSON.stringify(admissionData, null, 2));

// Statistics
const totalAdmissions = admissionData.reduce((sum, d) => sum + d.total_admissions, 0);
const avgAdmissions = totalAdmissions / admissionData.length;
const maxAdmissions = Math.max(...admissionData.map(d => d.total_admissions));
const minAdmissions = Math.min(...admissionData.map(d => d.total_admissions));

console.log('\n=== Statistics ===');
console.log(`Total days: ${admissionData.length}`);
console.log(`Average admissions/day: ${avgAdmissions.toFixed(2)}`);
console.log(`Max admissions: ${maxAdmissions}`);
console.log(`Min admissions: ${minAdmissions}`);
console.log(`Total admissions: ${totalAdmissions}`);

// Note: To save to file, run this script with Node.js
// For browser use, see lib/seedAdmissionData.ts
console.log('\n📋 Copy the JSON data above to import into Firestore');
console.log('💡 Or use the browser console method in lib/seedAdmissionData.ts');

export { generateAdmissionData };
