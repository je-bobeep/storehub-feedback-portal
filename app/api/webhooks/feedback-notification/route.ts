import { NextResponse } from 'next/server'
import { getFeedbackById } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { feedbackId, event, timestamp } = await request.json()

    // Validate required fields
    if (!feedbackId || !event) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: feedbackId, event'
      }, { status: 400 })
    }

    // Get the feedback item details
    const feedback = await getFeedbackById(feedbackId)
    
    if (!feedback) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 })
    }

    // Prepare webhook payload for n8n workflows
    const webhookPayload = {
      event, // 'feedback.created', 'feedback.updated', 'feedback.voted'
      timestamp: timestamp || new Date().toISOString(),
      feedback: {
        id: feedback.id,
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        subCategory: feedback.subCategory,
        status: feedback.status,
        votes: feedback.votes,
        tags: feedback.tags || [],
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        isApproved: feedback.isApproved
      }
    }

    // Log the webhook for debugging
    console.log(`🔔 Webhook triggered: ${event} for feedback ${feedbackId}`)
    
    // Here we would typically send to external webhook URLs
    // For now, we'll just return success to indicate the webhook was processed
    // In a real implementation, you might:
    // 1. Send to n8n webhook URL
    // 2. Queue the notification for retry if it fails
    // 3. Log the delivery status
    
    // Example of what you'd do with external webhook:
    // if (process.env.N8N_WEBHOOK_URL) {
    //   await fetch(process.env.N8N_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(webhookPayload)
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        event,
        feedbackId,
        processed: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Error in POST /api/webhooks/feedback-notification:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for webhook testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Feedback notification webhook endpoint is active',
    info: {
      method: 'POST',
      requiredFields: ['feedbackId', 'event'],
      supportedEvents: [
        'feedback.created',
        'feedback.updated', 
        'feedback.voted'
      ],
      examplePayload: {
        feedbackId: '12345',
        event: 'feedback.created',
        timestamp: new Date().toISOString()
      }
    }
  })
} 