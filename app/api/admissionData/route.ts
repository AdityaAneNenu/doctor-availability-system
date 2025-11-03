/**
 * API Route: /api/admissionData
 * Handles collection and retrieval of daily admission data for ML training
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  where,
  limit,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

// ===========================
// DATA STRUCTURES
// ===========================

interface AdmissionDataPoint {
  date: string;
  hospital_id?: string;
  hospital_name?: string;
  
  // Admission counts
  total_admissions: number;
  emergency_admissions: number;
  opd_admissions: number;
  scheduled_admissions: number;
  
  // Contextual data
  day_of_week: number;
  is_weekend: boolean;
  is_holiday: boolean;
  
  // Metadata
  created_at: Date;
  notes?: string;
}

// ===========================
// POST: Add new admission data
// ===========================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      date,
      hospital_id,
      hospital_name,
      total_admissions,
      emergency_admissions,
      opd_admissions,
      scheduled_admissions,
      is_holiday,
      notes,
    } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    if (total_admissions === undefined || total_admissions < 0) {
      return NextResponse.json(
        { success: false, error: 'Total admissions must be a non-negative number' },
        { status: 400 }
      );
    }

    // Parse date and calculate day of week
    const admissionDate = new Date(date);
    const dayOfWeek = admissionDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Prepare admission data
    const admissionData: AdmissionDataPoint = {
      date,
      hospital_id: hospital_id || 'default',
      hospital_name: hospital_name || 'General Hospital',
      total_admissions: Number(total_admissions),
      emergency_admissions: Number(emergency_admissions || 0),
      opd_admissions: Number(opd_admissions || 0),
      scheduled_admissions: Number(scheduled_admissions || 0),
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_holiday: is_holiday || false,
      created_at: new Date(),
      notes: notes || '',
    };

    // Check if data for this date already exists
    const existingQuery = query(
      collection(db, 'admission_data'),
      where('date', '==', date),
      where('hospital_id', '==', admissionData.hospital_id),
      limit(1)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Update existing document
      const docRef = existingDocs.docs[0].ref;
      await setDoc(docRef, admissionData, { merge: true });
      
      return NextResponse.json({
        success: true,
        message: 'Admission data updated successfully',
        data: admissionData,
      });
    }

    // Add new document
    const docRef = await addDoc(collection(db, 'admission_data'), admissionData);

    return NextResponse.json({
      success: true,
      message: 'Admission data saved successfully',
      data: {
        id: docRef.id,
        ...admissionData,
      },
    });

  } catch (error) {
    console.error('Error saving admission data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save admission data' 
      },
      { status: 500 }
    );
  }
}

// ===========================
// GET: Retrieve admission data
// ===========================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const hospital_id = searchParams.get('hospital_id') || 'default';
    const days = parseInt(searchParams.get('days') || '90');

    // Action: Get statistics
    if (action === 'stats') {
      const statsQuery = query(
        collection(db, 'admission_data'),
        where('hospital_id', '==', hospital_id),
        orderBy('date', 'desc'),
        limit(365) // Last year
      );

      const snapshot = await getDocs(statsQuery);
      const dataPoints = snapshot.docs.map(doc => doc.data() as AdmissionDataPoint);

      if (dataPoints.length === 0) {
        return NextResponse.json({
          success: true,
          stats: {
            total_days: 0,
            avg_admissions: 0,
            max_admissions: 0,
            min_admissions: 0,
            total_collected: 0,
          },
          message: 'No data collected yet. Start entering daily admission counts.',
        });
      }

      const totalAdmissions = dataPoints.reduce((sum, d) => sum + d.total_admissions, 0);
      const admissionCounts = dataPoints.map(d => d.total_admissions);

      return NextResponse.json({
        success: true,
        stats: {
          total_days: dataPoints.length,
          avg_admissions: Math.round(totalAdmissions / dataPoints.length),
          max_admissions: Math.max(...admissionCounts),
          min_admissions: Math.min(...admissionCounts),
          total_collected: totalAdmissions,
          latest_date: dataPoints[0]?.date,
          oldest_date: dataPoints[dataPoints.length - 1]?.date,
        },
      });
    }

    // Action: Get training data
    if (action === 'training') {
      const trainingQuery = query(
        collection(db, 'admission_data'),
        where('hospital_id', '==', hospital_id),
        orderBy('date', 'asc'),
        limit(days)
      );

      const snapshot = await getDocs(trainingQuery);
      const rawData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (AdmissionDataPoint & { id: string })[];

      if (rawData.length < 30) {
        return NextResponse.json({
          success: false,
          error: `Need at least 30 days of data to train ML model. Currently have ${rawData.length} days.`,
          data_collected: rawData.length,
          days_needed: 30 - rawData.length,
        });
      }

      // Transform to training format with features
      const trainingData = rawData.map((point, index) => {
        // Calculate historical features
        const last7Days = rawData.slice(Math.max(0, index - 7), index);
        const last30Days = rawData.slice(Math.max(0, index - 30), index);
        
        const last7Avg = last7Days.length > 0
          ? last7Days.reduce((sum, d) => sum + d.total_admissions, 0) / last7Days.length
          : point.total_admissions;
        
        const last30Avg = last30Days.length > 0
          ? last30Days.reduce((sum, d) => sum + d.total_admissions, 0) / last30Days.length
          : point.total_admissions;

        // Same day last week
        const sameDayLastWeek = index >= 7 ? rawData[index - 7].total_admissions : point.total_admissions;
        
        // Same day last month (approximate)
        const sameDayLastMonth = index >= 30 ? rawData[index - 30].total_admissions : point.total_admissions;

        // Calculate trend
        const recentDays = rawData.slice(Math.max(0, index - 7), index);
        let trend = 0;
        if (recentDays.length >= 2) {
          const firstHalf = recentDays.slice(0, Math.floor(recentDays.length / 2));
          const secondHalf = recentDays.slice(Math.floor(recentDays.length / 2));
          const firstAvg = firstHalf.reduce((sum, d) => sum + d.total_admissions, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, d) => sum + d.total_admissions, 0) / secondHalf.length;
          trend = (secondAvg - firstAvg) / (firstAvg + 1); // Normalized trend
        }

        return {
          date: point.date,
          hospital_id: point.hospital_id,
          features: {
            day_of_week: point.day_of_week,
            month: new Date(point.date).getMonth() + 1,
            day_of_month: new Date(point.date).getDate(),
            is_weekend: point.is_weekend ? 1 : 0,
            is_public_holiday: point.is_holiday ? 1 : 0,
            last_7_days_avg: last7Avg,
            last_30_days_avg: last30Avg,
            same_day_last_week: sameDayLastWeek,
            same_day_last_month: sameDayLastMonth,
            trend: Math.max(-1, Math.min(1, trend)), // Clamp between -1 and 1
          },
          target: {
            total_admissions: point.total_admissions,
            emergency_admissions: point.emergency_admissions,
            opd_admissions: point.opd_admissions,
            scheduled_admissions: point.scheduled_admissions,
          },
        };
      });

      return NextResponse.json({
        success: true,
        training_data: trainingData,
        total_points: trainingData.length,
        date_range: {
          start: rawData[0]?.date,
          end: rawData[rawData.length - 1]?.date,
        },
      });
    }

    // Default: Get recent data
    const recentQuery = query(
      collection(db, 'admission_data'),
      where('hospital_id', '==', hospital_id),
      orderBy('date', 'desc'),
      limit(days)
    );

    const snapshot = await getDocs(recentQuery);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });

  } catch (error) {
    console.error('Error fetching admission data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch admission data' 
      },
      { status: 500 }
    );
  }
}

// ===========================
// DELETE: Remove admission data (for corrections)
// ===========================

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const hospital_id = searchParams.get('hospital_id') || 'default';

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    const deleteQuery = query(
      collection(db, 'admission_data'),
      where('date', '==', date),
      where('hospital_id', '==', hospital_id),
      limit(1)
    );

    const snapshot = await getDocs(deleteQuery);
    
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'No data found for this date' },
        { status: 404 }
      );
    }

    // Delete the document
    await deleteDoc(snapshot.docs[0].ref);

    return NextResponse.json({
      success: true,
      message: 'Admission data deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting admission data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete admission data' 
      },
      { status: 500 }
    );
  }
}
