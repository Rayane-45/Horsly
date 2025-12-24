"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, DollarSign, Activity, ChevronLeft, ChevronRight, Home as Horse, LogIn, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Mes Chevaux", href: "/horses", icon: Horse },
  { name: "Entraînements", href: "/training", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Santé", href: "/sante", icon: Activity },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sidebar:collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [])

  // Check admin status
  useEffect(() => {
    if (user) {
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false))
    } else {
      setIsAdmin(false)
    }
  }, [user])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar:collapsed", String(newState))
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
          {isCollapsed ? (
            <Image src="/logo.png" alt="Cavaly" width={48} height={24} className="object-contain" />
          ) : (
            <Image src="/logo.png" alt="Cavaly" width={120} height={48} className="object-contain" />
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-2" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px] ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="border-t border-sidebar-border my-2"></div>

          {/* Profile Link - affiché uniquement après montage pour éviter l'hydratation */}
          {mounted && user && (
            <Link
              href="/profile"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px] ${
                pathname === "/profile"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10"
              }`}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Mon profil</span>}
            </Link>
          )}

          {/* Connexion Link */}
          <Link
            href="/connexion"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px] ${
              pathname === "/connexion"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10"
            }`}
          >
            <LogIn className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Connexion</span>}
          </Link>

          {/* Admin Link (only for admins) - affiché uniquement après montage */}
          {mounted && isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px] ${
                pathname === "/admin"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10"
              }`}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Administration</span>}
            </Link>
          )}
        </nav>

        {/* Toggle Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center gap-2 min-h-[44px]"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Réduire</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
