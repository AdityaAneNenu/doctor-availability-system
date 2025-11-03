/**
 * Delete all admission data
 * Open browser console on the admission prediction page and run:
 * deleteAllAdmissionData()
 */

async function deleteAllAdmissionData() {
  const confirmDelete = confirm('⚠️ Are you sure you want to DELETE ALL admission data?\n\nThis cannot be undone!');
  
  if (!confirmDelete) {
    console.log('❌ Deletion cancelled');
    return;
  }

  console.log('🗑️ Starting deletion...');

  try {
    // Fetch all data first
    const response = await fetch('/api/admissionData');
    const result = await response.json();

    if (!result.success) {
      console.error('❌ Error fetching data:', result.error);
      return;
    }

    const data = result.data || [];
    console.log(`Found ${data.length} records to delete`);

    let deletedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      try {
        const deleteResponse = await fetch(`/api/admissionData?date=${record.date}`, {
          method: 'DELETE',
        });

        const deleteResult = await deleteResponse.json();

        if (deleteResult.success) {
          deletedCount++;
          console.log(`✅ [${i + 1}/${data.length}] Deleted: ${record.date}`);
        } else {
          errorCount++;
          console.error(`❌ [${i + 1}/${data.length}] Failed: ${record.date}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ [${i + 1}/${data.length}] Error: ${record.date}`, error);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Deletion complete!`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`\n🔄 Refresh the page to see updated statistics.`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.deleteAllAdmissionData = deleteAllAdmissionData;
  console.log('✅ Delete function loaded!');
  console.log('🗑️ To delete all data, run: deleteAllAdmissionData()');
}
