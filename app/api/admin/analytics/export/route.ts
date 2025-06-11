import { NextResponse } from 'next/server'
import { getAllFeedback } from '@/lib/database'

export async function GET() {
  try {
    // Get all feedback from database with full details
    const allFeedback = await getAllFeedback()
    
    // Format data for export with additional metadata
    const exportData = allFeedback.map(feedback => ({
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      status: feedback.status,
      votes: feedback.votes,
      tags: feedback.tags || [],
      category: feedback.category,
      subCategory: feedback.subCategory,
      submittedAt: feedback.submittedAt,
      updatedAt: feedback.updatedAt,
      isApproved: feedback.isApproved,
      votedBy: feedback.votedBy || [],
      voteCount: feedback.votedBy?.length || 0
    }))

    return NextResponse.json({
      success: true,
      data: exportData,
      meta: {
        totalCount: exportData.length,
        exportTimestamp: new Date().toISOString(),
        statuses: {
          underReview: exportData.filter(f => f.status === 'Under Review').length,
          inProgress: exportData.filter(f => f.status === 'In Progress').length,
          completed: exportData.filter(f => f.status === 'Completed').length
        },
        categories: {
          BeepGPT: exportData.filter(f => f.category === 'BeepGPT').length,
          BeyondWords: exportData.filter(f => f.category === 'BeyondWords').length,
          Beep: exportData.filter(f => f.category === 'Beep').length
        },
        totalVotes: exportData.reduce((sum, f) => sum + f.votes, 0)
      }
    })
  } catch (error) {
    console.error('❌ Error in GET /api/admin/analytics/export:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to export feedback data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 