import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tags } = await request.json()
    
    // Validate that tags is an array
    if (!Array.isArray(tags)) {
      return NextResponse.json({
        success: false,
        error: 'Tags must be an array of strings'
      }, { status: 400 })
    }

    // Validate tags array (max 5 tags, each max 30 chars)
    const validatedTags = tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim())
      .slice(0, 5) // Limit to 5 tags max

    if (validatedTags.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one valid tag is required'
      }, { status: 400 })
    }

    // Update feedback with AI-generated tags
    const updatedFeedback = await prisma.feedback.update({
      where: { id: params.id },
      data: {
        tags: JSON.stringify(validatedTags),
        updatedAt: new Date()
      },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!updatedFeedback) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 })
    }

    console.log(`✅ AI tags updated for feedback ${params.id}: ${validatedTags.join(', ')}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedFeedback.id,
        title: updatedFeedback.title,
        tags: validatedTags,
        updatedAt: updatedFeedback.updatedAt.toISOString()
      },
      message: `Successfully updated feedback with ${validatedTags.length} AI-generated tags`
    })
  } catch (error) {
    console.error(`❌ Error updating tags for feedback ${params.id}:`, error)
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update feedback tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 