"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface ListItemProps {
  icon?: LucideIcon
  image?: string
  title: string
  subtitle?: string
  meta?: string
  actions?: ReactNode
  onClick?: () => void
}

export function ListItem({ icon: Icon, image, title, subtitle, meta, actions, onClick }: ListItemProps) {
  const Component = onClick ? "button" : "div"

  return (
    <Component
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        onClick ? "hover:bg-accent cursor-pointer w-full text-left" : ""
      }`}
    >
      {/* Icon or Image */}
      {Icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
      {image && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted overflow-hidden">
          <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>

      {/* Meta & Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
        {actions}
      </div>
    </Component>
  )
}
