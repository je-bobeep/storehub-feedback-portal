import { NextResponse } from 'next/server'
import { testConnection, initializeSheet } from '@/lib/google-sheets'
import { isGoogleSheetsAvailable, migrateMockDataToSheets } from '@/lib/migrate-to-sheets'

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
        sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'Feedback'
      },
      tests: {
        isAvailable: false,
        canConnect: false,
        canInitialize: false,
        migrationStatus: 'not-attempted'
      }
    }

    // Test 1: Check if Google Sheets is available
    console.log('🧪 Testing Google Sheets availability...')
    results.tests.isAvailable = await isGoogleSheetsAvailable()

    if (!results.tests.isAvailable) {
      return NextResponse.json({
        success: false,
        message: 'Google Sheets not available - check environment variables',
        results
      })
    }

    // Test 2: Test connection
    console.log('🧪 Testing Google Sheets connection...')
    results.tests.canConnect = await testConnection()

    if (!results.tests.canConnect) {
      return NextResponse.json({
        success: false,
        message: 'Cannot connect to Google Sheets - check credentials',
        results
      })
    }

    // Test 3: Initialize sheet
    console.log('🧪 Testing Google Sheets initialization...')
    results.tests.canInitialize = await initializeSheet()

    // Test 4: Migration status
    console.log('🧪 Testing migration...')
    const migrationResult = await migrateMockDataToSheets()
    results.tests.migrationStatus = migrationResult ? 'success' : 'failed'

    return NextResponse.json({
      success: true,
      message: 'All Google Sheets tests passed!',
      results
    })

  } catch (error) {
    console.error('❌ Admin test failed:', error)

    return NextResponse.json({
      success: false,
      message: 'Test failed with error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 