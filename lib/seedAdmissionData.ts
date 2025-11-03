/**
 * Client-side script to populate admission data
 * Run this in browser console on the admission prediction page
 * Or create a button to trigger it
 */

// Generate realistic admission data for the past 60 days
function generateAdmissionData(daysBack = 60) {
  const data = [];
  const today = new Date('2025-11-02');
  
  // Public holidays in 2025
  const holidays = [
    '2025-01-26', '2025-03-14', '2025-03-31', '2025-04-10',
    '2025-04-14', '2025-04-18', '2025-05-01', '2025-05-12',
    '2025-08-15', '2025-08-16', '2025-09-05', '2025-10-02',
    '2025-10-21', '2025-10-24'
  ];

  for (let i = daysBack; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateStr);
    
    let baseTotal = 85;
    if (dayOfWeek === 1) baseTotal += 25; // Monday surge
    if (isWeekend) baseTotal -= 30;
    if (isHoliday) baseTotal -= 40;
    if (dayOfWeek === 5) baseTotal += 10; // Friday
    
    const month = date.getMonth();
    if (month >= 5 && month <= 8) baseTotal += 15; // Monsoon
    if (month === 11 || month === 0 || month === 1) baseTotal += 10; // Winter
    
    const randomVariation = Math.floor(Math.random() * 21) - 10;
    const totalAdmissions = Math.max(20, baseTotal + randomVariation);
    
    const emergencyPct = 0.30 + (Math.random() * 0.10 - 0.05);
    const opdPct = 0.45 + (Math.random() * 0.10 - 0.05);
    
    const emergencyAdmissions = Math.round(totalAdmissions * emergencyPct);
    const opdAdmissions = Math.round(totalAdmissions * opdPct);
    const scheduledAdmissions = totalAdmissions - emergencyAdmissions - opdAdmissions;
    
    let notes = '';
    if (dayOfWeek === 1) notes = 'Monday surge - post-weekend cases';
    if (isWeekend) notes = 'Weekend - reduced scheduled procedures';
    if (isHoliday) notes = 'Public holiday';
    if (totalAdmissions > 100) notes = 'High admission day';
    
    data.push({
      date: dateStr,
      hospital_id: 'default',
      total_admissions: totalAdmissions,
      emergency_admissions: emergencyAdmissions,
      opd_admissions: opdAdmissions,
      scheduled_admissions: scheduledAdmissions,
      is_holiday: isHoliday,
      notes: notes,
    });
  }
  
  return data;
}

// Upload data to API
async function uploadAdmissionData() {
  const data = generateAdmissionData(60);
  
  console.log(`🚀 Starting upload of ${data.length} days of admission data...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    
    try {
      const response = await fetch('/api/admissionData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      
      const result = await response.json();
      
      if (result.success) {
        successCount++;
        console.log(`✅ [${i + 1}/${data.length}] Saved: ${record.date} (${record.total_admissions} admissions)`);
      } else {
        errorCount++;
        console.error(`❌ [${i + 1}/${data.length}] Failed: ${record.date} - ${result.error}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${data.length}] Error: ${record.date}`, error);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Upload complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\n🔄 Reload the page to see updated statistics.`);
}

// Export for use
if (typeof window !== 'undefined') {
  (window as Window & { uploadAdmissionData?: () => Promise<void> }).uploadAdmissionData = uploadAdmissionData;
  console.log('✅ Data generator loaded!');
  console.log('📊 To populate data, run: uploadAdmissionData()');
}

export { generateAdmissionData, uploadAdmissionData };
