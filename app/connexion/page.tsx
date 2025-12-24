"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ConnexionPage() {
  const { user, signIn, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Cavaly !",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <AppLayout pageTitle="Connexion" pageSubtitle="Gérer votre compte">
        <Card className="p-8 max-w-md mx-auto">
          <div className="text-center space-y-6">
            <div>
              <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Connecté en tant que</h3>
              <p className="text-muted-foreground mt-2">{user.email}</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleSignOut} 
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Déconnexion...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Connexion" pageSubtitle="Accédez à votre compte Cavaly">
      <Card className="p-8 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Connexion</h3>
            <p className="text-muted-foreground mt-2">
              Connectez-vous pour gérer vos chevaux
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="bg-card border-border text-foreground"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card border-border text-foreground"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </AppLayout>
  )
}
