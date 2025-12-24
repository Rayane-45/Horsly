"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, DollarSign, Activity, Menu, X, LogIn, LogOut, Shield, PawPrint, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Training", href: "/training", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Santé", href: "/sante", icon: Activity },
]

export function AppBottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
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

  return (
    <>
      {/* Menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-up menu */}
      <div className={`fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4 space-y-2">
          {/* Mes Chevaux */}
          <Link
            href="/horses"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <PawPrint className="h-5 w-5" />
            <span className="font-medium">Mes Chevaux</span>
          </Link>

          {/* Profil */}
          {mounted && user && (
            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Mon Profil</span>
            </Link>
          )}

          {/* Connexion / Déconnexion */}
          {mounted && user ? (
            <button
              onClick={() => {
                signOut()
                setIsMenuOpen(false)
              }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors w-full text-left text-red-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          ) : (
            <Link
              href="/connexion"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Connexion</span>
            </Link>
          )}

          {/* Admin (si admin) */}
          {mounted && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-purple-500"
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Administration</span>
            </Link>
          )}

          {/* Email utilisateur */}
          {mounted && user && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground px-3">
                Connecté: {user.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 p-1 rounded-lg transition-colors min-w-[40px] min-h-[40px] ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{item.name}</span>
              </Link>
            )
          })}

          {/* Menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 p-1 rounded-lg transition-colors min-w-[40px] min-h-[40px] ${
              isMenuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="text-[10px] font-medium leading-tight">Plus</span>
          </button>
        </div>
      </nav>
    </>
  )
}
