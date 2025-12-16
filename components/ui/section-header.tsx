"use client"

import type { ReactNode } from "react"
import { Button } from "./button"
import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function SectionHeader({ title, action, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button variant="ghost" size="sm" onClick={action.onClick} className="gap-1">
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
