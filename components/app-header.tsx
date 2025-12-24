"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Plus, LogIn, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginDialog } from "@/components/auth/login-dialog"
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useProfile } from "@/contexts/profile-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppHeaderProps {
  title?: string
  showSearch?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
}

export function AppHeader({ title, showSearch = false, showAddButton = false, onAddClick }: AppHeaderProps) {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (!user?.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name
    if (profile?.username) return `@${profile.username}`
    return "Cavalier"
  }

  return (
    <>
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

            {/* Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={getDisplayName()} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginDialog(true)}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <ChangePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </>
  )
}
