"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Search, User, DollarSign, Activity } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  email: string
  created_at: string
  horses: Array<{
    id: string
    name: string
    breed: string
  }>
  expenses: Array<{
    id: string
    amount: number
    category: string
    expense_date: string
  }>
  totalExpenses: number
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion")
      return
    }

    if (user) {
      checkAdminAndFetchData()
    }
  }, [user, authLoading])

  const checkAdminAndFetchData = async () => {
    try {
      // Vérifier si l'utilisateur est admin
      const adminCheckResponse = await fetch("/api/admin/check")
      const adminCheck = await adminCheckResponse.json()

      if (!adminCheck.isAdmin) {
        toast({
          title: "Accès refusé",
          description: "Cette page est réservée aux administrateurs",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setIsAdmin(true)

      // Récupérer les données des utilisateurs
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des données")
      }

      setUsers(data.users)
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

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsers = users.length
  const totalHorses = users.reduce((sum, u) => sum + u.horses.length, 0)
  const totalExpenses = users.reduce((sum, u) => sum + u.totalExpenses, 0)

  if (authLoading || loading) {
    return (
      <AppLayout pageTitle="Administration" pageSubtitle="Gestion des utilisateurs">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <AppLayout pageTitle="Administration" pageSubtitle="Vue d'ensemble des utilisateurs">
      <div className="space-y-6">
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chevaux</p>
                <p className="text-2xl font-bold text-foreground">{totalHorses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dépenses totales</p>
                <p className="text-2xl font-bold text-foreground">{totalExpenses.toFixed(0)}€</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur par email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border-border text-foreground"
            />
          </div>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Chevaux</TableHead>
                  <TableHead className="text-right">Dépenses totales</TableHead>
                  <TableHead>Dernières dépenses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.horses.length === 0 ? (
                            <span className="text-muted-foreground text-sm">Aucun</span>
                          ) : (
                            user.horses.slice(0, 2).map((horse) => (
                              <Badge key={horse.id} variant="secondary" className="text-xs">
                                {horse.name}
                              </Badge>
                            ))
                          )}
                          {user.horses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.horses.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        {user.totalExpenses.toFixed(0)}€
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.expenses.length === 0 ? (
                            <span className="text-muted-foreground text-sm">Aucune</span>
                          ) : (
                            user.expenses.slice(0, 3).map((expense) => (
                              <Badge
                                key={expense.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {expense.amount.toFixed(0)}€
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
