import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FeedbackCard } from '@/components/FeedbackCard'
import { Feedback } from '@/lib/types'

const mockFeedback: Feedback = {
  id: '1',
  title: 'Test Feedback',
  description: 'This is a test feedback description',
  status: 'Submitted',
  votes: 5,
  submittedAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  isApproved: true,
  tags: ['UI/UX', 'Enhancement']
}

describe('FeedbackCard', () => {
  it('renders feedback information correctly', () => {
    render(<FeedbackCard feedback={mockFeedback} />)
    
    expect(screen.getByText('Test Feedback')).toBeInTheDocument()
    expect(screen.getByText('This is a test feedback description')).toBeInTheDocument()
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('UI/UX')).toBeInTheDocument()
    expect(screen.getByText('Enhancement')).toBeInTheDocument()
  })

  it('displays formatted date', () => {
    render(<FeedbackCard feedback={mockFeedback} />)
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
  })

  it('calls onVote when vote button is clicked', async () => {
    const mockOnVote = jest.fn().mockResolvedValue(undefined)
    render(<FeedbackCard feedback={mockFeedback} onVote={mockOnVote} />)
    
    const voteButton = screen.getByRole('button')
    fireEvent.click(voteButton)
    
    expect(mockOnVote).toHaveBeenCalledWith('1')
  })

  it('shows optimistic vote count update', async () => {
    const mockOnVote = jest.fn().mockResolvedValue(undefined)
    render(<FeedbackCard feedback={mockFeedback} onVote={mockOnVote} />)
    
    const voteButton = screen.getByRole('button')
    fireEvent.click(voteButton)
    
    // Should show incremented vote count immediately
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('disables vote button after voting', async () => {
    const mockOnVote = jest.fn().mockResolvedValue(undefined)
    render(<FeedbackCard feedback={mockFeedback} onVote={mockOnVote} />)
    
    const voteButton = screen.getByRole('button')
    fireEvent.click(voteButton)
    
    expect(voteButton).toBeDisabled()
  })

  it('handles vote error gracefully', async () => {
    const mockOnVote = jest.fn().mockRejectedValue(new Error('Vote failed'))
    render(<FeedbackCard feedback={mockFeedback} onVote={mockOnVote} />)
    
    const voteButton = screen.getByRole('button')
    fireEvent.click(voteButton)
    
    // Should revert vote count on error
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('renders without tags section when no tags', () => {
    const feedbackWithoutTags = { ...mockFeedback, tags: [] }
    render(<FeedbackCard feedback={feedbackWithoutTags} />)
    
    expect(screen.queryByText('UI/UX')).not.toBeInTheDocument()
    expect(screen.queryByText('Enhancement')).not.toBeInTheDocument()
  })
}) 