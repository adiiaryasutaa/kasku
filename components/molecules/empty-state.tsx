"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center p-8">
      <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
