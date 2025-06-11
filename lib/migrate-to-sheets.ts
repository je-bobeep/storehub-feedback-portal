import { mockFeedback } from './mock-data'
import { getAllFeedback, addFeedback, initializeSheet, testConnection } from './google-sheets'
import { Feedback } from './types'

/**
 * Migrate mock data to Google Sheets
 */
export async function migrateMockDataToSheets(): Promise<boolean> {
  try {
    console.log('🚀 Starting migration to Google Sheets...')

    // Test connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      console.log('❌ Cannot connect to Google Sheets, skipping migration')
      return false
    }

    // Initialize sheet with headers
    await initializeSheet()

    // Check if data already exists
    const existingData = await getAllFeedback()
    if (existingData.length > 0) {
      console.log(`📊 Google Sheets already has ${existingData.length} items, skipping migration`)
      return true
    }

    // Migrate each mock feedback item
    console.log(`📤 Migrating ${mockFeedback.length} items to Google Sheets...`)
    
    for (const feedback of mockFeedback) {
      await addFeedback(feedback)
      console.log(`✅ Migrated: ${feedback.title}`)
    }

    console.log('🎉 Migration completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return false
  }
}

/**
 * Get feedback with fallback to mock data if Google Sheets fails
 */
export async function getFeedbackWithFallback(): Promise<Feedback[]> {
  try {
    // Try to get data from Google Sheets first
    const sheetsData = await getAllFeedback()
    console.log(`📊 Retrieved ${sheetsData.length} items from Google Sheets`)
    return sheetsData
  } catch (error) {
    console.warn('⚠️ Google Sheets failed, falling back to mock data:', error)
    return mockFeedback
  }
}

/**
 * Add feedback with fallback to mock data if Google Sheets fails
 */
export async function addFeedbackWithFallback(feedback: Feedback): Promise<Feedback> {
  try {
    // Try to add to Google Sheets first
    const result = await addFeedback(feedback)
    console.log(`✅ Added feedback to Google Sheets: ${feedback.title}`)
    return result
  } catch (error) {
    console.warn('⚠️ Google Sheets failed, adding to mock data:', error)
    
    // Fallback to mock data
    const { addMockFeedback } = await import('./mock-data')
    return addMockFeedback(feedback.title, feedback.description, feedback.category, feedback.subCategory)
  }
}

/**
 * Check if Google Sheets is available and properly configured
 */
export async function isGoogleSheetsAvailable(): Promise<boolean> {
  try {
    const hasCredentials = !!(
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_PRIVATE_KEY
    )

    if (!hasCredentials) {
      console.log('📝 Google Sheets credentials not configured, using mock data')
      return false
    }

    return await testConnection()
  } catch (error) {
    console.warn('⚠️ Google Sheets availability check failed:', error)
    return false
  }
} 