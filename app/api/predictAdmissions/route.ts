/**
 * API Route: /api/predictAdmissions
 * Generates admission predictions using trained ML model
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      features,
      days_ahead = 1,
    } = body;

    if (!features) {
      return NextResponse.json(
        { success: false, error: 'Features are required for prediction' },
        { status: 400 }
      );
    }

    // Validate features
    const requiredFeatures = [
      'day_of_week',
      'month',
      'day_of_month',
      'is_weekend',
      'is_public_holiday',
      'last_7_days_avg',
      'last_30_days_avg',
      'same_day_last_week',
      'same_day_last_month',
      'trend',
    ];

    for (const feature of requiredFeatures) {
      if (features[feature] === undefined) {
        return NextResponse.json(
          { success: false, error: `Missing required feature: ${feature}` },
          { status: 400 }
        );
      }
    }

    // Prediction happens in browser (model runs client-side)
    // This API just validates and returns the features
    return NextResponse.json({
      success: true,
      message: 'Features validated. Run prediction in browser using trained model.',
      features,
      days_ahead,
    });

  } catch (error) {
    console.error('Error in prediction API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Prediction failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hospital_id = searchParams.get('hospital_id') || 'default';
    
    // Get recent admission data to generate features for prediction
    const baseUrl = request.nextUrl.origin;
    const dataResponse = await fetch(
      `${baseUrl}/api/admissionData?hospital_id=${hospital_id}&days=30`,
      { cache: 'no-store' }
    );

    const dataResult = await dataResponse.json();

    if (!dataResult.success || !dataResult.data || dataResult.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No historical data available to generate prediction features',
      });
    }

    const recentData = dataResult.data;

    // Calculate features for tomorrow's prediction
    const last7Days = recentData.slice(0, 7);
    const last30Days = recentData.slice(0, 30);

    const last7Avg = last7Days.reduce((sum: number, d: { total_admissions: number }) => sum + d.total_admissions, 0) / last7Days.length;
    const last30Avg = last30Days.reduce((sum: number, d: { total_admissions: number }) => sum + d.total_admissions, 0) / last30Days.length;

    const sameDayLastWeek = recentData.length >= 7 ? recentData[6].total_admissions : last7Avg;
    const sameDayLastMonth = recentData.length >= 30 ? recentData[29].total_admissions : last30Avg;

    // Calculate trend
    const firstHalf = recentData.slice(Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const firstAvg = firstHalf.reduce((sum: number, d: { total_admissions: number }) => sum + d.total_admissions, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, d: { total_admissions: number }) => sum + d.total_admissions, 0) / secondHalf.length;
    const trend = (secondAvg - firstAvg) / (firstAvg + 1);

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const features = {
      day_of_week: tomorrow.getDay(),
      month: tomorrow.getMonth() + 1,
      day_of_month: tomorrow.getDate(),
      is_weekend: tomorrow.getDay() === 0 || tomorrow.getDay() === 6 ? 1 : 0,
      is_public_holiday: 0, // User can set this
      last_7_days_avg: Math.round(last7Avg),
      last_30_days_avg: Math.round(last30Avg),
      same_day_last_week: sameDayLastWeek,
      same_day_last_month: sameDayLastMonth,
      trend: Math.max(-1, Math.min(1, trend)),
    };

    return NextResponse.json({
      success: true,
      features,
      prediction_date: tomorrow.toISOString().split('T')[0],
      message: 'Features generated for prediction. Use these in ML model.',
    });

  } catch (error) {
    console.error('Error generating prediction features:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate features' 
      },
      { status: 500 }
    );
  }
}
