import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardSectionProps {
  title: string
  action?: {
    label: string
    href: string
  }
  children: ReactNode
  emptyState?: {
    message: string
    actionLabel: string
    actionHref: string
  }
  isEmpty?: boolean
}

export function DashboardSection({ title, action, children, emptyState, isEmpty }: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h2>
        {action && (
          <Link href={action.href}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 -mr-2">
              {action.label}
            </Button>
          </Link>
        )}
      </div>

      {isEmpty && emptyState ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground mb-4">{emptyState.message}</p>
          <Link href={emptyState.actionHref}>
            <Button variant="outline">{emptyState.actionLabel}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  )
}
