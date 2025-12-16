"use client"

import Image from "next/image"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  title?: string
  showSearch?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
}

export function AppHeader({ title, showSearch = false, showAddButton = false, onAddClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="Cavaly" width={80} height={32} className="object-contain flex-shrink-0" />
          {title && <h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showSearch && (
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-2xl">
              <Search className="h-5 w-5" />
            </Button>
          )}
          {showAddButton && (
            <Button
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl"
              onClick={onAddClick}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
