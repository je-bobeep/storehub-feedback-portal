import { NextRequest, NextResponse } from 'next/server'
import { VoteResponse } from '@/lib/types'
import { toggleVote, upsertUser } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { feedbackId, userId } = await request.json()

    if (!feedbackId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Feedback ID and User ID are required'
      }, { status: 400 })
    }

    // Create or get user (userId is actually the user's email)
    const userDbId = await upsertUser(userId)

    // Toggle vote in database
    const result = await toggleVote(feedbackId, userDbId)
    const { updatedFeedback, voteCasted } = result

    if (!updatedFeedback) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 })
    }

    const response: VoteResponse = {
      success: true,
      data: {
        id: updatedFeedback.id,
        votes: updatedFeedback.votes,
        voted: voteCasted,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error in POST /api/votes:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to update vote'
    }, { status: 500 })
  }
} 