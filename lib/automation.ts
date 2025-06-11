/**
 * Core Automation Functions for Feedback Fusion AI System
 * 
 * This module contains the main automation workflows:
 * - processUntaggedFeedback: AI tagging of new feedback
 * - generateDailyInsights: Group analysis and insight generation  
 * - exportToGoogleSheets: Sync data to Google Sheets
 */

import { generateTags, generateInsights } from './gemini-ai';
import { 
  getUntaggedFeedback, 
  updateFeedbackTags, 
  getTaggedFeedbackByTheme,
  insertAiInsight,
  getUnexportedInsights,
  markInsightsAsExported,
  insertAutomationLog,
  updateAutomationLog,
  getAutomationStatus,
  getAllFeedback
} from './database';
import { exportToGoogleSheets } from './google-sheets';
import { AutomationTaskType, AutomationStatus, AutomationStatusSummary } from './types';

/**
 * Process all untagged feedback items with AI tagging
 * 
 * @returns Promise<{ success: boolean; processed: number; failed: number; error?: string }>
 */
export async function processUntaggedFeedback(): Promise<{ 
  success: boolean; 
  processed: number; 
  failed: number; 
  error?: string 
}> {
  const logId = await insertAutomationLog('ai_tagging', 'running', 'auto');
  
  try {
    console.log('🤖 Starting AI tagging process...');
    
    // Get all feedback that needs AI tagging
    const untaggedFeedback = await getUntaggedFeedback();
    console.log(`📊 Found ${untaggedFeedback.length} items to process`);
    
    if (untaggedFeedback.length === 0) {
      await updateAutomationLog(logId, 'completed', 0);
      return { success: true, processed: 0, failed: 0 };
    }
    
    let processed = 0;
    let failed = 0;
    
    // Process each feedback item
    for (const feedback of untaggedFeedback) {
      try {
        console.log(`🔄 Processing feedback: ${feedback.id} - "${feedback.title}"`);
        
        // Generate tags using AI
        const tagResult = await generateTags(feedback.title, feedback.description);
        
        if (tagResult.success && tagResult.tags.length > 0) {
          // Update feedback with generated tags
          await updateFeedbackTags(feedback.id, tagResult.tags);
          processed++;
          console.log(`✅ Tagged feedback ${feedback.id}: ${tagResult.tags.join(', ')}`);
          
          // Update progress in log
          await updateAutomationLog(logId, 'running', processed, undefined, failed);
        } else {
          failed++;
          console.error(`❌ Failed to tag feedback ${feedback.id}:`, tagResult.error);
        }
        
        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (itemError) {
        failed++;
        console.error(`❌ Error processing feedback ${feedback.id}:`, itemError);
      }
    }
    
    // Complete the automation log
    await updateAutomationLog(logId, 'completed', processed, undefined, failed);
    
    console.log(`🎉 AI tagging completed: ${processed} processed, ${failed} failed`);
    
    return {
      success: true,
      processed,
      failed
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ AI tagging process failed:', error);
    
    await updateAutomationLog(logId, 'failed', 0, errorMessage);
    
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: errorMessage
    };
  }
}

/**
 * Generate daily insights from tagged feedback grouped by themes
 * 
 * @returns Promise<{ success: boolean; insights: number; themes: number; error?: string }>
 */
export async function generateDailyInsights(): Promise<{
  success: boolean;
  insights: number;
  themes: number;
  error?: string;
}> {
  const logId = await insertAutomationLog('insight_generation', 'running', 'auto');
  
  try {
    console.log('🧠 Starting insight generation process...');
    
    // Get all tagged feedback grouped by theme
    const feedbackByTheme = await getTaggedFeedbackByTheme();
    console.log(`📊 Found ${Object.keys(feedbackByTheme).length} themes to analyze`);
    
    if (Object.keys(feedbackByTheme).length === 0) {
      await updateAutomationLog(logId, 'completed', 0);
      return { success: true, insights: 0, themes: 0 };
    }
    
    let insightsGenerated = 0;
    let themesAnalyzed = 0;
    
    // Process each theme that has 2+ feedback items
    for (const [theme, feedbacks] of Object.entries(feedbackByTheme)) {
      try {
        if (feedbacks.length >= 2) {
          console.log(`🔄 Analyzing theme: ${theme} (${feedbacks.length} items)`);
          
          // Generate insights for this theme
          const insightResult = await generateInsights(theme, feedbacks);
          
          if (insightResult.success && insightResult.insight) {
            // Store the insight in database
            await insertAiInsight(insightResult.insight);
            insightsGenerated++;
            console.log(`✅ Generated insight for ${theme}: Priority ${insightResult.insight.priorityScore}`);
          } else {
            console.error(`❌ Failed to generate insight for ${theme}:`, insightResult.error);
          }
          
          themesAnalyzed++;
          
          // Update progress
          await updateAutomationLog(logId, 'running', insightsGenerated);
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`⏭️ Skipping theme ${theme}: only ${feedbacks.length} item(s)`);
        }
        
      } catch (themeError) {
        console.error(`❌ Error analyzing theme ${theme}:`, themeError);
      }
    }
    
    // Complete the automation log
    await updateAutomationLog(logId, 'completed', insightsGenerated);
    
    console.log(`🎉 Insight generation completed: ${insightsGenerated} insights from ${themesAnalyzed} themes`);
    
    return {
      success: true,
      insights: insightsGenerated,
      themes: themesAnalyzed
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Insight generation process failed:', error);
    
    await updateAutomationLog(logId, 'failed', 0, errorMessage);
    
    return {
      success: false,
      insights: 0,
      themes: 0,
      error: errorMessage
    };
  }
}

/**
 * Export all feedback and insights to Google Sheets
 * 
 * @returns Promise<{ success: boolean; feedbackRows: number; insightRows: number; error?: string }>
 */
export async function exportToGoogleSheetsData(): Promise<{
  success: boolean;
  feedbackRows: number;
  insightRows: number;
  error?: string;
}> {
  const logId = await insertAutomationLog('sheets_export', 'running', 'auto');
  
  try {
    console.log('📊 Starting Google Sheets export process...');
    
    // Get all approved feedback for export
    const allFeedback = await getAllFeedback();
    const approvedFeedback = allFeedback.filter(f => f.isApproved);
    
    // Get all unexported insights
    const insights = await getUnexportedInsights();
    
    console.log(`📊 Exporting ${approvedFeedback.length} feedback items and ${insights.length} insights`);
    
    if (approvedFeedback.length === 0 && insights.length === 0) {
      await updateAutomationLog(logId, 'completed', 0);
      return { success: true, feedbackRows: 0, insightRows: 0 };
    }
    
    // Export to Google Sheets using existing function
    await exportToGoogleSheets(approvedFeedback, insights);
    
    // Mark insights as exported
    if (insights.length > 0) {
      await markInsightsAsExported(insights.map(i => i.id));
    }
    
    // Complete the automation log
    const totalRows = approvedFeedback.length + insights.length;
    await updateAutomationLog(logId, 'completed', totalRows);
    
    console.log(`🎉 Google Sheets export completed: ${approvedFeedback.length} feedback + ${insights.length} insights`);
    
    return {
      success: true,
      feedbackRows: approvedFeedback.length,
      insightRows: insights.length
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Google Sheets export failed:', error);
    
    await updateAutomationLog(logId, 'failed', 0, errorMessage);
    
    return {
      success: false,
      feedbackRows: 0,
      insightRows: 0,
      error: errorMessage
    };
  }
}

/**
 * Get current automation status summary for all task types
 * 
 * @returns Promise<AutomationStatusSummary> - Status of all automation tasks
 */
export async function getAutomationStatusSummary(): Promise<AutomationStatusSummary> {
  try {
    const [aiTagging, insights, export_] = await Promise.all([
      getAutomationStatus('ai_tagging'),
      getAutomationStatus('insight_generation'), 
      getAutomationStatus('sheets_export')
    ]);
    
    return {
      aiTagging,
      insights,
      export: export_
    };
    
  } catch (error) {
    console.error('❌ Error getting automation status:', error);
    
    // Return default status on error
    const defaultStatus: AutomationStatus = {
      lastRun: null,
      status: 'failed',
      itemsProcessed: 0,
      errorMessage: 'Failed to retrieve status'
    };
    
    return {
      aiTagging: defaultStatus,
      insights: defaultStatus,
      export: defaultStatus
    };
  }
}

/**
 * Manual trigger for any automation task type
 * Used by admin interface for manual execution
 * 
 * @param taskType - Type of automation task to trigger
 * @param triggeredBy - Who triggered the task (for logging)
 * @returns Promise<{ success: boolean; message: string; data?: any }>
 */
export async function triggerAutomationTask(
  taskType: AutomationTaskType, 
  triggeredBy: string = 'manual'
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log(`🚀 Manual trigger: ${taskType} by ${triggeredBy}`);
    
    switch (taskType) {
      case 'ai_tagging':
        const taggingResult = await processUntaggedFeedback();
        return {
          success: taggingResult.success,
          message: taggingResult.success 
            ? `AI tagging completed: ${taggingResult.processed} processed, ${taggingResult.failed} failed`
            : `AI tagging failed: ${taggingResult.error}`,
          data: taggingResult
        };
        
      case 'insight_generation':
        const insightResult = await generateDailyInsights();
        return {
          success: insightResult.success,
          message: insightResult.success
            ? `Insights generated: ${insightResult.insights} insights from ${insightResult.themes} themes`
            : `Insight generation failed: ${insightResult.error}`,
          data: insightResult
        };
        
      case 'sheets_export':
        const exportResult = await exportToGoogleSheetsData();
        return {
          success: exportResult.success,
          message: exportResult.success
            ? `Sheets export completed: ${exportResult.feedbackRows} feedback + ${exportResult.insightRows} insights`
            : `Sheets export failed: ${exportResult.error}`,
          data: exportResult
        };
        
      default:
        return {
          success: false,
          message: `Unknown task type: ${taskType}`
        };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`❌ Manual trigger failed for ${taskType}:`, error);
    
    return {
      success: false,
      message: `Manual trigger failed: ${errorMessage}`
    };
  }
} 