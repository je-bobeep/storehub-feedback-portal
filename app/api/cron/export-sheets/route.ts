/**
 * Vercel Cron API Route for Google Sheets Export
 * 
 * This endpoint is called by Vercel's cron scheduler daily at 3 AM
 * to export all feedback and insights to Google Sheets.
 * 
 * Schedule: daily at 3 AM
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportToGoogleSheetsData } from '@/lib/automation';

/**
 * POST /api/cron/export-sheets
 * 
 * Exports all feedback and insights to Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🕒 Cron job started: Google Sheets Export');
    
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
      exportToGoogleSheetsData(),
      timeoutPromise
    ]);
    
    console.log('✅ Google Sheets export cron job completed:', result);
    
    return NextResponse.json({
      success: result.success,
      feedbackRows: result.feedbackRows,
      insightRows: result.insightRows,
      message: result.success 
        ? `Exported ${result.feedbackRows} feedback + ${result.insightRows} insights`
        : `Export failed: ${result.error}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Google Sheets export cron job failed:', error);
    
    return NextResponse.json({
      success: false,
      feedbackRows: 0,
      insightRows: 0,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 