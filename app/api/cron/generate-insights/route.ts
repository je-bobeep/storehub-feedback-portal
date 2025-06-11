/**
 * Vercel Cron API Route for Insight Generation
 * 
 * This endpoint is called by Vercel's cron scheduler daily at 2 AM
 * to generate insights from tagged feedback grouped by themes.
 * 
 * Schedule: daily at 2 AM
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyInsights } from '@/lib/automation';

/**
 * POST /api/cron/generate-insights
 * 
 * Generates insights from tagged feedback grouped by themes
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🕒 Cron job started: Insight Generation');
    
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
      generateDailyInsights(),
      timeoutPromise
    ]);
    
    console.log('✅ Insight generation cron job completed:', result);
    
    return NextResponse.json({
      success: result.success,
      insights: result.insights,
      themes: result.themes,
      message: result.success 
        ? `Generated ${result.insights} insights from ${result.themes} themes`
        : `Insight generation failed: ${result.error}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Insight generation cron job failed:', error);
    
    return NextResponse.json({
      success: false,
      insights: 0,
      themes: 0,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 