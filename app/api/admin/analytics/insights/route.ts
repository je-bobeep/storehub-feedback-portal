import { NextResponse } from 'next/server'
import { getAllFeedback } from '@/lib/database'

export async function GET() {
  try {
    // Get all feedback from database
    const allFeedback = await getAllFeedback()
    
    // Aggregate data for insights
    const insights = {
      // Basic counts
      totalFeedback: allFeedback.length,
      approvedFeedback: allFeedback.filter(f => f.isApproved).length,
      totalVotes: allFeedback.reduce((sum, f) => sum + f.votes, 0),
      
      // Status distribution  
      statusBreakdown: {
        underReview: allFeedback.filter(f => f.status === 'Under Review').length,
        inProgress: allFeedback.filter(f => f.status === 'In Progress').length,
        completed: allFeedback.filter(f => f.status === 'Completed').length
      },
      
      // Category distribution
      categoryBreakdown: {
        BeepGPT: allFeedback.filter(f => f.category === 'BeepGPT').length,
        BeyondWords: allFeedback.filter(f => f.category === 'BeyondWords').length,
        Beep: allFeedback.filter(f => f.category === 'Beep').length
      },
      
      // Top voted items (for AI to analyze patterns)
      topVotedItems: allFeedback
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10)
        .map(f => ({
          id: f.id,
          title: f.title,
          description: f.description,
          votes: f.votes,
          category: f.category,
          tags: f.tags || []
        })),
      
      // Tag analysis (for clustering similar feedback)
      tagFrequency: (() => {
        const tagCounts: Record<string, number> = {}
        const taggedFeedback: any[] = []
        
        allFeedback.forEach(f => {
          if (f.tags && f.tags.length > 0) {
            taggedFeedback.push({
              id: f.id,
              title: f.title,
              votes: f.votes,
              tags: f.tags
            })
            
            f.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        })
        
        return {
          counts: tagCounts,
          totalTaggedItems: taggedFeedback.length,
          totalUntaggedItems: allFeedback.length - taggedFeedback.length,
          taggedFeedback: taggedFeedback.slice(0, 20) // Limit for AI processing
        }
      })(),
      
      // Recent trends (last 30 days)
      recentTrends: (() => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentFeedback = allFeedback.filter(f => 
          new Date(f.createdAt) > thirtyDaysAgo
        )
        
        return {
          recentSubmissions: recentFeedback.length,
          recentVotes: recentFeedback.reduce((sum, f) => sum + f.votes, 0),
          averageVotesPerItem: recentFeedback.length > 0 
            ? recentFeedback.reduce((sum, f) => sum + f.votes, 0) / recentFeedback.length 
            : 0,
          mostActiveCategory: (() => {
            const categoryCounts = recentFeedback.reduce((acc, f) => {
              acc[f.category] = (acc[f.category] || 0) + 1
              return acc
            }, {} as Record<string, number>)
            
            return Object.entries(categoryCounts)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
          })()
        }
      })()
    }

    return NextResponse.json({
      success: true,
      data: insights,
      meta: {
        generatedAt: new Date().toISOString(),
        dataPoints: allFeedback.length,
        message: 'Analytics insights ready for AI processing'
      }
    })
  } catch (error) {
    console.error('❌ Error in GET /api/admin/analytics/insights:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 