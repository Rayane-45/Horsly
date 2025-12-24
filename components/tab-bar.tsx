"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, DollarSign, Calendar, Activity, Heart } from "lucide-react"

const tabs = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Entraînements", href: "/training", icon: Calendar },
  { name: "Santé", href: "/sante", icon: Activity },
  { name: "Chevaux", href: "/horses", icon: Heart },
]

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-primary/20 safe-area-inset-bottom md:bg-card md:border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center justify-center p-3 rounded-2xl transition-colors ${
                isActive 
                  ? "text-primary-foreground bg-white/20" 
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
