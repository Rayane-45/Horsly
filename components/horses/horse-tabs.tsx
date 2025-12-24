"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Info, 
  Image as ImageIcon, 
  Apple, 
  HeartPulse, 
  FileText, 
  BookOpen 
} from "lucide-react"

export type HorseTabValue = "info" | "album" | "nutrition" | "health" | "documents" | "notes"

interface HorseTabsProps {
  activeTab: HorseTabValue
  onTabChange: (tab: HorseTabValue) => void
}

const tabs: { value: HorseTabValue; label: string; icon: React.ElementType }[] = [
  { value: "info", label: "Infos", icon: Info },
  { value: "album", label: "Album", icon: ImageIcon },
  { value: "nutrition", label: "Nutrition", icon: Apple },
  { value: "health", label: "Santé", icon: HeartPulse },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "notes", label: "Notes", icon: BookOpen },
]

export function HorseTabs({ activeTab, onTabChange }: HorseTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Scroll automatique vers l'onglet actif
  useEffect(() => {
    const container = tabsRef.current
    if (!container) return

    const activeButton = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement
    if (!activeButton) return

    // Calculer la position de l'indicateur
    const containerRect = container.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    
    setIndicatorStyle({
      left: activeButton.offsetLeft,
      width: buttonRect.width,
    })

    // Scroll horizontal pour centrer l'onglet actif
    const scrollLeft = activeButton.offsetLeft - container.offsetWidth / 2 + buttonRect.width / 2
    container.scrollTo({ left: scrollLeft, behavior: "smooth" })
  }, [activeTab])

  return (
    <div className="sticky top-[57px] z-30 bg-background border-b border-border">
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-6">
        <div 
          ref={tabsRef}
          className="flex overflow-x-auto scrollbar-hide relative sm:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
        {/* Indicateur animé */}
        <div 
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
        
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          
          return (
            <button
              key={tab.value}
              data-tab={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors min-w-fit",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span>{tab.label}</span>
            </button>
          )
        })}
        </div>
      </div>
    </div>
  )
}
