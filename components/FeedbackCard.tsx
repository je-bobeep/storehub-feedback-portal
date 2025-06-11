'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "./StatusBadge"
import { Feedback } from "@/lib/types"
import { ChevronUp, Clock, Calendar } from "lucide-react"

interface FeedbackCardProps {
  feedback: Feedback
  onVote?: (id: string) => void
  isVoting?: boolean
}

export function FeedbackCard({ feedback, onVote, isVoting = false }: FeedbackCardProps) {
  const [localVotes, setLocalVotes] = useState(feedback.votes)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = async () => {
    if (hasVoted || isVoting) return
    
    // Optimistic update
    setLocalVotes(prev => prev + 1)
    setHasVoted(true)
    
    try {
      await onVote?.(feedback.id)
    } catch (error) {
      // Revert on error
      setLocalVotes(prev => prev - 1)
      setHasVoted(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
              {feedback.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={feedback.status} />
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {feedback.category}{feedback.subCategory ? ` → ${feedback.subCategory}` : ''}
              </Badge>
              <div className="flex items-center text-sm text-gray-500 gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(feedback.submittedAt)}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVote}
            disabled={hasVoted || isVoting}
            className={`flex flex-col items-center min-w-[60px] h-16 p-2 ${
              hasVoted ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <ChevronUp className={`w-4 h-4 ${hasVoted ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${hasVoted ? 'text-blue-600' : 'text-gray-900'}`}>
              {localVotes}
            </span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 leading-relaxed line-clamp-3">
          {feedback.description}
        </p>
      </CardContent>

      {feedback.tags && feedback.tags.length > 0 && (
        <CardFooter className="pt-0 pb-4">
          <div className="flex flex-wrap gap-1">
            {feedback.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 