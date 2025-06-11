'use client'

import { Feedback } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface FeedbackItemProps {
  feedback: Feedback
  onVote: (feedbackId: string) => void
}

export default function FeedbackItem({ feedback, onVote }: FeedbackItemProps) {
  const { user } = useAuth();

  const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG['Under Review']

  const handleVoteClick = () => {
    onVote(feedback.id);
  }

  const hasVoted = user && feedback.votedBy?.includes(user.email);

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-4">
        <div className="flex-shrink-0">
          <Button 
            variant={hasVoted ? 'default' : 'outline'}
            size="sm"
            className="flex flex-col h-auto p-2 gap-0"
            onClick={handleVoteClick}
            disabled={!user}
            aria-label={`Upvote ${feedback.title}`}
          >
            <ArrowUp className={cn('h-5 w-5', hasVoted && 'text-white')} />
            <span className="text-sm font-bold">{feedback.votes}</span>
          </Button>
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg font-semibold">{feedback.title}</CardTitle>
          <CardDescription className="text-sm mt-1">{feedback.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          <Badge variant="secondary">{feedback.category}</Badge>
          {feedback.subCategory && <Badge variant="outline">{feedback.subCategory}</Badge>}
        </div>
        <Badge
          className={cn(
            'text-xs font-semibold',
            statusConfig.bgColor,
            statusConfig.textColor
          )}
        >
          {feedback.status}
        </Badge>
      </CardContent>
    </Card>
  )
} 