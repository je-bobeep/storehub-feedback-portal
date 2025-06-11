import { PrismaClient } from '../generated/prisma'
import type { Feedback, AiInsight, AutomationLog, AutomationTaskType, AutomationStatus } from './types'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions

/**
 * Get all approved feedback, sorted by votes (descending)
 */
export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        isApproved: true
      },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: [
        { votes: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform to match our Feedback type
    return feedbackItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: item.votes,
      tags: item.tags ? JSON.parse(item.tags) : [],
      category: item.category as any,
      subCategory: item.subCategory as any,
      submittedAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      isApproved: item.isApproved,
      votedBy: item.userVotes.map(vote => vote.userId),
      aiTaggedAt: item.aiTaggedAt?.toISOString(),
      aiProcessingStatus: item.aiProcessingStatus as any
    }))
  } catch (error) {
    console.error('Error fetching feedback from database:', error)
    throw new Error('Failed to fetch feedback')
  }
}

/**
 * Get untagged feedback for AI processing
 */
export async function getUntaggedFeedback(): Promise<Feedback[]> {
  try {
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        isApproved: true,
        aiTaggedAt: null,
        aiProcessingStatus: 'pending'
      },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 50 // Limit to 50 items per run
    })

    return feedbackItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: item.votes,
      tags: item.tags ? JSON.parse(item.tags) : [],
      category: item.category as any,
      subCategory: item.subCategory as any,
      submittedAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      isApproved: item.isApproved,
      votedBy: item.userVotes.map(vote => vote.userId),
      aiTaggedAt: item.aiTaggedAt?.toISOString(),
      aiProcessingStatus: item.aiProcessingStatus as any
    }))
  } catch (error) {
    console.error('Error fetching untagged feedback:', error)
    throw new Error('Failed to fetch untagged feedback')
  }
}

/**
 * Update feedback with AI-generated tags
 */
export async function updateFeedbackTags(
  id: string, 
  tags: string[], 
  taggedAt: Date
): Promise<void> {
  try {
    await prisma.feedback.update({
      where: { id },
      data: {
        tags: JSON.stringify(tags),
        aiTaggedAt: taggedAt,
        aiProcessingStatus: 'completed'
      }
    })
  } catch (error) {
    console.error('Error updating feedback tags:', error)
    throw new Error('Failed to update feedback tags')
  }
}

/**
 * Get tagged feedback grouped by primary theme
 */
export async function getTaggedFeedbackByTheme(): Promise<{ theme: string, feedbacks: Feedback[] }[]> {
  try {
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        isApproved: true,
        aiTaggedAt: { not: null },
        tags: { not: null }
      },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { votes: 'desc' }
    })

    // Group by primary tag (first tag in the array)
    const groupedFeedback: { [theme: string]: Feedback[] } = {}

    for (const item of feedbackItems) {
      const tags = item.tags ? JSON.parse(item.tags) : []
      const primaryTag = tags[0] || 'Uncategorized'

      const feedbackItem: Feedback = {
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status as 'Under Review' | 'In Progress' | 'Completed',
        votes: item.votes,
        tags: tags,
        category: item.category as any,
        subCategory: item.subCategory as any,
        submittedAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        isApproved: item.isApproved,
        votedBy: item.userVotes.map(vote => vote.userId),
        aiTaggedAt: item.aiTaggedAt?.toISOString(),
        aiProcessingStatus: item.aiProcessingStatus as any
      }

      if (!groupedFeedback[primaryTag]) {
        groupedFeedback[primaryTag] = []
      }
      groupedFeedback[primaryTag].push(feedbackItem)
    }

    // Convert to array format and filter themes with 2+ items
    return Object.entries(groupedFeedback)
      .filter(([_, feedbacks]) => feedbacks.length >= 2)
      .map(([theme, feedbacks]) => ({ theme, feedbacks }))
  } catch (error) {
    console.error('Error getting tagged feedback by theme:', error)
    throw new Error('Failed to get tagged feedback by theme')
  }
}

/**
 * Insert AI-generated insight
 */
export async function insertAiInsight(insight: Omit<AiInsight, 'id' | 'generatedAt'>): Promise<void> {
  try {
    await prisma.aiInsight.create({
      data: {
        theme: insight.theme,
        insightSummary: insight.insightSummary,
        priorityScore: insight.priorityScore,
        feedbackCount: insight.feedbackCount,
        sampleFeedbackIds: JSON.stringify(insight.sampleFeedbackIds),
        exportedAt: insight.exportedAt ? new Date(insight.exportedAt) : null
      }
    })
  } catch (error) {
    console.error('Error inserting AI insight:', error)
    throw new Error('Failed to insert AI insight')
  }
}

/**
 * Get unexported AI insights
 */
export async function getUnexportedInsights(): Promise<AiInsight[]> {
  try {
    const insights = await prisma.aiInsight.findMany({
      where: {
        exportedAt: null
      },
      orderBy: { priorityScore: 'desc' }
    })

    return insights.map(insight => ({
      id: insight.id,
      theme: insight.theme,
      insightSummary: insight.insightSummary,
      priorityScore: insight.priorityScore,
      feedbackCount: insight.feedbackCount,
      sampleFeedbackIds: insight.sampleFeedbackIds ? JSON.parse(insight.sampleFeedbackIds) : [],
      generatedAt: insight.generatedAt.toISOString(),
      exportedAt: insight.exportedAt?.toISOString()
    }))
  } catch (error) {
    console.error('Error getting unexported insights:', error)
    throw new Error('Failed to get unexported insights')
  }
}

/**
 * Mark insights as exported
 */
export async function markInsightsAsExported(insightIds: string[]): Promise<void> {
  try {
    await prisma.aiInsight.updateMany({
      where: {
        id: { in: insightIds }
      },
      data: {
        exportedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error marking insights as exported:', error)
    throw new Error('Failed to mark insights as exported')
  }
}

/**
 * Insert automation log
 */
export async function insertAutomationLog(
  taskType: AutomationTaskType,
  status: AutomationStatus,
  triggeredBy: 'auto' | 'manual' | 'admin'
): Promise<string> {
  try {
    const log = await prisma.automationLog.create({
      data: {
        taskType,
        status,
        triggeredBy
      }
    })
    return log.id
  } catch (error) {
    console.error('Error inserting automation log:', error)
    throw new Error('Failed to insert automation log')
  }
}

/**
 * Update automation log
 */
export async function updateAutomationLog(
  id: string,
  status: AutomationStatus,
  itemsProcessed: number,
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.automationLog.update({
      where: { id },
      data: {
        status,
        itemsProcessed,
        errorMessage,
        completedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating automation log:', error)
    throw new Error('Failed to update automation log')
  }
}

/**
 * Get automation status for a specific task type
 */
export async function getAutomationStatus(taskType: AutomationTaskType): Promise<AutomationLog | null> {
  try {
    const log = await prisma.automationLog.findFirst({
      where: { taskType },
      orderBy: { startedAt: 'desc' }
    })

    if (!log) return null

    return {
      id: log.id,
      taskType: log.taskType as AutomationTaskType,
      status: log.status as AutomationStatus,
      startedAt: log.startedAt.toISOString(),
      completedAt: log.completedAt?.toISOString(),
      itemsProcessed: log.itemsProcessed,
      errorMessage: log.errorMessage,
      triggeredBy: log.triggeredBy as 'auto' | 'manual' | 'admin'
    }
  } catch (error) {
    console.error('Error getting automation status:', error)
    throw new Error('Failed to get automation status')
  }
}

/**
 * Get recent automation logs
 */
export async function getRecentAutomationLogs(limit: number = 10): Promise<AutomationLog[]> {
  try {
    const logs = await prisma.automationLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit
    })

    return logs.map(log => ({
      id: log.id,
      taskType: log.taskType as AutomationTaskType,
      status: log.status as AutomationStatus,
      startedAt: log.startedAt.toISOString(),
      completedAt: log.completedAt?.toISOString(),
      itemsProcessed: log.itemsProcessed,
      errorMessage: log.errorMessage,
      triggeredBy: log.triggeredBy as 'auto' | 'manual' | 'admin'
    }))
  } catch (error) {
    console.error('Error getting recent automation logs:', error)
    throw new Error('Failed to get recent automation logs')
  }
}

/**
 * Create new feedback item
 */
export async function createFeedback(feedbackData: {
  title: string
  description: string
  category: string
  subCategory?: string
  submittedBy?: string
}): Promise<Feedback> {
  try {
    const newFeedback = await prisma.feedback.create({
      data: {
        title: feedbackData.title,
        description: feedbackData.description,
        category: feedbackData.category,
        subCategory: feedbackData.subCategory || null,
        submittedBy: feedbackData.submittedBy || null,
        status: 'Under Review',
        votes: 0,
        isApproved: true, // Auto-approve for now
        tags: JSON.stringify([]),
        aiProcessingStatus: 'pending'
      },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      }
    })

    return {
      id: newFeedback.id,
      title: newFeedback.title,
      description: newFeedback.description,
      status: newFeedback.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: newFeedback.votes,
      tags: newFeedback.tags ? JSON.parse(newFeedback.tags) : [],
      category: newFeedback.category as any,
      subCategory: newFeedback.subCategory as any,
      submittedAt: newFeedback.createdAt.toISOString(),
      updatedAt: newFeedback.updatedAt.toISOString(),
      isApproved: newFeedback.isApproved,
      votedBy: newFeedback.userVotes.map(vote => vote.userId),
      aiTaggedAt: newFeedback.aiTaggedAt?.toISOString(),
      aiProcessingStatus: newFeedback.aiProcessingStatus as any
    }
  } catch (error) {
    console.error('Error creating feedback:', error)
    throw new Error('Failed to create feedback')
  }
}

/**
 * Toggle vote for feedback item
 */
export async function toggleVote(feedbackId: string, userId: string): Promise<{
  updatedFeedback: Feedback
  voteCasted: boolean
}> {
  try {
    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_feedbackId: {
          userId,
          feedbackId
        }
      }
    })

    let voteCasted: boolean

    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: {
          id: existingVote.id
        }
      })

      // Decrement vote count
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          votes: {
            decrement: 1
          }
        }
      })

      voteCasted = false
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId,
          feedbackId
        }
      })

      // Increment vote count
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          votes: {
            increment: 1
          }
        }
      })

      voteCasted = true
    }

    // Get updated feedback
    const updatedFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!updatedFeedback) {
      throw new Error('Feedback not found')
    }

    const feedbackResult: Feedback = {
      id: updatedFeedback.id,
      title: updatedFeedback.title,
      description: updatedFeedback.description,
      status: updatedFeedback.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: updatedFeedback.votes,
      tags: updatedFeedback.tags ? JSON.parse(updatedFeedback.tags) : [],
      category: updatedFeedback.category as any,
      subCategory: updatedFeedback.subCategory as any,
      submittedAt: updatedFeedback.createdAt.toISOString(),
      updatedAt: updatedFeedback.updatedAt.toISOString(),
      isApproved: updatedFeedback.isApproved,
      votedBy: updatedFeedback.userVotes.map(vote => vote.userId),
      aiTaggedAt: updatedFeedback.aiTaggedAt?.toISOString(),
      aiProcessingStatus: updatedFeedback.aiProcessingStatus as any
    }

    return {
      updatedFeedback: feedbackResult,
      voteCasted
    }
  } catch (error) {
    console.error('Error toggling vote:', error)
    throw new Error('Failed to update vote')
  }
}

/**
 * Create or get user by email
 */
export async function upsertUser(email: string, username?: string): Promise<string> {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username: username || email.split('@')[0]
      }
    })
    return user.id
  } catch (error) {
    console.error('Error upserting user:', error)
    throw new Error('Failed to create or update user')
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: string): Promise<Feedback | null> {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!feedback) return null

    return {
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      status: feedback.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: feedback.votes,
      tags: feedback.tags ? JSON.parse(feedback.tags) : [],
      category: feedback.category as any,
      subCategory: feedback.subCategory as any,
      submittedAt: feedback.createdAt.toISOString(),
      updatedAt: feedback.updatedAt.toISOString(),
      isApproved: feedback.isApproved,
      votedBy: feedback.userVotes.map(vote => vote.userId),
      aiTaggedAt: feedback.aiTaggedAt?.toISOString(),
      aiProcessingStatus: feedback.aiProcessingStatus as any
    }
  } catch (error) {
    console.error('Error fetching feedback by ID:', error)
    throw new Error('Failed to fetch feedback')
  }
}

/**
 * Update feedback status (for admin use)
 */
export async function updateFeedbackStatus(
  id: string, 
  status: 'Under Review' | 'In Progress' | 'Completed'
): Promise<Feedback> {
  try {
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: { status },
      include: {
        userVotes: {
          select: {
            userId: true
          }
        }
      }
    })

    return {
      id: updatedFeedback.id,
      title: updatedFeedback.title,
      description: updatedFeedback.description,
      status: updatedFeedback.status as 'Under Review' | 'In Progress' | 'Completed',
      votes: updatedFeedback.votes,
      tags: updatedFeedback.tags ? JSON.parse(updatedFeedback.tags) : [],
      category: updatedFeedback.category as any,
      subCategory: updatedFeedback.subCategory as any,
      submittedAt: updatedFeedback.createdAt.toISOString(),
      updatedAt: updatedFeedback.updatedAt.toISOString(),
      isApproved: updatedFeedback.isApproved,
      votedBy: updatedFeedback.userVotes.map(vote => vote.userId),
      aiTaggedAt: updatedFeedback.aiTaggedAt?.toISOString(),
      aiProcessingStatus: updatedFeedback.aiProcessingStatus as any
    }
  } catch (error) {
    console.error('Error updating feedback status:', error)
    throw new Error('Failed to update feedback status')
  }
}

/**
 * Check database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
} 