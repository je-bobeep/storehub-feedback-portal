import { PrismaClient } from '../generated/prisma'
import type { Feedback } from './types'

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
      votedBy: item.userVotes.map(vote => vote.userId)
    }))
  } catch (error) {
    console.error('Error fetching feedback from database:', error)
    throw new Error('Failed to fetch feedback')
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
        tags: JSON.stringify([])
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
      votedBy: newFeedback.userVotes.map(vote => vote.userId)
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
      votedBy: updatedFeedback.userVotes.map(vote => vote.userId)
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
    throw new Error('Failed to create/get user')
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
      votedBy: feedback.userVotes.map(vote => vote.userId)
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
      votedBy: updatedFeedback.userVotes.map(vote => vote.userId)
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
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
} 