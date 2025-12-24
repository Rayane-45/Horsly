import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/admin/check - Vérifier si l'utilisateur est admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    // Récupérer les métadonnées de l'utilisateur
    const { data: userData, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) {
      // Si la table profiles n'existe pas ou pas de rôle, vérifier l'email
      // Pour l'instant, on considère que certains emails sont admin
      const adminEmails = [
        "admin@cavaly.com",
        "rayane.sdlhh@gmail.com",
      ]
      
      const isAdmin = adminEmails.includes(user.email || "")
      return NextResponse.json({ isAdmin })
    }

    const isAdmin = userData?.role === "admin"
    return NextResponse.json({ isAdmin })
  } catch (error: any) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
