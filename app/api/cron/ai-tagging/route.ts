/**
 * Vercel Cron API Route for AI Tagging
 * 
 * This endpoint is called by Vercel's cron scheduler every 15 minutes
 * to process untagged feedback with AI-generated tags.
 * 
 * Schedule: every 15 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { processUntaggedFeedback } from '@/lib/automation';

/**
 * POST /api/cron/ai-tagging
 * 
 * Processes all untagged feedback items with AI-generated tags
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🕒 Cron job started: AI Tagging');
    
    // Verify cron secret for security
    const cronSecret = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret) {
      console.error('❌ CRON_SECRET environment variable not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' }, 
        { status: 500 }
      );
    }
    
    if (cronSecret !== `Bearer ${expectedSecret}`) {
      console.error('❌ Unauthorized cron request - invalid secret');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Set up timeout protection (Vercel has 30s limit, we use 25s)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 25 seconds'));
      }, 25000);
    });
    
    // Race between the actual work and timeout
    const result = await Promise.race([
      processUntaggedFeedback(),
      timeoutPromise
    ]);
    
    console.log('✅ AI tagging cron job completed:', result);
    
    return NextResponse.json({
      success: result.success,
      processed: result.processed,
      failed: result.failed,
      message: result.success 
        ? `Processed ${result.processed} items, ${result.failed} failed`
        : `Processing failed: ${result.error}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ AI tagging cron job failed:', error);
    
    return NextResponse.json({
      success: false,
      processed: 0,
      failed: 0,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 