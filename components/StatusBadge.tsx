'use client'

import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/types"
import { STATUS_COLORS } from "@/lib/constants"

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClasses = STATUS_COLORS[status]
  
  return (
    <Badge 
      variant="outline" 
      className={`${colorClasses} ${className}`}
    >
      {status}
    </Badge>
  )
} 