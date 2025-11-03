/**
 * API Route: Analyze Disease Risk by PIN Code
 * Endpoint: /api/analyzePinCode
 * Method: POST
 * 
 * Takes a PIN code and returns:
 * - Location details
 * - Current weather
 * - Disease predictions
 * - Doctor requirements
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeDiseaseByPinCode, getHospitalAreaDiseaseRisk } from '@/lib/pinCodeDiseaseAnalysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pincode, type = 'full' } = body

    if (!pincode) {
      return NextResponse.json({
        success: false,
        error: 'PIN code is required',
        message: 'Please provide a 6-digit PIN code'
      }, { status: 400 })
    }

    // Validate PIN code format
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid PIN code format',
        message: 'PIN code must be exactly 6 digits'
      }, { status: 400 })
    }

    console.log(`🔍 Analyzing PIN code: ${pincode} (type: ${type})`)

    // Choose analysis type
    let result

    if (type === 'quick') {
      // Quick hospital risk assessment
      result = await getHospitalAreaDiseaseRisk(pincode)
      
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Analysis failed',
          message: 'Could not analyze disease risk for this PIN code'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: `Disease risk analysis completed for PIN ${pincode}`
      })
    } else {
      // Full detailed analysis
      result = await analyzeDiseaseByPinCode(pincode)
      
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Analysis failed',
          message: 'Could not find location or analyze disease risk for this PIN code'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: `Complete disease analysis for ${result.location?.city}, ${result.location?.state}`
      })
    }

  } catch (error) {
    console.error('❌ Error in PIN code analysis API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to analyze PIN code'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pincode = searchParams.get('pincode')

  if (!pincode) {
    return NextResponse.json({
      success: false,
      error: 'PIN code is required',
      message: 'Usage: /api/analyzePinCode?pincode=560001'
    }, { status: 400 })
  }

  // Redirect to POST handler
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ pincode }),
      headers: { 'Content-Type': 'application/json' }
    })
  )
}
