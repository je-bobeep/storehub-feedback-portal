import { Feedback } from './types'

export const mockFeedback: Feedback[] = [
  {
    id: '1',
    title: 'Dark mode support',
    description: 'Please add a dark mode toggle to the interface. It would help reduce eye strain during long usage sessions and provide a more modern user experience.',
    status: 'In Progress',
    votes: 42,
    submittedAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    isApproved: true,
    moderatedAt: '2024-01-16T09:15:00Z',
    moderatedBy: 'admin',
    tags: ['UI/UX', 'Enhancement'],
    category: 'POS',
    subCategory: 'Hardware',
    votedBy: ['testuser@example.com']
  },
  {
    id: '2',
    title: 'Export sales reports to CSV',
    description: 'Add functionality to export all sales reports to CSV format for analysis and reporting purposes. This would be useful for business managers.',
    status: 'Under Review',
    votes: 28,
    submittedAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    isApproved: true,
    moderatedAt: '2024-01-19T08:30:00Z',
    moderatedBy: 'admin',
    tags: ['Export', 'Data'],
    category: 'BackOffice',
    subCategory: 'Reports',
    votedBy: []
  },
  {
    id: '3',
    title: 'Mobile POS application',
    description: 'Develop a mobile application that allows cashiers to process orders on-the-go. This would increase flexibility and make it easier for staff to serve customers.',
    status: 'Completed',
    votes: 56,
    submittedAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-25T10:15:00Z',
    isApproved: true,
    moderatedAt: '2024-01-11T13:20:00Z',
    moderatedBy: 'admin',
    tags: ['Mobile', 'App', 'Enhancement'],
    category: 'POS',
    subCategory: 'Order management',
    votedBy: []
  },
  {
    id: '4',
    title: 'Email notifications for inventory alerts',
    description: 'Send email notifications to managers when inventory levels are low or when products are out of stock.',
    status: 'Under Review',
    votes: 19,
    submittedAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    isApproved: true,
    moderatedAt: '2024-01-21T09:45:00Z',
    moderatedBy: 'admin',
    tags: ['Notifications', 'Email'],
    category: 'BackOffice',
    subCategory: 'Stock management',
    votedBy: []
  },
  {
    id: '5',
    title: 'Advanced payment processing',
    description: 'Implement support for multiple payment methods including contactless cards, mobile payments, and digital wallets.',
    status: 'In Progress',
    votes: 33,
    submittedAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-22T15:10:00Z',
    isApproved: true,
    moderatedAt: '2024-01-13T10:00:00Z',
    moderatedBy: 'admin',
    tags: ['Payments', 'Enhancement'],
    category: 'POS',
    subCategory: 'Payments',
    votedBy: []
  },
  {
    id: '6',
    title: 'Employee performance tracking',
    description: 'Add functionality to track employee sales performance, working hours, and customer service metrics for better management insights.',
    status: 'Under Review',
    votes: 15,
    submittedAt: '2024-01-22T09:15:00Z',
    updatedAt: '2024-01-22T09:15:00Z',
    isApproved: true,
    moderatedAt: '2024-01-23T08:20:00Z',
    moderatedBy: 'admin',
    tags: ['Management', 'Analytics'],
    category: 'BackOffice',
    subCategory: 'Employee management',
    votedBy: ['testuser@example.com']
  }
]

// Mock rate limiting storage (in-memory for development)
export const mockRateLimits = new Map<string, { count: number; resetTime: number }>()

// Helper function to get sorted feedback
export function getSortedFeedback(sortBy: 'votes' | 'date' = 'votes'): Feedback[] {
  const sorted = [...mockFeedback]
  
  if (sortBy === 'votes') {
    return sorted.sort((a, b) => b.votes - a.votes)
  } else {
    return sorted.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }
}

// Helper function to simulate adding feedback
export function addMockFeedback(title: string, description: string, category: string, subCategory?: string): Feedback {
  const newFeedback: Feedback = {
    id: Date.now().toString(),
    title,
    description,
    status: 'Under Review',
    votes: 0,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isApproved: true, // Now appears immediately
    tags: [],
    category: category as any,
    subCategory: subCategory as any
  }
  
  mockFeedback.push(newFeedback)
  return newFeedback
}

/**
 * Toggles a vote for a feedback item in the mock data
 * @returns The updated feedback item and whether the vote was added or removed
 */
export function updateMockVote(feedbackId: string, userId: string): { updatedFeedback: Feedback | null; voteCasted: boolean } {
  const feedback = mockFeedback.find(f => f.id === feedbackId)
  if (!feedback) {
    return { updatedFeedback: null, voteCasted: false };
  }

  const votedBy = feedback.votedBy || [];
  const userVoteIndex = votedBy.indexOf(userId);

  if (userVoteIndex > -1) {
    // User has already voted, so remove vote
    votedBy.splice(userVoteIndex, 1);
    feedback.votes -= 1;
    feedback.votedBy = votedBy;
    return { updatedFeedback: feedback, voteCasted: false };
  } else {
    // User has not voted, so add vote
    votedBy.push(userId);
    feedback.votes += 1;
    feedback.votedBy = votedBy;
    return { updatedFeedback: feedback, voteCasted: true };
  }
}

/**
 * Increment vote count for feedback (DEPRECATED - use updateMockVote)
 */
export function incrementMockVote(feedbackId: string): Feedback | null {
  const feedback = mockFeedback.find(f => f.id === feedbackId)
  if (feedback) {
    feedback.votes += 1
  }
  return feedback || null
}

 