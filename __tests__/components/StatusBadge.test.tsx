import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders with submitted status', () => {
    render(<StatusBadge status="Submitted" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
  })

  it('renders with in progress status', () => {
    render(<StatusBadge status="In Progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders with completed status', () => {
    render(<StatusBadge status="Completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<StatusBadge status="Submitted" className="custom-class" />)
    const badge = screen.getByText('Submitted')
    expect(badge).toHaveClass('custom-class')
  })

  it('applies status-specific colors', () => {
    render(<StatusBadge status="Completed" />)
    const badge = screen.getByText('Completed')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })
}) 