"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2, AtSign, Mail } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [identifier, setIdentifier] = useState("") // Email ou pseudo
  const [email, setEmail] = useState("") // Pour l'inscription uniquement
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Résoudre le pseudo en email si nécessaire
  const resolveIdentifier = async (id: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/resolve-identifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Identifiant invalide")
      }

      return data.email
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de la résolution de l'identifiant")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        toast({
          title: "Erreur",
          description: "Service d'authentification non disponible",
          variant: "destructive",
        })
        return
      }

      if (isSignUp) {
        // Inscription: utiliser l'email directement
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error

        toast({
          title: "Compte créé",
          description: "Vérifiez votre email pour confirmer votre compte",
        })
        onOpenChange(false)
      } else {
        // Connexion: résoudre l'identifiant (email ou pseudo) en email
        const resolvedEmail = await resolveIdentifier(identifier)
        
        if (!resolvedEmail) {
          throw new Error("Identifiant non trouvé")
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password,
        })

        if (error) throw error

        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        })
        onOpenChange(false)
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset les champs quand on change de mode
  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setIdentifier("")
    setEmail("")
    setPassword("")
    setFullName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Créer un compte" : "Connexion"}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Créez votre compte pour gérer vos chevaux"
              : "Connectez-vous avec votre email ou pseudo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                autoComplete="name"
              />
            </div>
          )}
          
          {isSignUp ? (
            // Mode inscription: champ email classique
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          ) : (
            // Mode connexion: email OU pseudo
            <div className="space-y-2">
              <Label htmlFor="identifier">
                <span className="flex items-center gap-1.5">
                  Email ou pseudo
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  placeholder="email@exemple.com ou pseudo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {identifier.includes("@") ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <AtSign className="h-4 w-4" />
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Utilisez votre adresse email ou votre pseudo (@username)
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? "Créer le compte" : "Se connecter"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={toggleMode}
            disabled={loading}
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Créer un compte"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
