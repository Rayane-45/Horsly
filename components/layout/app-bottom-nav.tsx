"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, DollarSign, Activity } from "lucide-react"

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Entraînements", href: "/training", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Santé", href: "/sante", icon: Activity },
]

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
