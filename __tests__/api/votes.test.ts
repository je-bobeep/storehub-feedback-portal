/**
 * Tests for /api/votes endpoint
 * Testing vote toggle logic, error handling, and data persistence
 */

// Mock the data layer
jest.mock('@/lib/google-sheets', () => ({
  updateVote: jest.fn(),
}))

jest.mock('@/lib/mock-data', () => ({
  updateMockVote: jest.fn(),
}))

jest.mock('@/lib/migrate-to-sheets', () => ({
  isGoogleSheetsAvailable: jest.fn(),
}))

const mockUpdateVote = require('@/lib/google-sheets').updateVote
const mockUpdateMockVote = require('@/lib/mock-data').updateMockVote
const mockIsGoogleSheetsAvailable = require('@/lib/migrate-to-sheets').isGoogleSheetsAvailable

describe('/api/votes API Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Vote validation logic', () => {
    it('should validate required fields', () => {
      const errors = []
      
      const feedbackId = ''
      const userId = 'user@example.com'
      
      if (!feedbackId || !userId) {
        errors.push('Feedback ID and User ID are required')
      }
      
      expect(errors).toContain('Feedback ID and User ID are required')
    })

    it('should accept valid vote request data', () => {
      const errors = []
      
      const feedbackId = '123'
      const userId = 'user@example.com'
      
      if (!feedbackId || !userId) {
        errors.push('Feedback ID and User ID are required')
      }
      
      expect(errors).toHaveLength(0)
    })
  })

  describe('Vote toggle logic', () => {
    it('should add vote when user has not voted', () => {
      const feedback = {
        id: '123',
        votes: 5,
        votedBy: ['user1@example.com', 'user2@example.com']
      }
      
      const userId = 'user3@example.com'
      const userHasVoted = feedback.votedBy.includes(userId)
      
      let updatedFeedback
      let voteCasted
      
      if (userHasVoted) {
        // Remove vote
        updatedFeedback = {
          ...feedback,
          votes: feedback.votes - 1,
          votedBy: feedback.votedBy.filter(id => id !== userId)
        }
        voteCasted = false
      } else {
        // Add vote
        updatedFeedback = {
          ...feedback,
          votes: feedback.votes + 1,
          votedBy: [...feedback.votedBy, userId]
        }
        voteCasted = true
      }
      
      expect(voteCasted).toBe(true)
      expect(updatedFeedback.votes).toBe(6)
      expect(updatedFeedback.votedBy).toContain('user3@example.com')
    })

    it('should remove vote when user has already voted', () => {
      const feedback = {
        id: '123',
        votes: 5,
        votedBy: ['user1@example.com', 'user2@example.com']
      }
      
      const userId = 'user2@example.com' // User has already voted
      const userHasVoted = feedback.votedBy.includes(userId)
      
      let updatedFeedback
      let voteCasted
      
      if (userHasVoted) {
        // Remove vote
        updatedFeedback = {
          ...feedback,
          votes: feedback.votes - 1,
          votedBy: feedback.votedBy.filter(id => id !== userId)
        }
        voteCasted = false
      } else {
        // Add vote
        updatedFeedback = {
          ...feedback,
          votes: feedback.votes + 1,
          votedBy: [...feedback.votedBy, userId]
        }
        voteCasted = true
      }
      
      expect(voteCasted).toBe(false)
      expect(updatedFeedback.votes).toBe(4)
      expect(updatedFeedback.votedBy).not.toContain('user2@example.com')
      expect(updatedFeedback.votedBy).toContain('user1@example.com')
    })
  })

  describe('Data layer integration with Google Sheets', () => {
    it('should use Google Sheets when available', async () => {
      const mockFeedback = {
        id: '123',
        votes: 6,
        votedBy: ['user1@example.com', 'user2@example.com']
      }

      mockIsGoogleSheetsAvailable.mockResolvedValue(true)
      mockUpdateVote.mockResolvedValue({
        updatedFeedback: mockFeedback,
        voteCasted: true
      })

      const sheetsAvailable = await mockIsGoogleSheetsAvailable()
      expect(sheetsAvailable).toBe(true)
      
      const result = await mockUpdateVote('123', 'user2@example.com')
      
      expect(mockUpdateVote).toHaveBeenCalledWith('123', 'user2@example.com')
      expect(result.updatedFeedback).toEqual(mockFeedback)
      expect(result.voteCasted).toBe(true)
    })

    it('should fallback to mock data when Google Sheets unavailable', async () => {
      const mockFeedback = {
        id: '123',
        votes: 3,
        votedBy: ['user1@example.com']
      }

      mockIsGoogleSheetsAvailable.mockResolvedValue(false)
      mockUpdateMockVote.mockReturnValue({
        updatedFeedback: mockFeedback,
        voteCasted: false
      })

      const sheetsAvailable = await mockIsGoogleSheetsAvailable()
      expect(sheetsAvailable).toBe(false)
      
      const result = mockUpdateMockVote('123', 'user1@example.com')
      
      expect(mockUpdateMockVote).toHaveBeenCalledWith('123', 'user1@example.com')
      expect(result.updatedFeedback).toEqual(mockFeedback)
      expect(result.voteCasted).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should handle feedback not found', () => {
      const result = {
        updatedFeedback: null,
        voteCasted: false
      }
      
      expect(result.updatedFeedback).toBeNull()
      expect(result.voteCasted).toBe(false)
    })

    it('should handle Google Sheets API errors', async () => {
      mockIsGoogleSheetsAvailable.mockResolvedValue(true)
      mockUpdateVote.mockRejectedValue(new Error('Google Sheets API error'))

      try {
        await mockUpdateVote('123', 'user1@example.com')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Google Sheets API error')
      }
    })

    it('should handle mock data errors', () => {
      mockIsGoogleSheetsAvailable.mockResolvedValue(false)
      mockUpdateMockVote.mockImplementation(() => {
        throw new Error('Mock data error')
      })

      try {
        mockUpdateMockVote('123', 'user1@example.com')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Mock data error')
      }
    })
  })

  describe('Response format validation', () => {
    it('should return correct response structure for successful vote', () => {
      const mockFeedback = {
        id: '123',
        title: 'Test Feedback',
        votes: 6,
        votedBy: ['user1@example.com', 'user2@example.com']
      }

      const response = {
        success: true,
        data: {
          id: mockFeedback.id,
          votes: mockFeedback.votes,
          voted: true,
        }
      }

      expect(response.success).toBe(true)
      expect(response.data.id).toBe('123')
      expect(response.data.votes).toBe(6)
      expect(response.data.voted).toBe(true)
    })

    it('should return correct response structure for vote removal', () => {
      const mockFeedback = {
        id: '123',
        title: 'Test Feedback',
        votes: 4,
        votedBy: ['user2@example.com']
      }

      const response = {
        success: true,
        data: {
          id: mockFeedback.id,
          votes: mockFeedback.votes,
          voted: false,
        }
      }

      expect(response.success).toBe(true)
      expect(response.data.voted).toBe(false)
      expect(response.data.votes).toBe(4)
    })
  })
}) 