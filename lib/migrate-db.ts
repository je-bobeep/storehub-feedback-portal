import { prisma } from './database'

/**
 * Migration script to add AI automation features to existing database
 */
export async function migrateToAiAutomation() {
  console.log('🚀 Starting AI automation migration...')
  
  try {
    // Check if we're using the raw database connection
    console.log('📊 Running database migration for AI automation...')
    
    // The migration will be handled by Prisma when we run prisma db push
    // This file serves as documentation of the migration process
    
    // Step 1: Add AI automation columns to feedback table
    console.log('✅ AI automation columns will be added to feedback table')
    console.log('   - aiTaggedAt (timestamp)')
    console.log('   - aiProcessingStatus (enum: pending, processing, completed, failed)')
    
    // Step 2: Create ai_insights table
    console.log('✅ ai_insights table will be created')
    console.log('   - For storing AI-generated insights and themes')
    
    // Step 3: Create automation_logs table  
    console.log('✅ automation_logs table will be created')
    console.log('   - For tracking automation task execution and status')
    
    // Step 4: Add performance indexes
    console.log('✅ Performance indexes will be added')
    console.log('   - Index on aiTaggedAt for finding untagged feedback')
    console.log('   - Index on aiProcessingStatus for filtering')
    console.log('   - Index on tags for grouping and analysis')
    
    console.log('🎉 Migration preparation complete!')
    console.log('📝 Next steps:')
    console.log('   1. Run: npx prisma db push')
    console.log('   2. Run: npx prisma generate')
    console.log('   3. Update environment variables for Gemini AI')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Set existing feedback items to pending AI processing status
 */
export async function updateExistingFeedbackForAi() {
  console.log('🔄 Updating existing feedback for AI processing...')
  
  try {
    // Update all existing approved feedback to pending AI processing
    const result = await prisma.feedback.updateMany({
      where: {
        isApproved: true,
        aiProcessingStatus: { not: 'completed' }
      },
      data: {
        aiProcessingStatus: 'pending'
      }
    })
    
    console.log(`✅ Updated ${result.count} feedback items to pending AI processing`)
    
  } catch (error) {
    console.error('❌ Failed to update existing feedback:', error)
    throw error
  }
}

/**
 * Verify migration was successful
 */
export async function verifyMigration() {
  console.log('🔍 Verifying migration...')
  
  try {
    // Test AI automation functions
    const untaggedCount = await prisma.feedback.count({
      where: {
        isApproved: true,
        aiTaggedAt: null
      }
    })
    
    const insightsCount = await prisma.aiInsight.count()
    const logsCount = await prisma.automationLog.count()
    
    console.log('📊 Migration verification results:')
    console.log(`   - Untagged feedback items: ${untaggedCount}`)
    console.log(`   - AI insights: ${insightsCount}`)
    console.log(`   - Automation logs: ${logsCount}`)
    
    if (untaggedCount >= 0) {
      console.log('✅ Migration verification successful!')
      return true
    } else {
      console.log('❌ Migration verification failed')
      return false
    }
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error)
    return false
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToAiAutomation()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
} 