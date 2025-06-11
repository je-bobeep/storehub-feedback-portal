import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    // Get feedback items that need AI tagging (empty tags array or null)
    const untaggedFeedback = await prisma.feedback.findMany({
      where: {
        isApproved: true,
        OR: [
          { tags: { equals: '[]' } }, // Empty JSON array
          { tags: { equals: null } },  // Null tags
          { tags: { equals: '' } }     // Empty string
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        subCategory: true,
        createdAt: true,
        votes: true
      },
      orderBy: {
        votes: 'desc' // Prioritize high-voted items for tagging
      },
      take: 20 // Limit to prevent overwhelming AI API
    })

    return NextResponse.json({
      success: true,
      data: untaggedFeedback,
      meta: {
        count: untaggedFeedback.length,
        timestamp: new Date().toISOString(),
        message: untaggedFeedback.length > 0 
          ? `Found ${untaggedFeedback.length} feedback items ready for AI tagging`
          : 'No untagged feedback found - all items are up to date!'
      }
    })
  } catch (error) {
    console.error('❌ Error in GET /api/admin/analytics/untagged:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch untagged feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 