import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

// GET /api/admin/users - Récupérer tous les utilisateurs avec leurs données
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const adminEmails = ["admin@cavaly.com", "rayane.sdlhh@gmail.com"]
    
    // Ou vérifier via la table profiles si elle existe
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profileData?.role === "admin" || adminEmails.includes(user.email || "")

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Utiliser le client admin pour contourner le RLS
    const adminClient = getSupabaseAdminClient()
    
    // Si le client admin n'est pas disponible, utiliser le client normal avec fallback
    const queryClient = adminClient || supabase

    // Récupérer tous les utilisateurs
    let allUsers: any[] = []
    
    if (adminClient) {
      // Avec le client admin, on peut accéder directement à auth.users
      const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()
      
      if (!authError && authUsers) {
        allUsers = authUsers.users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        }))
      }
    }
    
    // Fallback si pas de client admin ou erreur
    if (allUsers.length === 0) {
      // Essayer la fonction RPC
      const { data: rpcUsers, error: rpcError } = await supabase.rpc("get_all_users_admin")
      
      if (!rpcError && rpcUsers) {
        allUsers = rpcUsers
      } else {
        // Dernier fallback: récupérer les user_id des tables
        const { data: horseUserIds } = await queryClient
          .from("horses")
          .select("user_id")
        
        const { data: expenseUserIds } = await queryClient
          .from("expenses")
          .select("user_id")
        
        const uniqueUserIds = [...new Set([
          user.id, // Toujours inclure l'utilisateur courant
          ...(horseUserIds || []).map((h: any) => h.user_id),
          ...(expenseUserIds || []).map((e: any) => e.user_id),
        ])]
        
        allUsers = uniqueUserIds.map(id => ({
          id,
          email: id === user.id ? user.email : `Utilisateur ${id.slice(0, 8)}...`,
          created_at: new Date().toISOString(),
        }))
      }
    }

    // Récupérer tous les chevaux (avec client admin si disponible)
    const { data: horses, error: horsesError } = await queryClient
      .from("horses")
      .select("id, name, breed, user_id")

    if (horsesError) {
      console.error("Error fetching horses:", horsesError)
    }

    // Récupérer toutes les dépenses (avec client admin si disponible)
    const { data: expenses, error: expensesError } = await queryClient
      .from("expenses")
      .select("id, amount, category, expense_date, user_id")

    if (expensesError) {
      console.error("Error fetching expenses:", expensesError)
    }

    console.log("Admin API - Users found:", allUsers.length)
    console.log("Admin API - Horses found:", horses?.length || 0)
    console.log("Admin API - Expenses found:", expenses?.length || 0)

    // Grouper les données par utilisateur
    const users = (allUsers || []).map((authUser: any) => {
      const userHorses = (horses || []).filter((h) => h.user_id === authUser.id)
      const userExpenses = (expenses || []).filter((e) => e.user_id === authUser.id)
      const totalExpenses = userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        horses: userHorses,
        expenses: userExpenses.slice(0, 5),
        totalExpenses,
      }
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
