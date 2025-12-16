"use client"

import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  subtitle: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

export function PageHeader({ title, subtitle, primaryAction }: PageHeaderProps) {
  return (
    <header className="py-6 lg:py-8 border-b border-border mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 text-balance">{title}</h1>
          <p className="text-sm lg:text-base text-muted-foreground text-pretty">{subtitle}</p>
        </div>
        {primaryAction && (
          <Button onClick={primaryAction.onClick} size="default" className="flex-shrink-0">
            {primaryAction.label}
          </Button>
        )}
      </div>
    </header>
  )
}
