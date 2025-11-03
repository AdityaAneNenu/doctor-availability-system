/**
 * API Route: /api/trainAdmissionModel
 * Trains the ML model on collected admission data
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospital_id = 'default' } = body;

    // Fetch training data from our API
    const baseUrl = request.nextUrl.origin;
    const dataResponse = await fetch(
      `${baseUrl}/api/admissionData?action=training&hospital_id=${hospital_id}&days=365`,
      { cache: 'no-store' }
    );

    const dataResult = await dataResponse.json();

    if (!dataResult.success) {
      return NextResponse.json({
        success: false,
        error: dataResult.error || 'Failed to fetch training data',
        data_collected: dataResult.data_collected,
        days_needed: dataResult.days_needed,
      });
    }

    const trainingData = dataResult.training_data;

    // Return training data to client (training happens in browser)
    return NextResponse.json({
      success: true,
      training_data: trainingData,
      total_points: trainingData.length,
      date_range: dataResult.date_range,
      message: 'Training data prepared. Train model in browser for better performance.',
    });

  } catch (error) {
    console.error('Error preparing training data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to prepare training data' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST to train the admission prediction model',
    info: {
      method: 'POST',
      body: {
        hospital_id: 'string (optional, default: "default")',
        epochs: 'number (optional, default: 100)',
      },
      response: 'Returns training data for client-side ML training',
    },
  });
}
