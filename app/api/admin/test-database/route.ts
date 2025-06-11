import { NextResponse } from 'next/server'
import { testDatabaseConnection, getAllFeedback } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 })
    }

    // Test getting feedback
    const feedback = await getAllFeedback()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        feedbackCount: feedback.length,
        sampleFeedback: feedback.slice(0, 2) // Show first 2 items
      }
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 